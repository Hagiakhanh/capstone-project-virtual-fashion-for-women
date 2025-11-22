'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation'; 
import { apiToken } from '@/api/instance';
import { ResponseGetShortSaleCampaignDetail } from '@/models/ResponseGetShortSaleCampaignDetail';
import { ProductInSaleDTO } from '@/models/ProductInSaleDTO';
import { Pagination } from 'antd';
import ProductItem from '@/components/Product/ProductItem';
import formatDate from "@/utils/formatDate";
import CampaignCountdown from '@/components/SaleCampaign/SaleCampaignCountDown';
const PAGE_SIZE = 20;

export default function SaleCampaignDetail () {
    const params = useParams();
    const campaignId = params.campaignId as string; 

    const [campaignData, setCampaignData] = useState<ResponseGetShortSaleCampaignDetail | null>(null);
    const [listProduct, setListProduct] = useState<ProductInSaleDTO[]>([]);
    const [totalProducts, setTotalProducts] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [loadingProductId, setLoadingProductId] = useState<string | null>(null);
    const [isCampaignExpired, setIsCampaignExpired] = useState<boolean>(false);

    // 2. Hàm gọi API chi tiết chiến dịch
    const fetchCampaignDetail = useCallback(async () => {
        if (!campaignId) return;

        try {
            const response = await apiToken.get(`/salecampaign/${campaignId}`);
            if (response.data && response.data.data) {
                setCampaignData(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching campaign details:", error);
            setCampaignData(null);
        }
    }, [campaignId]);

    // 3. Hàm gọi API danh sách sản phẩm theo trang
    const fetchListProduct = useCallback(async (pageIndex: number) => {
        if (!campaignId) return;

        setIsLoading(true);
        try {
            // Cập nhật API endpoint để thêm pagination
            const response = await apiToken.get("productInSaleCampaign/campaign/"+campaignId, {
                params: {
                    pageIndex: pageIndex,
                    pageSize: PAGE_SIZE
                }
            });
            const responseData = response.data;
            
            if (responseData && Array.isArray(responseData.data)) {
                setListProduct(responseData.data as ProductInSaleDTO[]);
                setTotalProducts(responseData.totalRecords || 0); // Giả sử API trả về totalCount
            } else {
                setListProduct([]);
                setTotalProducts(0);
            }
        } catch (error) {
            console.error("Error fetching product list:", error);
            setListProduct([]);
            setTotalProducts(0);
        } finally {
            setIsLoading(false);
        }
    }, [campaignId]);
    useEffect(() => {
        if (!campaignData?.endDate) return;
      
        const checkExpired = () => {
          const end = new Date(campaignData.endDate);
          end.setHours(23, 59, 59, 999); // hết cuối ngày
      
          const now = new Date();
          setIsCampaignExpired(now > end);
        };
      
        checkExpired(); // kiểm tra ngay khi load
      
        const interval = setInterval(checkExpired, 1000); // cập nhật mỗi giây
      
        return () => clearInterval(interval);
      }, [campaignData]);
    // Gọi API chi tiết và sản phẩm khi component mount hoặc campaignId/page thay đổi
    useEffect(() => {
        if (campaignId) {
            fetchCampaignDetail();
            fetchListProduct(currentPage);
        }
    }, [campaignId, currentPage, fetchCampaignDetail, fetchListProduct]);

    // Xử lý Wishlist Success (tái sử dụng logic cập nhật state từ component cha)
    const handleWishlistSuccess = (productId: string, newStatus: boolean) => {
        setListProduct(prevList => 
            prevList.map(item => {
                if (item.productId === productId) {
                    return {
                        ...item,
                        product: {
                            ...item.product,
                            isInWishlist: newStatus,
                        },
                    };
                }
                return item;
            })
        );
    };

    // Hàm set loading cho ProductItemHome
    const handleSetLoading = (loading: boolean, productId: string | null = null) => {
        setLoadingProductId(loading ? productId : null);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    if (!campaignId) {
        return <div className="container mx-auto px-4 my-10 text-center text-red-500">Thiếu ID chiến dịch.</div>;
    }
    
    if (isLoading && !campaignData && listProduct.length === 0) {
        return <div className="container mx-auto px-4 my-10 text-center text-xl text-gray-600">Đang tải chi tiết chiến dịch...</div>;
    }

    if (!campaignData) {
        return <div className="container mx-auto px-4 my-10 text-center text-red-500">Không tìm thấy chiến dịch.</div>;
    }

    return (
        <div className="container mx-auto px-4 my-10">
            {/* Banner và Tiêu đề Chiến dịch (Sử dụng dữ liệu từ campaignData) */}
            <div className="mb-8">
                <div className="relative w-full h-64 md:h-80 lg:h-96 overflow-hidden rounded-xl shadow-lg">
                    <img
                        src={campaignData.imageUrl}
                        alt={campaignData.campaignName}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-6 text-white">
                        <h1 className="text-4xl sm:text-5xl font-extrabold mb-2">{campaignData.campaignName}</h1>
                        <p className="text-md sm:text-lg">
                            Thời gian: {formatDate(campaignData.startDate)} - {formatDate(campaignData.endDate)}
                        </p>
                        <CampaignCountdown endDate={campaignData.endDate} />
                    </div>
                </div>
            </div>

            <hr className="mb-8" />

            {/* Danh sách Sản phẩm */}
            <h2 className="text-3xl font-bold mb-6">Sản phẩm áp dụng</h2>
            
            {isLoading && listProduct.length === 0 ? (
                <div className="text-center py-10 text-xl text-gray-600">
                    <p>Đang tải danh sách sản phẩm...</p>
                </div>
            ) : listProduct.length > 0 ? (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                        {listProduct.map((item) => {
                            // Chuẩn hóa dữ liệu cho ProductItemHome
                            const productWithSale = {
                                ...item.product,
                                percentDiscount: item.percentDiscount,
                                salePrice: item.salePrice,
                                priceAtTime: item.salePrice,
                                price: item.product.price, 
                                productId: item.productId,
                                isInWishlist: item.product.isInWishlist || false, 
                            };

                            return (
                                <div key={item.productId} className="relative">
                                    <ProductItem
                                        product={productWithSale}
                                        onWishlistSuccess={handleWishlistSuccess}
                                        setLoading={(loading: boolean) => handleSetLoading(loading, item.productId)} 
                                    />
                                    
                                    {/* Loading overlay cho từng sản phẩm */}
                                    {loadingProductId === item.productId && (
                                        <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-2xl z-50">
                                             <span className="text-lg font-semibold text-gray-800">Đang tải...</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    
                    {/* Pagination */}
                    {totalProducts > PAGE_SIZE && (
                        <div className="flex justify-center mt-12">
                            <Pagination 
                                current={currentPage}
                                pageSize={PAGE_SIZE}
                                total={totalProducts}
                                onChange={handlePageChange}
                                showSizeChanger={false} // Ẩn chọn pageSize
                            />
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-10 text-xl text-gray-500">
                    <p>Hiện không có sản phẩm nào áp dụng cho chiến dịch này.</p>
                </div>
            )}
        </div>
    );
}