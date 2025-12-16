"use client";
import React, { useEffect, useState } from "react";
import { Modal, Form, InputNumber, Button } from "antd";
import { RadioWithOther } from "./RadioWithOther";
import { api } from "@/api/instance";
import { messageToast } from "@/helpers/toastHelper";
import Image from "next/image";
import IconCharacteristic from "@/assets/image/characteristicIcon.png";
import { WarningOutlined } from "@ant-design/icons"; // Import icon cảnh báo
interface CharacteristicFormProps {
  open: boolean;
  onClose: () => void;
}

type Range = { min: number; max: number };

function rangeByHeight(height: number) {
  return {
    bust: { min: 0.48 * height, max: 0.56 * height },
    waist: { min: 0.36 * height, max: 0.43 * height },
    hips: { min: 0.50 * height, max: 0.58 * height },
  };
}

function rangeFromBust(bust: number) {
  return {
    waist: { min: bust - 30, max: bust - 18 },
    hips: { min: bust - 5, max: bust + 10 },
  };
}

function rangeFromWaist(waist: number) {
  return {
    bust: { min: waist + 18, max: waist + 30 },
    hips: { min: waist + 18, max: waist + 32 },
  };
}

function rangeFromHips(hips: number) {
  return {
    waist: { min: hips - 32, max: hips - 18 },
    bust: { min: hips - 10, max: hips + 5 },
  };
}

// function intersect(a?: Range, b?: Range): Range | null {
//   if (!a || !b) return a || b || null;
//   const min = Math.max(a.min, b.min);
//   const max = Math.min(a.max, b.max);
//   return min <= max ? { min, max } : null;
// }

function intersect(a: Range | null, b: Range | null): Range | null {
  if (!a || !b) return a || b || null;
  const min = Math.max(a.min, b.min);
  const max = Math.min(a.max, b.max);
  return min <= max ? { min, max } : null;
}

