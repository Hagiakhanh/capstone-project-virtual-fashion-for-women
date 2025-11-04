"use client";
import React, { useEffect, useState } from "react";
import { Table, Tag, Image, Space, Button } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { apiToken } from "@/api/instance";

interface SaleCampaign {
  CampaignID: number;
  CampaignName: string;
  Description?: string;
  StartDate: string;
  EndDate: string;
  CreatedAt: string;
  Status: "Active" | "Pending" | "Inactive" | "Expired";
  ImageUrl?: string;
}

const statusColorMap: Record<SaleCampaign["Status"], string> = {
  Active: "green",
  Pending: "gold",
  Inactive: "default",
  Expired: "red",
};

export const SaleCampaignTable: React.FC = () => {
  const [data, setData] = useState<SaleCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 5,
    total: 0,
  });

  useEffect(() => {
    fetchData(pagination.current!, pagination.pageSize!);
  }, [pagination.current, pagination.pageSize]);

  const fetchData = async (page: number, pageSize: number) => {
    setLoading(true);

    try {
      // Giả lập API – bạn thay bằng API thật (vd: /api/sale-campaigns?page=1&pageSize=5)
      const res = await apiToken.get(
        `/salecampaign?pageIndex=${page}&pageSize=${pageSize}`
      );
      const data = res.data;
      setData(data?.data || []);
      setPagination({
        ...pagination,
        total: data.totalRecords || 0,
      });
    } catch (error) {
      console.error("Fetch sale campaigns error:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<SaleCampaign> = [
    {
      title: "Hình ảnh",
      dataIndex: "ImageUrl",
      key: "image",
      render: (url) =>
        url ? (
          <Image
            src={url}
            alt="campaign"
            width={60}
            height={60}
            style={{ objectFit: "cover", borderRadius: 8 }}
          />
        ) : (
          <Tag color="default">Không có</Tag>
        ),
    },
    {
      title: "Tên chiến dịch",
      dataIndex: "CampaignName",
      key: "name",
      render: (text) => <b>{text}</b>,
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "StartDate",
      key: "start",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "EndDate",
      key: "end",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Trạng thái",
      dataIndex: "Status",
      key: "status",
      render: (status: SaleCampaign["Status"]) => (
        <Tag color={statusColorMap[status]}>{status}</Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            onClick={() => console.log("View", record.CampaignID)}
          >
            Xem
          </Button>
          <Button
            type="link"
            onClick={() => console.log("Edit", record.CampaignID)}
          >
            Sửa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Table<SaleCampaign>
      columns={columns}
      dataSource={data}
      loading={loading}
      rowKey="CampaignID"
      pagination={{
        ...pagination,
        showSizeChanger: true,
        onChange: (page, pageSize) =>
          setPagination({
            ...pagination,
            current: page,
            pageSize,
          }),
      }}
    />
  );
};
