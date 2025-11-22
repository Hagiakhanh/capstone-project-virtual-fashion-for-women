"use client";

import React, { useEffect, useState } from "react";
import { ResponseGetShortSaleCampaignDetail } from "@/models/ResponseGetShortSaleCampaignDetail";
import { apiToken } from "@/api/instance";
import { ProductInSaleDTO } from "@/models/ProductInSaleDTO"; // Sử dụng ProductInSaleDTO của bạn
import ProductItem from "../Product/ProductItem";
import formatDate from "@/utils/formatDate";
import CampaignCountdown from "./SaleCampaignCountDown";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { RightOutlined } from "@ant-design/icons";
import ProductItemSkeleton from "../Product/ProductItemSkeleton";

interface SaleCampaignBoxViewProps {
  campaignData: ResponseGetShortSaleCampaignDetail;
}

export const SaleCampaignBoxView = ({
  campaignData,
}: SaleCampaignBoxViewProps) => {
  const [loadingSaleCampaignId, setLoadingSaleCampaignId] = useState<
    string | null
  >(null);
  const [listProduct, setListProduct] = useState<ProductInSaleDTO[]>([]);
  const [isFetchingProducts, setIsFetchingProducts] = useState<boolean>(true);
  const router = useRouter();
  const fetchListProduct = async () => {
    if (!campaignData.campaignId) return;

    setIsFetchingProducts(true);
    try {
      const response = await apiToken.get(
        "productInSaleCampaign/campaign/" + campaignData.campaignId,
        {
          params: {
            pageSize: 5,
            pageIndex: 1,
          },
        }
      );
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
  };

  // Gọi API khi component mount hoặc campaignId thay đổi
  useEffect(() => {
    fetchListProduct();
  }, [campaignData.campaignId]);

  const handleWishlistSuccess = (
    productId: string,
    newWishlistStatus: boolean
  ) => {
    setListProduct((prevList) =>
      prevList.map((item) => {
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
    console.log(
      `Wishlist updated for product ${productId}. Status: ${newWishlistStatus}`
    );
  };

  // Hàm set loading cho ProductItemHome (để hiển thị overlay khi Add to Cart/Wishlist)
  const handleSetLoading = (
    loading: boolean,
    productId: string | null = null
  ) => {
    setLoadingSaleCampaignId(loading ? productId : null);
  };

  return (
    <div className="my-10">
      {/* Banner và Tiêu đề Chiến dịch */}
      <div className="mb-8">
        <motion.div
          className="relative w-full h-48 sm:h-64 md:h-80 lg:h-96 overflow-hidden rounded-xl shadow-lg cursor-pointer"
          onClick={() => router.push(`/campaigns/${campaignData.campaignId}`)}
          whileHover="hover"
          initial="rest"
          animate="rest"
        >
          <img
            src={campaignData.imageUrl}
            alt={campaignData.campaignName}
            className="w-full h-full object-cover"
          />

          {/* Layer overlay */}
          <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-6 text-white">
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-1">
              {campaignData.campaignName}
            </h1>
            <p className="text-sm mt-1">
              Thời gian: {formatDate(campaignData.startDate)} -{" "}
              {formatDate(campaignData.endDate)}
            </p>
            <CampaignCountdown endDate={campaignData.endDate} />
          </div>

          {/* Text hover "Xem chi tiết" */}
          <motion.div
            variants={{
              rest: { opacity: 0, y: 10 },
              hover: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute bottom-6 right-6 flex items-center gap-2 bg-white/90 text-black px-4 py-2 rounded-full shadow-lg"
          >
            <span className="font-semibold">Xem chi tiết</span>
            <motion.span
              variants={{
                rest: { x: 0 },
                hover: { x: 6 },
              }}
              transition={{
                repeat: Infinity,
                repeatType: "reverse",
                duration: 0.6,
              }}
            >
              <RightOutlined />
            </motion.span>
          </motion.div>
        </motion.div>
      </div>

      <hr className="mb-8" />

      {/* Danh sách Sản phẩm */}
      <h2 className="text-2xl font-bold mb-6">Sản phẩm áp dụng</h2>

      {isFetchingProducts ? (
        // Loading chung cho cả danh sách
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <ProductItemSkeleton key={index} />
          ))}
        </div>
      ) : listProduct.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {listProduct.map((item) => {
            const productWithSale = {
              ...item.product,
              percentDiscount: item.percentDiscount,
              salePrice: item.salePrice,
              priceAtTime: item.salePrice, // Cập nhật giá bán tại thời điểm này là giá sale
              price: item.product.price, // Giữ lại giá gốc
              productId: item.productId, // Đảm bảo productId đúng
            };

            return (
              <div key={item.productId} className="relative">
                <ProductItem
                  product={productWithSale}
                  onWishlistSuccess={handleWishlistSuccess}
                  setLoading={(loading: boolean) =>
                    handleSetLoading(loading, item.productId)
                  }
                />

                {loadingSaleCampaignId === item.productId && (
                  <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-2xl z-50">
                    <span className="text-lg font-semibold text-gray-800">
                      Đang tải...
                    </span>
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
};