export const CharacteristicForm: React.FC<CharacteristicFormProps> = ({
  open,
  onClose,
}) => {
  const [form] = Form.useForm();
  const [characteristicDetail, setCharacteristicDetail] = useState<any | null>(
    null
  );
  useEffect(() => {
    const fetchCharacteristic = async () => {
      try {
        const res = await api.get(`/characteristic`);
        const data = res.data;
        setCharacteristicDetail(data);
        if (data) {
          form.setFieldsValue({
            height: data.height,
            bust: data.bust,
            waist: data.waist,
            hips: data.hips,
            styleTypeID: data.styleTypeId ?? 0,
            styleTypeNote: data.styleTypeNote ?? "",
            occasionPreferenceID: data.occasionPreferenceId ?? 0,
            occasionPreferenceNote: data.occasionNote ?? "",
            skinToneID: data.skinToneId ?? 0,
            skinToneNote: data.skinToneNote ?? "",
          });
        }
      } catch (err) {
        console.warn("No existing characteristic found");
      }
    };
    if (open) fetchCharacteristic();
  }, [open, form]);

  const [warnings, setWarnings] = useState<Record<string, string>>({});

  const validateMeasurements = () => {
    const { height, bust, waist, hips } = form.getFieldsValue();
    const newWarnings: Record<string, string> = {};

    // Khởi tạo các phạm vi tiềm năng ban đầu
    let bustRange: Range | null = null;
    let waistRange: Range | null = null;
    let hipsRange: Range | null = null;

    // 1. Tính toán phạm vi dựa trên Chiều cao (height)
    if (height) {
        const hRange = rangeByHeight(height);
        bustRange = intersect(bustRange, hRange.bust);
        waistRange = intersect(waistRange, hRange.waist);
        hipsRange = intersect(hipsRange, hRange.hips);
    }

    // 2. Tính toán phạm vi dựa trên Vòng 1 (bust)
    if (bust) {
        const bRange = rangeFromBust(bust);
        waistRange = intersect(waistRange, bRange.waist);
        hipsRange = intersect(hipsRange, bRange.hips);
    }

    // 3. Tính toán phạm vi dựa trên Vòng 2 (waist)
    if (waist) {
        const wRange = rangeFromWaist(waist);
        bustRange = intersect(bustRange, wRange.bust);
        hipsRange = intersect(hipsRange, wRange.hips);
    }

    // 4. Tính toán phạm vi dựa trên Vòng 3 (hips)
    if (hips) {
        const hpRange = rangeFromHips(hips);
        waistRange = intersect(waistRange, hpRange.waist);
        bustRange = intersect(bustRange, hpRange.bust);
    }

    if (!height) {
      setWarnings({});
      return;
    }

    const heightRange = rangeByHeight(height);

    // ===== Bust =====
    if (bust) {
      const r = heightRange.bust;
      if (bust < r.min || bust > r.max) {
        newWarnings.bust = `Vòng 1 thường nằm trong khoảng ${r.min.toFixed(
          0
        )} - ${r.max.toFixed(0)} cm với chiều cao ${height} cm`;
      }
    }

    // ===== Waist =====
    if (waist) {
      const r = heightRange.waist;
      if (waist < r.min || waist > r.max) {
        newWarnings.waist = `Vòng 2 thường nằm trong khoảng ${r.min.toFixed(
          0
        )} - ${r.max.toFixed(0)} cm`;
      }
    }

    // ===== Hips =====
    if (hips) {
      const r = heightRange.hips;
      if (hips < r.min || hips > r.max) {
        newWarnings.hips = `Vòng 3 thường nằm trong khoảng ${r.min.toFixed(
          0
        )} - ${r.max.toFixed(0)} cm`;
      }
    }

    setWarnings(newWarnings);
  };


  const handleSubmit = async (values: any) => {
    const payload = {
      height: values.height,
      styleTypeID: values.styleTypeID,
      styleTypeNote: values.styleTypeNote ?? "",
      occasionPreferenceID: values.occasionPreferenceID,
      occasionPreferenceNote: values.occasionPreferenceNote ?? "",
      skinToneID: values.skinToneID,
      skinToneNote: values.skinToneNote ?? "",
      bust: values.bust,
      waist: values.waist,
      hips: values.hips,
    };

    try {
      if (characteristicDetail) {
        var response = await api.put(`/characteristic`, payload);
        console.log(response);
      } else {
        var response = await api.post("/characteristic", payload);
      }
      messageToast.success(response.data.message);
      onClose();
    } catch (err) {
      console.error(err);
      messageToast.error("Lưu thông tin thất bại!");
    }
  };

  // Hàm render help text cho Form.Item
  const renderHelp = (key: 'bust' | 'waist' | 'hips') => {
      const warning = warnings[key];
      if (warning) {
          return (
              <div className="text-yellow-400 flex items-center gap-1">
                  <WarningOutlined /> {warning}
              </div>
          );
      }
      return null;
  };

  return (
    <Modal
      title={
        <h2 className="text-xl">Thông tin phong cách & đặc điểm cơ thể</h2>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          age: null,
          height: null,
          weight: null,
          bust: null,
          waist: null,
          hips: null,
        }}
      >
        {/* --- Các thông tin cơ thể --- */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* --- Cột nhập liệu --- */}
          
          <div className="flex-1 grid grid-cols-2 w-full gap-2 ">
          <Form.Item
              label="Chiều cao (cm)"
              name="height"
              rules={[{ required: true, message: "Vui lòng nhập chiều cao" }]}
            >
              <InputNumber
                min={100}
                max={220}
                className="w-full"
                style={{ width: "100%" }}
                onBlur={validateMeasurements} 
                onChange={validateMeasurements}
              />
            </Form.Item>
            <Form.Item label="Vòng 1 (cm)" name="bust" validateStatus={warnings.bust ? "warning" : undefined} help={renderHelp('bust')}>
              <InputNumber
                min={60}
                max={130}
                className="w-full"
                style={{ width: "100%" }}
                onBlur={validateMeasurements}
                onChange={validateMeasurements}
              />
            </Form.Item>

            <Form.Item label="Vòng 2 (cm)" name="waist" validateStatus={warnings.waist ? "warning" : undefined} help={renderHelp('waist')}>
              <InputNumber
                min={50}
                max={120}
                className="w-full"
                style={{ width: "100%" }}
                onBlur={validateMeasurements}
                onChange={validateMeasurements}
              />
            </Form.Item>

            <Form.Item label="Vòng 3 (cm)" name="hips" validateStatus={warnings.hips ? "warning" : undefined} help={renderHelp('hips')}>
              <InputNumber
                min={60}
                max={130}
                className="w-full"
                style={{ width: "100%" }}
                onBlur={validateMeasurements}
                onChange={validateMeasurements}
              />
            </Form.Item>
          </div>

          {/* --- Cột hình nộm --- */}
          <div className="hidden md:flex justify-center items-center  rounded-lg p-4 w-[260px]">
            <Image
              src={IconCharacteristic}
              className="scale-105 w-full h-full object-cover"
              alt="icon cân nặng và chiều cao"
            />
          </div>
        </div>

        {/* --- Phần chọn phong cách --- */}
        <Form.Item name="styleTypeID" hidden>
          <InputNumber />
        </Form.Item>
        <Form.Item name="styleTypeNote" hidden>
          <InputNumber />
        </Form.Item>

        <Form.Item name="occasionPreferenceID" hidden>
          <InputNumber />
        </Form.Item>
        <Form.Item name="occasionPreferenceNote" hidden>
          <InputNumber />
        </Form.Item>

        <Form.Item name="skinToneID" hidden>
          <InputNumber />
        </Form.Item>
        <Form.Item name="skinToneNote" hidden>
          <InputNumber />
        </Form.Item>
        <RadioWithOther
          label="Phong cách yêu thích"
          apiUrl="/characteristic/styleType"
          selectedId={form.getFieldValue("styleTypeID")}
          note={form.getFieldValue("styleTypeNote")}
          idField="styleTypeId"
          nameField="styleTypeName"
          onChange={(id, note) => {
            console.log(id);
            form.setFieldsValue({
              styleTypeID: id !== "other" ? id : 0,
              styleTypeNote: note || "",
            });
          }}
        />

        <RadioWithOther
          label="Phong cách dịp đặc biệt"
          apiUrl="/characteristic/occasionPreference"
          selectedId={form.getFieldValue("occasionPreferenceID")}
          note={form.getFieldValue("occasionPreferenceNote")}
          idField="occasionPreferenceId"
          nameField="occasionPreferenceName"
          onChange={(id, note) => {
            form.setFieldsValue({
              occasionPreferenceID: id !== "other" ? id : 0,
              occasionPreferenceNote: note || "",
            });
          }}
        />

        <RadioWithOther
          label="Tông màu da"
          apiUrl="/characteristic/skinTone"
          selectedId={form.getFieldValue("skinToneID")}
          note={form.getFieldValue("skinToneNote")}
          idField="skinToneId"
          nameField="skinToneName"
          onChange={(id, note) => {
            form.setFieldsValue({
              skinToneID: id !== "other" ? id : 0,
              skinToneNote: note || "",
            });
          }}
        />

        <div className="flex justify-end mt-6">
          <Button onClick={onClose} className="mr-3">
            Hủy
          </Button>
          <Button type="primary" htmlType="submit">
            Lưu thông tin
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
