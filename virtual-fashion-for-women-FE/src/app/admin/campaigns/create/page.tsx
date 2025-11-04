"use client";
import React, { useState } from "react";
import {
  Form,
  Input,
  DatePicker,
  Button,
  Upload,
  Select,
  InputNumber,
  Space,
  message,
  Card,
} from "antd";
import {
  UploadOutlined,
  PlusOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { AntButtonCommon } from "@/components/AntDesign/Button/AntButtonCommon";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { messageToast } from "@/helpers/toastHelper";
import { apiToken } from "@/api/instance";

const { RangePicker } = DatePicker;

const discountTypeOptions = [
  { label: "Phần trăm (%)", value: "PercentDiscount" },
  { label: "Giảm theo giá (₫)", value: "PriceDiscount" },
];

function CreateSaleCampaignPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("CampaignName", values.CampaignName);
      formData.append("Description", values.Description || "");

      // Gửi file (chỉ 1 ảnh)
      if (values.ImageFile?.[0]?.originFileObj) {
        formData.append("ImageFile", values.ImageFile[0].originFileObj);
      }

      // Convert ngày sang object { year, month, day, dayOfWeek }
      const [start, end] = values.DateRange;
      const toDateObj = (d: dayjs.Dayjs) => ({
        year: d.year(),
        month: d.month() + 1,
        day: d.date(),
        dayOfWeek: d.day(),
      });

      formData.append("StartDate", JSON.stringify(toDateObj(start)));
      formData.append("EndDate", JSON.stringify(toDateObj(end)));

      // Danh sách sản phẩm
      const products =
        values.ProductInSalesCampaigns?.map((p: any) => ({
          ProductID: p.ProductID,
          DiscountType: p.DiscountType,
          Value: p.Value,
        })) || [];
      formData.append("ProductInSalesCampaigns", JSON.stringify(products));

      const res = await apiToken.post("/api/salecampaign", {
        body: formData,
      });

      if (res.status != 200) throw new Error("Tạo chiến dịch thất bại");

      messageToast.success("Tạo chiến dịch thành công");
      router.push("/admin/campaigns");
    } catch (err: any) {
      console.error(err);
      message.error(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-screen-lg mx-auto">
        {/* Header */}
        <div className="flex gap-6 items-center pb-12">
          <AntButtonCommon
            onClick={() => router.push("/admin/campaigns")}
            icon={<ArrowLeftOutlined />}
            style={{ margin: 0 }}
          />
          <h1 className="text-3xl font-semibold text-gray-800 ">
            Tạo chiến dịch
          </h1>
        </div>

        {/* Form */}
        <Card>
          <Form
            layout="vertical"
            form={form}
            onFinish={handleSubmit}
            initialValues={{
              ProductInSalesCampaigns: [
                { ProductID: "", DiscountType: "PercentDiscount", Value: 0 },
              ],
            }}
          >
            <Form.Item
              name="CampaignName"
              label="Tên chiến dịch"
              rules={[
                { required: true, message: "Vui lòng nhập tên chiến dịch" },
              ]}
            >
              <Input placeholder="Nhập tên chiến dịch" />
            </Form.Item>

            <Form.Item name="Description" label="Mô tả">
              <Input.TextArea rows={3} placeholder="Nhập mô tả" />
            </Form.Item>

            <Form.Item
              name="ImageFile"
              label="Ảnh đại diện chiến dịch"
              valuePropName="fileList"
              getValueFromEvent={(e) => e?.fileList}
            >
              <Upload beforeUpload={() => false} maxCount={1}>
                <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
              </Upload>
            </Form.Item>

            <Form.Item
              name="DateRange"
              label="Thời gian chiến dịch"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn thời gian bắt đầu và kết thúc",
                },
              ]}
            >
              <RangePicker format="DD/MM/YYYY" />
            </Form.Item>

            <Form.List name="ProductInSalesCampaigns">
              {(fields, { add, remove }) => (
                <>
                  <label className="font-medium">
                    Danh sách sản phẩm áp dụng
                  </label>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space
                      key={key}
                      align="baseline"
                      style={{ display: "flex", marginBottom: 8 }}
                    >
                      <Form.Item
                        {...restField}
                        name={[name, "ProductID"]}
                        rules={[
                          { required: true, message: "Nhập mã sản phẩm" },
                        ]}
                      >
                        <Input
                          placeholder="Product ID"
                          style={{ width: 160 }}
                        />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "DiscountType"]}
                        rules={[{ required: true }]}
                      >
                        <Select
                          placeholder="Kiểu giảm giá"
                          options={discountTypeOptions}
                          style={{ width: 160 }}
                        />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "Value"]}
                        rules={[
                          { required: true, message: "Nhập giá trị giảm" },
                        ]}
                      >
                        <InputNumber
                          min={0}
                          style={{ width: 120 }}
                          placeholder="Giá trị"
                        />
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(name)} />
                    </Space>
                  ))}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      icon={<PlusOutlined />}
                    >
                      Thêm sản phẩm
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                Tạo chiến dịch
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
}

export default CreateSaleCampaignPage;
