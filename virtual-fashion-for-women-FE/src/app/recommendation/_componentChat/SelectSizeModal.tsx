"use client";
import React, { useState, useEffect } from "react";
import { Modal, Button, Flex, Typography } from "antd";
import { Minus, Plus } from "lucide-react";
import { ProductVariantDTO } from "@/models/ProductVariantDTO";
import formatPrice from "@/utils/formatPrice";
import { api } from "@/api/instance";
import SizeGuideModal from "@/components/Size/SizeGuideModal";
import { messageToast } from "@/helpers/toastHelper";
import { RightOutlined} from '@ant-design/icons';

const { Text, Title } = Typography;

interface SelectSizeModalProps {
  open: boolean;
  onClose: () => void;
  product: any | null;
  onConfirm: (variantId: string, variantName: string, quantity: number) => void;
  selectingProduct: Record<
    string,
    {
      productVariantId: string;
      quantity: number;
    }
  >;
}

export const SelectSizeModal: React.FC<SelectSizeModalProps> = ({
  open,
  onClose,
  product,
  onConfirm,
  selectingProduct,
}) => {
  const [selectedVariant, setSelectedVariant] =
    useState<ProductVariantDTO | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [sizeTable, setSizeTable] = useState(null);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  useEffect(() => {
    if (product && selectingProduct) {
      fetchSizeTable();
      const productColor = product.productColor || product.productColors?.[0];
      if (!productColor) return;

      const matched = selectingProduct[productColor.productColorId];

      if (matched?.productVariantId && productColor.productVariants) {
        const foundVariant = productColor.productVariants.find(
          (v: ProductVariantDTO) =>
            v.productVariantId === matched.productVariantId
        );

        if (foundVariant) {
          setSelectedVariant(foundVariant);
          setQuantity(matched.quantity || 1);
        }
      }
    }
  }, [product, selectingProduct, open]);

  const fetchSizeTable = async () => {
    if (!product?.categoryId) return;
    try {
       const response = await api.get(
          `categorysizetemplate/by-categoryid/${product?.categoryId}`
       );
       if (response.status === 200) {
          setSizeTable(response?.data);
       }
    } catch (error) {
       console.error('Lỗi khi lấy bảng size sản phẩm:', error);
    }
 }
  if (!product) return null;

  const productColor = product.productColor || product.productColors?.[0];

  return (
    <Modal
      open={open}
      onCancel={() => {
        onClose();
        setSelectedVariant(null);
        setQuantity(1);
      }}
      footer={null}
      centered
      width={600}
      title={
        <div className="flex items-center justify-between">
          <Title level={4} className="!mb-0">
            {product.productName}
          </Title>
        </div>
      }
    >
      <Flex vertical gap={16}>
        {/* Ảnh + Thông tin màu */}
        <Flex gap={16}>
          <img
            src={productColor?.noBgImgUrl || product.imageUrl}
            alt={product.productName}
            className="w-32 h-32 object-cover rounded-lg"
          />
          <Flex vertical justify="center">
            <Text strong>Màu: {productColor?.color?.colorName}</Text>

            {product.priceAtTime && product.priceAtTime < product.price ? (
              // Có giảm giá
              <div className="flex items-center gap-2">
                <Text type="warning" className="text-lg font-semibold">
                  {formatPrice(product.priceAtTime)} ₫
                </Text>
                <Text
                  type="secondary"
                  className="text-lg font-semibold line-through text-red-500"
                >
                  {formatPrice(product.price)} ₫
                </Text>
              </div>
            ) : (
              // Không giảm hoặc 2 giá bằng nhau
              <Text type="warning" className="text-lg font-semibold">
                {formatPrice(product.price)} ₫
              </Text>
            )}
          </Flex>
        </Flex>

        {/* Chọn size */}
        <div>
          
          <Text strong className="block mb-2">
            Chọn size:
          </Text>
          

          <Flex wrap gap={8}>
            {productColor?.productVariants?.map(
              (variant: ProductVariantDTO) => (
                <Button
                  key={variant.productVariantId}
                  type={
                    selectedVariant?.productVariantId ===
                    variant.productVariantId
                      ? "primary"
                      : "default"
                  }
                  disabled={variant.quantity === 0}
                  onClick={() => {
                    setSelectedVariant(variant);
                    setQuantity(1);
                  }}
                  className="min-w-[70px]"
                >
                  {variant.sizeDto?.sizeCode}
                  {variant.quantity === 0 && (
                    <Text type="secondary" className="text-xs block">
                      Hết hàng
                    </Text>
                  )}
                </Button>
              )
            )}
          </Flex>
          <div className="flex gap-2 mt-3 items-center">
                     <p
                        className='text-sm lg:text-xl font-normal underline cursor-pointer hover:text-blue-600 transition-colors'
                        onClick={() => {
                           if (sizeTable) {
                              setIsSizeGuideOpen(true);
                           } else {
                              messageToast.info("Sản phẩm này chưa có bảng size chi tiết.");
                           }
                        }}
                     >
                        Hướng dẫn chọn kích thước
                     </p>
                     <RightOutlined className="text-xs lg:text-sm" />
                  </div>
        </div>
        

        {/* Chọn số lượng */}
        {selectedVariant && (
          <div>
            <Text strong className="block mb-2">
              Số lượng:
            </Text>
            <Flex align="center" gap={12}>
              <Button
                icon={<Minus />}
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              />
              <Text className="text-lg font-semibold w-10 text-center">
                {quantity}
              </Text>
              <Button
                icon={<Plus />}
                onClick={() =>
                  setQuantity(Math.min(selectedVariant.quantity, quantity + 1))
                }
              />
              <Text type="secondary">
                (Còn {selectedVariant.quantity} sản phẩm)
              </Text>
            </Flex>
          </div>
        )}

        {/* Xác nhận */}
        <Button
          type="primary"
          block
          disabled={!selectedVariant}
          onClick={() => {
            if (selectedVariant) {
              onConfirm(
                selectedVariant.productVariantId,
                selectedVariant.variantName,
                quantity
              );
              onClose();
              setSelectedVariant(null);
              setQuantity(1);
            }
          }}
        >
          {selectedVariant ? "Xác nhận chọn" : "Vui lòng chọn size"}
        </Button>
      </Flex>
      <SizeGuideModal
            isOpen={isSizeGuideOpen}
            onClose={() => setIsSizeGuideOpen(false)}
            categoryId={product?.categoryId}
         />
    </Modal>
  );
};
