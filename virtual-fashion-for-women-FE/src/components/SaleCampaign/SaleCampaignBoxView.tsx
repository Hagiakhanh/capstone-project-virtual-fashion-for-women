'use client';

import React, { useEffect, useState } from 'react';
import { ResponseGetShortSaleCampaignDetail } from '@/models/ResponseGetShortSaleCampaignDetail';
import { apiToken } from '@/api/instance';
import { ProductInSaleDTO } from '@/models/ProductInSaleDTO'; // Sử dụng ProductInSaleDTO của bạn
import ProductItem from '../Product/ProductItem';

interface SaleCampaignBoxViewProps {
    campaignData: ResponseGetShortSaleCampaignDetail;
}

// Hàm format ngày tháng: Tách lấy phần ngày/tháng (ví dụ: 2025-10-16T... -> 16/10)
const formatDate = (dateString: string) => {
    if (!dateString || typeof dateString !== 'string') return 'N/A';
    // Lấy phần ngày (trước T nếu có)
    const datePart = dateString.split('T')[0];
    const parts = datePart.split('-'); 
    if (parts.length === 3) {
        const [year, month, day] = parts;
        return `${day}/${month}`;
    }
    return dateString;
};

export const SaleCampaignBoxView = ({ campaignData }: SaleCampaignBoxViewProps) => {
    // Lưu trữ productId đang loading (string) hoặc null.
    const [loadingSaleCampaignId, setLoadingSaleCampaignId] = useState<string | null>(null);
    // Danh sách sản phẩm được áp dụng chiến dịch
    const [listProduct, setListProduct] = useState<ProductInSaleDTO[]>([])
    // State riêng để quản lý loading chung khi fetch list sản phẩm
    const [isFetchingProducts, setIsFetchingProducts] = useState<boolean>(true);

    const fetchListProduct = async () => {
        if (!campaignData.campaignId) return;

        setIsFetchingProducts(true);
        try {
            const response = await apiToken.get("productInSaleCampaign/campaign/" + campaignData.campaignId);
            const responseData = response.data;
            
            if (responseData && Array.isArray(responseData.data)) {
                setListProduct(responseData.data as ProductInSaleDTO[]);
            } else {
                setListProduct([]);
            }
        } catch (error) {
            console.error("Error fetching product list:", error);
            setListProduct([]);
        } finally {
            setIsFetchingProducts(false);
        }
    }
    
    // Gọi API khi component mount hoặc campaignId thay đổi
    useEffect(() => {
        fetchListProduct();
    }, [campaignData.campaignId]);

    const handleWishlistSuccess = (productId: string, newWishlistStatus: boolean) => {
        setListProduct(prevList => 
            prevList.map(item => {
                // Kiểm tra xem đây có phải là sản phẩm cần cập nhật không
                if (item.productId === productId) {
                    // Cần đảm bảo cập nhật thuộc tính isInWishlist trong đối tượng product lồng bên trong
                    return {
                        ...item,
                        product: {
                            ...item.product,
                            isInWishlist: newWishlistStatus,
                        },
                    };
                }
                return item;
            })
        );
        console.log(`Wishlist updated for product ${productId}. Status: ${newWishlistStatus}`);
    };

    // Hàm set loading cho ProductItemHome (để hiển thị overlay khi Add to Cart/Wishlist)
    const handleSetLoading = (loading: boolean, productId: string | null = null) => {
        setLoadingSaleCampaignId(loading ? productId : null);
    };

    return (
        <div className="my-10">
            
            {/* Banner và Tiêu đề Chiến dịch */}
            <div className="mb-8">
                <div className="relative w-full h-48 sm:h-64 md:h-80 lg:h-96 overflow-hidden rounded-xl shadow-lg">
                    <img
                        src={campaignData.imageUrl}
                        alt={campaignData.campaignName}
                        className="w-full h-full object-cover"
                        // Thêm loading/fallback cho ảnh nếu cần
                    />
                    <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-6 text-white">
                        <h1 className="text-3xl sm:text-4xl font-extrabold mb-1">{campaignData.campaignName}</h1>
                        <p className="text-sm mt-1">
                            Thời gian: **{formatDate(campaignData.startDate)}** - **{formatDate(campaignData.endDate)}**
                        </p>
                    </div>
                </div>
            </div>

            <hr className="mb-8" />

            {/* Danh sách Sản phẩm */}
            <h2 className="text-2xl font-bold mb-6">Sản phẩm áp dụng</h2>
            
            {isFetchingProducts ? (
                // Loading chung cho cả danh sách
                <div className="text-center py-10 text-xl text-gray-600">
                    <p>Đang tải danh sách sản phẩm...</p>
                    {/* Có thể thêm spinner ở đây */}
                </div>
            ) : listProduct.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                    {listProduct.map((item) => {
                        // **Chuẩn hóa dữ liệu cho ProductItemHome**
                        const productWithSale = {
                            ...item.product,
                            // Ghi đè hoặc thêm thông tin sale từ ProductInSaleDTO vào đối tượng product
                            percentDiscount: item.percentDiscount,
                            salePrice: item.salePrice,
                            priceAtTime: item.salePrice, // Cập nhật giá bán tại thời điểm này là giá sale
                            price: item.product.price, // Giữ lại giá gốc
                            productId: item.productId // Đảm bảo productId đúng
                        };

                        return (
                            <div key={item.productId} className="relative">
                                <ProductItem
                                    product={productWithSale}
                                    onWishlistSuccess={handleWishlistSuccess}
                                    setLoading={(loading: boolean) => handleSetLoading(loading, item.productId)} 
                                />
                                
                                {loadingSaleCampaignId === item.productId && (
                                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-2xl z-50">
                                         <span className="text-lg font-semibold text-gray-800">Đang tải...</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                 // Không có sản phẩm
                <div className="text-center py-10 text-xl text-gray-500">
                    <p>Hiện không có sản phẩm nào áp dụng cho chiến dịch này.</p>
                </div>
            )}
        </div>
    );
}