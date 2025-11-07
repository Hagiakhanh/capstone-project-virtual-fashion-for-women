"use client";
import React, { useEffect, useState } from "react";
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
  Modal,
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
import SelectProductModal from "./_index/SelectProductModal";
import Image from "next/image";
import ImageUploader from "@/components/ManageProduct/ImageUploader";

const { RangePicker } = DatePicker;

const discountTypeOptions = [
  { label: "Phần trăm (%)", value: "PercentDiscount" },
  { label: "Giảm theo giá (₫)", value: "PriceDiscount" },
];

function CreateSaleCampaignPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<{
    start: string | undefined;
    end: string | undefined;
  } | null>(null);

  const [isFormValid, setIsFormValid] = useState(false);
  const formValues = Form.useWatch([], form); // Theo dõi toàn bộ form

  useEffect(() => {
    const name = formValues?.CampaignName?.trim();
    const desc = formValues?.Description?.trim();
    const image = formValues?.ImageFile;
    const dateRange = formValues?.DateRange;
    const productList = formValues?.ProductInSalesCampaigns || [];

    // Kiểm tra có ít nhất 1 sản phẩm hợp lệ
    const hasValidProducts =
      productList.length > 0 &&
      !productList.some((p: any) => p.IsValid === false);

    // Kiểm tra toàn bộ điều kiện form
    const isValid =
      !!name &&
      !!desc &&
      !!image &&
      Array.isArray(dateRange) &&
      dateRange.length === 2 &&
      !!dateRange[0] &&
      !!dateRange[1] &&
      hasValidProducts;

    setIsFormValid(isValid);
  }, [formValues]);
  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("CampaignName", values.CampaignName);
      formData.append("Description", values.Description || "");

      // Gửi file (chỉ 1 ảnh)
      console.log(values);
      if (values.ImageFile) {
        formData.append("ImageFile", values.ImageFile);
      }

      // Convert ngày sang object { year, month, day, dayOfWeek }
      const [start, end] = values.DateRange;
      formData.append("StartDate", start?.format("YYYY-MM-DD"));
      formData.append("EndDate", end?.format("YYYY-MM-DD"));
      // Danh sách sản phẩm
      const products =
        values.ProductInSalesCampaigns?.map((p: any) => ({
          ProductID: p.ProductID,
          DiscountType: p.DiscountType,
          Value: p.Value,
        })) || [];
      products?.forEach((p: any, index: number) => {
        formData.append(
          `ProductInSalesCampaigns[${index}].ProductID`,
          p.ProductID
        );
        formData.append(
          `ProductInSalesCampaigns[${index}].DiscountType`,
          p.DiscountType
        );
        formData.append(`ProductInSalesCampaigns[${index}].Value`, p.Value);
      });

      const res = await apiToken.post("/salecampaign", formData);

      messageToast.success(res.data?.message || "Tạo thành công");
      router.push("/admin/campaigns");
    } catch (err: any) {
      console.error(err);
      messageToast.error(
        err.response?.data?.message || err.message || "Có lỗi xảy ra"
      );
    } finally {
      setLoading(false);
    }
  };
  const handleValidateProducts = async (dates: any) => {
    const [start, end] = dates || [];
    const productList = form.getFieldValue("ProductInSalesCampaigns") || [];

    if (!start || !end || productList.length === 0) return;

    try {
      const res = await apiToken.post("/productInSaleCampaign/validate", {
        startDate: start.format("YYYY-MM-DD"),
        endDate: end.format("YYYY-MM-DD"),
        listProductID: productList.map((p: any) => p.ProductID),
      });

      if (res.status === 200 && res.data?.data) {
        const validIds = res.data.data.validProductIDList || [];
        const updated = productList.map((p: any) => ({
          ...p,
          IsValid: validIds.includes(p.ProductID),
        }));

        form.setFieldsValue({ ProductInSalesCampaigns: updated });

        const invalidCount = updated.filter((p: any) => !p.IsValid).length;
        if (invalidCount > 0) {
          messageToast.warning(
            `⚠️ Có ${invalidCount} sản phẩm không còn hợp lệ với thời gian này`
          );
        }
      }
    } catch (err) {
      console.error(err);
      messageToast.error("Lỗi khi kiểm tra sản phẩm hợp lệ");
    }
  };

  // ✅ Hàm xử lý chọn sản phẩm từ modal
  const handleSelectProduct = (product: any) => {
    const current = form.getFieldValue("ProductInSalesCampaigns") || [];
    const exists = current.some((p: any) => p.ProductID === product.productId);
    if (exists) {
      message.warning("Sản phẩm này đã được thêm rồi!");
      return;
    }

    form.setFieldsValue({
      ProductInSalesCampaigns: [
        ...current,
        {
          ProductID: product.productId,
          ProductName: product.productName,
          OriginalPrice: product.price,
          mainImageUrl: product.mainImageUrl,
          DiscountType: "PercentDiscount",
          Value: 0,
        },
      ],
    });
    setShowProductModal(false);
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
              ProductInSalesCampaigns: [],
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
              valuePropName="selectedFile"
              getValueFromEvent={(file: File | null) => file}
            >
              <ImageUploader
                label="Tải ảnh đại diện"
                onFileChange={(file) => {
                  form.setFieldValue("ImageFile", file);
                }}
                selectedFile={null}
              />
            </Form.Item>

            <Form.Item
              name="DateRange"
              label="Thời gian chiến dịch"
              rules={[{ required: true, message: "Vui lòng chọn thời gian" }]}
            >
              <RangePicker
                format="DD/MM/YYYY"
                onChange={(dates) => {
                  if (dates) {
                    setSelectedDateRange({
                      start: dates?.[0]?.format("YYYY-MM-DD"),
                      end: dates?.[1]?.format("YYYY-MM-DD"),
                    });
                    handleValidateProducts(dates);
                  } else setSelectedDateRange(null);
                }}
              />
            </Form.Item>

            {/* Danh sách sản phẩm */}
            <Form.List name="ProductInSalesCampaigns">
              {(fields, { remove }) => (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <label className="font-medium">Sản phẩm áp dụng</label>
                    <Button
                      type="dashed"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        if (!selectedDateRange) {
                          message.warning(
                            "Vui lòng chọn thời gian chiến dịch trước"
                          );
                          return;
                        }
                        setShowProductModal(true);
                      }}
                    >
                      Chọn sản phẩm
                    </Button>
                  </div>

                  {fields.map(({ key, name, ...restField }) => (
                    <Form.Item key={key} noStyle shouldUpdate>
                      {() => {
                        const item =
                          form.getFieldValue("ProductInSalesCampaigns")?.[
                            name
                          ] || {};
                        const discountType =
                          item.DiscountType || "PercentDiscount";
                        const value = item.Value || 0;
                        const price = item.OriginalPrice || 0;

                        // 🧮 Tính giá sau giảm
                        const discountedPrice =
                          discountType === "PercentDiscount"
                            ? Math.round(price * (1 - value / 100))
                            : value;

                        const percentDisplay =
                          discountType === "PercentDiscount"
                            ? `${value}%`
                            : `${Math.round(
                                (1 - discountedPrice / price) * 100
                              )}%`;

                        return (
                          <Card
                            size="small"
                            style={{ marginBottom: 12 }}
                            title={item.ProductName || "Sản phẩm"}
                            extra={
                              <MinusCircleOutlined
                                onClick={() => remove(name)}
                                className={`cursor-pointer ${
                                  item.IsValid === false
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "text-red-500"
                                }`}
                              />
                            }
                            aria-disabled
                          >
                            {item.IsValid === false && (
                              <p className="text-red-500 text-sm font-medium mb-2">
                                ⚠️ Sản phẩm này đã thuộc chiến dịch khác trong
                                thời gian đã chọn
                              </p>
                            )}
                            <Space wrap align="center">
                              <Image
                                src={item.mainImageUrl}
                                width={150}
                                height={30}
                                alt={item.ProductName}
                              />
                              {/* Loại giảm giá */}
                              <Form.Item
                                {...restField}
                                name={[name, "DiscountType"]}
                                rules={[{ required: true }]}
                              >
                                <Select
                                  style={{ width: 180 }}
                                  options={discountTypeOptions}
                                  onChange={() => {
                                    // reset giá trị khi đổi loại
                                    form.setFieldValue(
                                      [
                                        "ProductInSalesCampaigns",
                                        name,
                                        "Value",
                                      ],
                                      0
                                    );
                                  }}
                                />
                              </Form.Item>

                              {/* Giá trị giảm / giá sau giảm */}
                              <Form.Item
                                {...restField}
                                name={[name, "Value"]}
                                rules={[
                                  {
                                    required: true,
                                    message: "Vui lòng nhập giá trị",
                                  },
                                  () => ({
                                    validator(_, val) {
                                      if (discountType === "PercentDiscount") {
                                        if (val < 1 || val > 100) {
                                          return Promise.reject(
                                            new Error(
                                              "Phần trăm giảm phải trong khoảng 1–100%"
                                            )
                                          );
                                        }
                                      } else {
                                        if (val <= 0) {
                                          return Promise.reject(
                                            new Error(
                                              "Giá sau giảm phải lớn hơn 0"
                                            )
                                          );
                                        }
                                        if (val > price) {
                                          return Promise.reject(
                                            new Error(
                                              "Giá sau giảm không được vượt quá giá gốc"
                                            )
                                          );
                                        }
                                      }
                                      return Promise.resolve();
                                    },
                                  }),
                                ]}
                              >
                                <InputNumber
                                  min={0}
                                  max={
                                    discountType === "PercentDiscount"
                                      ? 100
                                      : price
                                  }
                                  disabled={item.IsValid === false}
                                  style={{ width: 150 }}
                                  placeholder={
                                    discountType === "PercentDiscount"
                                      ? "Giá trị giảm (%)"
                                      : "Giá sau giảm (₫)"
                                  }
                                  step={
                                    discountType === "PercentDiscount"
                                      ? 1
                                      : 1000
                                  }
                                  onChange={() => {
                                    // cập nhật hiển thị giá động
                                    form.validateFields();
                                  }}
                                />
                              </Form.Item>

                              {/* Thông tin minh họa */}
                              <div className="text-gray-600 text-sm leading-6">
                                <p>Giá gốc: {price.toLocaleString()} ₫</p>
                                <p>
                                  Sau giảm:{" "}
                                  <span className="text-green-600 font-medium">
                                    {discountedPrice.toLocaleString()} ₫
                                  </span>{" "}
                                  ({percentDisplay})
                                </p>
                              </div>
                            </Space>
                          </Card>
                        );
                      }}
                    </Form.Item>
                  ))}
                </>
              )}
            </Form.List>
            <Form.Item>
              <div className="flex justify-center">
                <AntButtonCommon
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  disabled={!isFormValid || loading}
                >
                  Tạo chiến dịch
                </AntButtonCommon>
              </div>
            </Form.Item>
          </Form>
        </Card>
      </div>

      {/* Modal chọn sản phẩm */}
      {showProductModal && selectedDateRange && (
        <SelectProductModal
          onClose={() => setShowProductModal(false)}
          onSelect={handleSelectProduct}
          campaignDate={selectedDateRange}
          selectedProducts={
            form
              .getFieldValue("ProductInSalesCampaigns")
              ?.map((p: any) => p.ProductID) || []
          }
        />
      )}
    </div>
  );
}

export default CreateSaleCampaignPage;
