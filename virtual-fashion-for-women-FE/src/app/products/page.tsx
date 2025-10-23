// import { ApiGetProducts } from "@/api/product/ProductAPI";
// import ProductCard from "@/components/Product/ProductCard";
// import { Spin } from "antd";
// import React from "react";

// type Product = {
//   id: number;
//   title: string;
//   price: number;
//   description: string;
//   category: string;
//   image: string;
// };

// export default async function ProductsListPage() {
//   // Gọi API trực tiếp từ server
//   const products: Product[] = await ApiGetProducts(1, 10); // giả sử ApiGetProducts nhận pageIndex & pageSize

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-6">Danh sách sản phẩm</h1>
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         {products?.map((product: Product) => (
//           <ProductCard key={product.id} product={product} />
//         ))}
//       </div>
//     </div>
//   );
// }

"use client";

import React, { useState } from "react";
import {
  Row,
  Col,
  Typography,
  Button,
  Space,
  Radio,
  InputNumber,
  Card,
} from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

const ProductDetailPage: React.FC = () => {
  const [size, setSize] = useState<string>("M");
  const [quantity, setQuantity] = useState<number>(1);

  return (
    <div className="bg-white p-10">
      <Row gutter={32}>
        {/* Hình ảnh sản phẩm */}
        <Col xs={24} md={12}>
          <Card
            bordered={false}
            cover={ 
              <img
                alt="product"
                src="/product.jpg" // thay bằng link ảnh thực tế
                className="rounded-xl object-cover"
              />
            }
          />
          {/* Thumbnail */}
          <div className="flex gap-4 mt-4">
            {[1, 2, 3, 4].map((i) => (
              <img
                key={i}
                src="/product.jpg"
                alt="thumb"
                className="w-16 h-16 border border-gray-200 rounded cursor-pointer object-cover"
              />
            ))}
          </div>
        </Col>

        {/* Thông tin sản phẩm */}
        <Col xs={24} md={12}>
          <div className="space-y-4">
            <Title level={2} className="!mt-0 !mb-2">
              CHÂN VÁY XUÔNG CẠP LIỀN
            </Title>
            <Text className="!mb-0">
              MSP: sdfjsjfsjdflsflskfsd-BL-M
            </Text>
            <Text strong className="text-red-500 text-xl">
              100.000 VND
            </Text>

            {/* Mô tả */}
            <Paragraph strong>THANH TAO</Paragraph>
            <Paragraph>
              Có những thiết kế không cần quá nhiều lời, chỉ cần vừa vặn với khí
              chất của người mặc là đã đủ chạm đến sự tinh tế...
            </Paragraph>

            <Paragraph strong>Thiết kế:</Paragraph>
            <Paragraph>
              Chân váy dáng xòe suông cơ bản, ôm nhẹ phần hông và buông thẳng từ
              phần hông đổ xuống gấu...
            </Paragraph>

            <Paragraph strong>Chất liệu:</Paragraph>
            <Paragraph>
              Vải poly weft stripe – có độ đứng phom, độ dày vừa phải, không
              nhăn...
            </Paragraph>

            {/* Màu sắc */}
            <div className="space-y-1">
              <Text>Màu sắc: Đen</Text>
              <div className="flex gap-2">
                <div className="w-6 h-6 bg-black rounded-full border border-gray-400 cursor-pointer"></div>
                <div className="w-6 h-6 bg-gray-500 rounded-full border border-gray-400 cursor-pointer"></div>
              </div>
            </div>

            {/* Size */}
            <div className="space-y-1">
              <Text>Chọn size: M</Text>
              <div>
                <Radio.Group
                value={size}
                onChange={(e) => setSize(e.target.value)}
                buttonStyle="solid"
                className="flex flex-wrap gap-2"
                >
                {["XXS", "XS", "S", "M", "L", "XL"].map((s) => (
                  <Radio.Button key={s} value={s}>
                    {s}
                  </Radio.Button>
                ))}
                </Radio.Group>
              </div>
            </div>

            {/* Số lượng */}
            <div className="space-y-1">
              <Text>Số lượng:</Text>
              <InputNumber
                min={1}
                value={quantity}
                onChange={(value) => setQuantity(value || 1)}
              />
            </div>

            {/* Nút hành động */}
            <div className="flex gap-3 pt-4">
              <Button size="large" className="rounded-xl">
                MẶC THỬ
              </Button>
              <Button
                size="large"
                icon={<ShoppingCartOutlined />}
                className="rounded-xl"
              >
                THÊM VÀO GIỎ HÀNG
              </Button>
              <Button type="primary" size="large" className="rounded-xl">
                MUA NGAY
              </Button>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default ProductDetailPage;
