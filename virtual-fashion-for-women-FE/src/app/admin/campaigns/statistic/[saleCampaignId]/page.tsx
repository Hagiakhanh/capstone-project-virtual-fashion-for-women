"use client";

import React, { useEffect, useState } from "react";
import { Card, DatePicker, Spin, Row, Col, Statistic } from "antd";
import { useParams } from "next/navigation";
import { Line, Column } from "@ant-design/plots";
import dayjs from "dayjs";
import { api, apiToken } from "@/api/instance";
import {
  DollarOutlined,
  ShoppingCartOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import formatPrice from "@/utils/formatPrice";
import { messageToast } from "@/helpers/toastHelper";
import { Table, Image } from "antd";

const { RangePicker } = DatePicker;

// Định nghĩa types/interfaces
interface ProductVariant {
  key: string;
  name: string;
  soldQuantity: number;
  revenue: number;
  imageUrl: string;
}

interface ProductStatistic {
  key: string;
  productName: string;
  soldQuantity: number;
  revenue: number;
  imageUrl: string;
  variants: ProductVariant[];
}

interface ChartData {
  date: string;
  revenue: number;
}

export default function CampaignStatisticPage() {
  const { saleCampaignId } = useParams();
  const id = Number(saleCampaignId);

  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [campaignDate, setCampaignDate] = useState<{
    startDate: dayjs.Dayjs | null;
    endDate: dayjs.Dayjs | null;
  }>({
    startDate: null,
    endDate: null,
  });

  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [productData, setProductData] = useState<ProductStatistic[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalSold, setTotalSold] = useState(0);
  const [avgRevenue, setAvgRevenue] = useState(0);
  const [totalProductInSaleCampaign, setTotalProductInSaleCampaign] = useState(0);

  // 🔹 Gọi 1 lần để lấy chi tiết campaign trước
  useEffect(() => {
    const fetchCampaignDetail = async () => {
      try {
        const res = await apiToken.get(`/salecampaign/${id}`);
        const campaign = res.data;
        const start = dayjs(campaign.startDate);
        const end = dayjs(campaign.endDate);
        setCampaignDate({ startDate: start, endDate: end });
        setRange([start, end]); // set giá trị mặc định RangePicker
      } catch (error: any) {
        console.error(error);
        messageToast.error("Không thể tải thông tin chiến dịch");
        setLoading(false);
      }
    };
    fetchCampaignDetail();
  }, [id]);

  // 🔹 Khi range đã có -> fetch statistic
  useEffect(() => {
    if (range) fetchStatistic();
  }, [range]);

  const fetchStatistic = async () => {
    try {
      setLoading(true);
      const [start, end] = range!;

      const res = await api.get(`/salecampaign/${id}/statistic`, {
        params: {
          startDate: start.format("YYYY-MM-DD"),
          endDate: end.format("YYYY-MM-DD"),
        },
      });

      const data = res.data;
      setTotalProductInSaleCampaign(data.totalProductInCampaign|| 0);
      // 1. Map dữ liệu cho Biểu đồ Doanh thu theo ngày
      const mappedChart: ChartData[] =
        data.listSaleRevenueDate?.map((item: any) => ({
          date: dayjs(item.date).format("YYYY-MM-DD"),
          revenue: item.revenue,
        })) || [];

      // 2. Map dữ liệu cho Bảng và Biểu đồ Hiệu suất sản phẩm (SỬ DỤNG TRƯỜNG totalRevenue MỚI)
      const mappedProducts: ProductStatistic[] =
        data.listProductInCampaign?.map((p: any) => {
          // Lấy giá bán từ trường salePrice của sản phẩm cha
          const productSalePrice = p.salePrice || 0;

          // Tính toán doanh thu cho từng variant: soldQuantity * salePrice
          const variants: ProductVariant[] =
            p.listResponseProductVariant?.map((v: any) => ({
              key: v.productVariantId,
              name: v.productVariantName,
              soldQuantity: v.soldQuantity,
              revenue: (v.soldQuantity || 0) * productSalePrice,
              imageUrl: v.imageUrl,
            })) || [];

          return {
            key: p.productID,
            productName: p.productName,
            soldQuantity: p.totalSoldQuantity,
            revenue: p.totalRevenue || 0, // DÙNG TRỰC TIẾP totalRevenue TỪ API
            imageUrl: p.imageUrl,
            variants: variants,
          };
        }) || [];

      setChartData(mappedChart);
      setProductData(mappedProducts);
      setTotalRevenue(data.totalRevenue || 0);
      setTotalSold(data.totalSoldQuantity || 0);
      setAvgRevenue(data.averageRevenuePerDate || 0);
    } catch (error: any) {
      console.error(error);
      messageToast.error(
        error.response?.data?.message || "Không thể tải thống kê chiến dịch"
      );
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Config chart (Giữ nguyên)
  const revenueConfig = {
    data: chartData,
    xField: "date",
    yField: "revenue",
    smooth: true,
    color: "#1677ff",
    point: { size: 4, shape: "circle" },
    tooltip: {
      formatter: (v: any) => ({
        name: "Doanh thu",
        value: formatPrice(v.revenue) + " ₫",
      }),
    },
  };

  const productConfig = {
    data: productData,
    xField: "productName",
    yField: "soldQuantity",
    color: "#ff7a45",
    label: { position: "top" as const, style: { fill: "#000" } },
    tooltip: {
      formatter: (v: any) => ({
        name: "Số lượng bán",
        value: v.soldQuantity,
      }),
    },
  };

  if (loading || !range) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  // 🔹 Cấu hình cột cho bảng chi tiết biến thể (BẢNG CON)
  const variantColumns = [
    {
      title: "Ảnh biến thể",
      dataIndex: "imageUrl",
      key: "imageUrl",
      render: (url: string) => (
        <Image
          src={url}
          alt=""
          width={60}
          height={60}
          style={{ objectFit: "cover", borderRadius: 8 }}
        />
      ),
    },
    {
      title: "Tên biến thể",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Số lượng bán",
      dataIndex: "soldQuantity",
      key: "soldQuantity",
      align: "right" as const,
    },
    {
      title: "Doanh thu (₫)",
      dataIndex: "revenue",
      key: "revenue",
      align: "right" as const,
      render: (value: number) => value?.toLocaleString() || "0",
    },
  ];

  // 🔹 Cấu hình cột cho bảng chi tiết sản phẩm (BẢNG CHA)
  const productColumns = [
    {
      title: "Ảnh sản phẩm",
      dataIndex: "imageUrl",
      key: "imageUrl",
      render: (url: string) => (
        <Image
          src={url}
          alt=""
          width={70}
          height={70}
          style={{ objectFit: "cover", borderRadius: 8 }}
        />
      ),
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "productName",
      key: "productName",
    },
    {
      title: "Số lượng bán",
      dataIndex: "soldQuantity",
      key: "soldQuantity",
      align: "right" as const,
    },
    {
      title: "Doanh thu (₫)",
      dataIndex: "revenue",
      key: "revenue",
      align: "right" as const,
      render: (value: number) => value?.toLocaleString() || "0",
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-screen-xl mx-auto">
        <h1 className="text-3xl font-semibold mb-6 text-gray-800">
          Thống kê chiến dịch #{id}
        </h1>

        {/* Tổng quan nhanh */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} md={12} lg={8}>
            <Card>
              <Statistic
                title="Tổng doanh thu (₫)"
                value={totalRevenue}
                valueStyle={{ color: "#3f8600" }}
                prefix={<DollarOutlined />}
                formatter={(val) => val.toLocaleString()}
              />
            </Card>
          </Col>
          <Col xs={24} md={12} lg={8}>
            <Card>
              <Statistic
                title="Tổng sản phẩm bán"
                value={totalSold}
                prefix={<ShoppingCartOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} md={12} lg={8}>
            <Card>
              <Statistic
                title="Tổng sản phẩm trong chiến dịch"
                value={totalProductInSaleCampaign}
                valueStyle={{ color: "#3f8600" }}
                prefix={<TrophyOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Bộ lọc thời gian */}
        <Card className="mb-6">
          <div className="flex items-center gap-4">
            <span className="font-medium text-gray-700">Khoảng thời gian:</span>
            <RangePicker
              format="DD/MM/YYYY"
              value={range}
              placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
              disabledDate={(current) => {
                if (!campaignDate.startDate || !campaignDate.endDate)
                  return false;
                return (
                  current < campaignDate.startDate.startOf("day") ||
                  current > campaignDate.endDate.endOf("day")
                );
              }}
              onChange={(dates) => {
                if (dates) setRange(dates as [dayjs.Dayjs, dayjs.Dayjs]);
              }}
            />
          </div>
        </Card>

        {/* Chart */}
        <Row gutter={[16, 16]}>
          <Col span={24} md={24}>
            <Card title="Doanh thu chiến dịch theo ngày">
              <Line {...revenueConfig} height={300} />
            </Card>
          </Col>
        </Row>

        {/* Bảng chi tiết sản phẩm có expandable */}
        <Card title="Chi tiết doanh số sản phẩm" className="mt-6">
          <Table<ProductStatistic>
            dataSource={productData}
            pagination={false}
            columns={productColumns}
            expandable={{
              expandedRowRender: (record) => (
                <Table<ProductVariant>
                  dataSource={record.variants}
                  pagination={false}
                  size="small"
                  columns={variantColumns}
                />
              ),
              rowExpandable: (record) => record.variants.length > 0,
            }}
          />
        </Card>
      </div>
    </div>
  );
}
