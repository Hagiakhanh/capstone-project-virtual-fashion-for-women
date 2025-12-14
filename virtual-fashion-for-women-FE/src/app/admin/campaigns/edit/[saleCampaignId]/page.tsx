"use client";
import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  DatePicker,
  Button,
  Select,
  InputNumber,
  Space,
  Card,
  message,
  Spin,
} from "antd";
import {
  PlusOutlined,
  MinusCircleOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useRouter, useParams } from "next/navigation";
import { apiToken } from "@/api/instance";
import { AntButtonCommon } from "@/components/AntDesign/Button/AntButtonCommon";
import { messageToast } from "@/helpers/toastHelper";
import Image from "next/image";
import ImageUploader from "@/components/ManageProduct/ImageUploader";
import SelectProductModal from "../../create/_index/SelectProductModal";

const { RangePicker } = DatePicker;

const discountTypeOptions = [
  { label: "Phần trăm (%)", value: "PercentDiscount" },
  { label: "Giảm theo giá (₫)", value: "PriceDiscount" },
];

export default function EditSaleCampaignPage() {
  const router = useRouter();
  const { saleCampaignId } = useParams();
  const id = Number(saleCampaignId);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<{
    start: string | undefined;
    end: string | undefined;
  } | null>(null);

  const [campaignStatus, setCampaignStatus] = useState<string>("Pending");
  const [deletedProductIds, setDeletedProductIds] = useState<string[]>([]);
  const [campaignImage, setCampaignImage] = useState<string | undefined>();

  const watchedProducts = Form.useWatch("ProductInSalesCampaigns", form);
  // 🧩 Fetch dữ liệu chiến dịch
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await apiToken.get(
          `/salecampaign/${saleCampaignId}/detail`
        );
        const data = res.data.data;
        setCampaignImage(data.imageUrl);
        form.setFieldsValue({
          CampaignName: data.campaignName,
          Description: data.description,
          DateRange: [dayjs(data.startDate), dayjs(data.endDate)],
          ProductInSalesCampaigns: data.listProductInSaleCampaign.map(
            (p: any) => ({
              ProductID: p.product.productId,
              ProductName: p.product.productName,
              OriginalPrice: p.product.price,
              mainImageUrl: p.product.mainImageUrl,
              DiscountType: "PriceDiscount",
              Value: p.salePrice,
              IsExisting: true,
            })
          ),
        });

        // set thêm status & range
        setCampaignStatus(data.status);
        setSelectedDateRange({
          start: data.startDate,
          end: data.endDate,
        });
      } catch (err) {
        console.error(err);
        message.error("Không thể tải thông tin chiến dịch");
        router.push("/admin/campaigns");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetail();
  }, [id]);

  // 🧩 Submit PUT update
  const handleSubmit = async (values: any) => {
    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("CampaignName", values.CampaignName);
      formData.append("DescriptionUpdated", values.Description || "");

      if (values.ImageFile) formData.append("ImageFile", values.ImageFile);
      formData.append("CampaignStatus", campaignStatus);

      // Ngày
      const [start, end] = values.DateRange;
      formData.append("StartDate", start?.format("YYYY-MM-DD"));
      formData.append("EndDate", end?.format("YYYY-MM-DD"));

      if (campaignStatus != "Expired") {
        const products =
          values.ProductInSalesCampaigns?.map((p: any) => ({
            ProductID: p.ProductID,
            DiscountType: p.DiscountType,
            Value: p.Value,
          })) || [];

        products.forEach((p: any, i: number) => {
          formData.append(
            `ProductInSalesCampaigns[${i}].ProductID`,
            p.ProductID
          );
          formData.append(
            `ProductInSalesCampaigns[${i}].DiscountType`,
            p.DiscountType
          );
          formData.append(`ProductInSalesCampaigns[${i}].Value`, p.Value);
        });
      }
      if (campaignStatus == "Pending") {
        deletedProductIds.forEach((pid, i) =>
          formData.append(`ListIdDeleted[${i}]`, pid)
        );
      }

      const res = await apiToken.put(`/salecampaign/${id}`, formData);
      messageToast.success(res.data?.message || "Cập nhật thành công");
      router.push("/admin/campaigns");
    } catch (err: any) {
      console.error(err);
      messageToast.error(err.response?.data?.details || err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveProduct = (remove: any, name: number, id: string) => {
    setDeletedProductIds((prev) => [...prev, id]);
    remove(name);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-screen-lg mx-auto">
        <div className="flex gap-6 items-center pb-12">
          <AntButtonCommon
            onClick={() => router.push("/admin/campaigns")}
            icon={<ArrowLeftOutlined />}
          />
          <h1 className="text-3xl font-semibold text-gray-800">
            Chỉnh sửa chiến dịch
          </h1>
        </div>

        <Card>
          <Form layout="vertical" form={form} onFinish={handleSubmit}>
            <Form.Item
              name="CampaignName"
              label="Tên chiến dịch"
              rules={[{ required: true, message: "Vui lòng nhập tên" }]}
            >
              <Input
                placeholder="Nhập tên chiến dịch"
                disabled={campaignStatus == "Expired"}
              />
            </Form.Item>

            <Form.Item name="Description" label="Mô tả">
              <Input.TextArea
                rows={3}
                placeholder="Nhập mô tả"
                disabled={campaignStatus == "Expired"}
              />
            </Form.Item>

            <Form.Item
              name="ImageFile"
              label="Ảnh đại diện"
              valuePropName="selectedFile"
            >
              {campaignStatus == "Expired" ? (
                <Image
                  src={campaignImage || ""}
                  alt="Preview"
                  height={350}
                  width={350}
                  style={{ objectFit: "cover"}}
                  className="rounded-lg "
                />
              ) : (
                <ImageUploader
                  label="Chọn ảnh mới (nếu cần)"
                  onFileChange={(file) => form.setFieldValue("ImageFile", file)}
                  selectedFile={null}
                  imageDefaultUrl={campaignImage}
                />
              )}
            </Form.Item>

            <Form.Item
              name="DateRange"
              label="Thời gian chiến dịch"
              rules={[{ required: true, message: "Vui lòng chọn thời gian" }]}
            >
              <RangePicker
                format="DD/MM/YYYY"
                placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
                disabledDate={(current) =>
                  current && current < dayjs().startOf("day")
                }
                onChange={(dates) => {
                  if (dates) {
                    setSelectedDateRange({
                      start: dates[0]?.format("YYYY-MM-DD"),
                      end: dates[1]?.format("YYYY-MM-DD"),
                    });
                  }
                }}
                disabled={campaignStatus !== "Pending"}
              />
            </Form.Item>

            <Form.List name="ProductInSalesCampaigns">
              {(fields, { remove }) => (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <label className="font-medium">Sản phẩm áp dụng</label>
                    {campaignStatus !== "Expired" && (
                      <Button
                        type="dashed"
                        icon={<PlusOutlined />}
                        onClick={() => setShowProductModal(true)}
                      >
                        Chọn sản phẩm
                      </Button>
                    )}
                  </div>

                  {fields.map(({ key, name, ...restField }) => {
                    const item = watchedProducts?.[name] || {};
                    const isExisting = item.IsExisting == true;
                    const discountType = item.DiscountType || "PercentDiscount";
                    const value = item.Value || 0;
                    const price = item.OriginalPrice || 0;
                    const discountedPrice =
                      discountType === "PercentDiscount"
                        ? Math.round(price * (1 - value / 100))
                        : value;

                    return (
                      <Card
                        key={key}
                        size="small"
                        style={{ marginBottom: 12 }}
                        title={item.ProductName}
                        extra={
                          campaignStatus === "Pending" && (
                            <MinusCircleOutlined
                              onClick={() =>
                                handleRemoveProduct(
                                  remove,
                                  name,
                                  item.ProductID
                                )
                              }
                              className="cursor-pointer text-red-500"
                            />
                          )
                        }
                      >
                        <Space wrap align="center">
                          <Image
                            src={item.mainImageUrl}
                            width={150}
                            height={30}
                            alt={item.ProductName}
                          />
                          <Form.Item
                            {...restField}
                            name={[name, "DiscountType"]}
                            rules={[{ required: true }]}
                          >
                            <Select
                              options={discountTypeOptions}
                              disabled={
                                campaignStatus == "Expired" ||
                                (campaignStatus != "Expired" && campaignStatus!="Pending" && isExisting)
                              }
                              onChange={() => {
                                form.validateFields([
                                  ["ProductInSalesCampaigns", name, "Value"],
                                ]);
                              }}
                              style={{ width: 180 }}
                            />
                          </Form.Item>

                          <Form.Item
                            {...restField}
                            name={[name, "Value"]}
                            dependencies={[
                              ["ProductInSalesCampaigns", name, "DiscountType"],
                            ]}
                            rules={[
                              { required: true },
                              {
                                validator: (_, val) => {
                                  const type = form.getFieldValue([
                                    "ProductInSalesCampaigns",
                                    name,
                                    "DiscountType",
                                  ]);
                                  if (
                                    type === "PercentDiscount" &&
                                    (val < 0 || val > 100)
                                  ) {
                                    return Promise.reject(
                                      new Error("Phần trăm phải từ 0-100")
                                    );
                                  }
                                  if (
                                    type === "PriceDiscount" &&
                                    (val < 0 || val > price)
                                  ) {
                                    return Promise.reject(
                                      new Error(
                                        `Giá giảm phải từ 0-${price.toLocaleString()}`
                                      )
                                    );
                                  }
                                  return Promise.resolve();
                                },
                              },
                            ]}
                          >
                            <InputNumber
                              min={0}
                              max={
                                item.DiscountType === "PercentDiscount"
                                  ? 100
                                  : price
                              }
                              style={{ width: 150 }}
                              step={
                                item.DiscountType === "PercentDiscount"
                                  ? 1
                                  : 1000
                              }
                              disabled={
                                campaignStatus == "Expired" ||
                                (campaignStatus != "Expired" && campaignStatus!="Pending" && isExisting)
                              }
                            />
                          </Form.Item>

                          <div className="text-gray-600 text-sm leading-6">
                            <p>Giá gốc: {price.toLocaleString()} ₫</p>
                            <p>
                              Sau giảm:{" "}
                              <span className="text-green-600 font-medium">
                                {discountedPrice.toLocaleString()} ₫
                              </span>
                            </p>
                          </div>
                        </Space>
                      </Card>
                    );
                  })}
                </>
              )}
            </Form.List>

            <div className="flex justify-between mt-6">
              {/* Nút trạng thái */}
              {campaignStatus == "Active" || campaignStatus== "Pending" ? (
                <Button
                  danger
                  onClick={() => setCampaignStatus("Inactive")}
                  disabled={saving}
                >
                  Tạm dừng chiến dịch
                </Button>
              ) : (
                <Button
                  type="default"
                  onClick={() => setCampaignStatus("Active")}
                  disabled={saving ||  campaignStatus=="Expired"}
                >
                  Kích hoạt lại
                </Button>
              )}

              <AntButtonCommon
                type="primary"
                htmlType="submit"
                loading={saving}
                disabled={saving || campaignStatus=="Expired"}
              >
                Lưu thay đổi
              </AntButtonCommon>
            </div>
          </Form>
        </Card>
      </div>

      {showProductModal && selectedDateRange && campaignStatus != "Expired" && (
        <SelectProductModal
          onClose={() => setShowProductModal(false)}
          onSelect={(product: any) => {
            const current = form.getFieldValue("ProductInSalesCampaigns") || [];
            if (current.some((p: any) => p.ProductID === product.productId)) {
              message.warning("Sản phẩm này đã có trong danh sách!");
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
                  IsExisting: false,
                },
              ],
            });
            setShowProductModal(false);
          }}
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
