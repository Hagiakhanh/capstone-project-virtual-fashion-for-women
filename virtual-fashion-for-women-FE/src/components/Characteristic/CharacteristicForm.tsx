"use client";
import React, { useEffect, useState } from "react";
import { Modal, Form, InputNumber, Button } from "antd";
import { RadioWithOther } from "./RadioWithOther";
import { api } from "@/api/instance";
import { messageToast } from "@/helpers/toastHelper";
import Image from "next/image";
import IconCharacteristic from "@/assets/image/characteristicIcon.png";
interface CharacteristicFormProps {
  open: boolean;
  onClose: () => void;
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
        console.log(data);
        setCharacteristicDetail(data);
        if (data) {
          form.setFieldsValue({
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

  const handleSubmit = async (values: any) => {
    console.log(values);
    const payload = {
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
            <Form.Item label="Vòng 1 (cm)" name="bust">
              <InputNumber
                min={60}
                max={130}
                className="w-full"
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item label="Vòng 2 (cm)" name="waist">
              <InputNumber
                min={50}
                max={120}
                className="w-full"
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item label="Vòng 3 (cm)" name="hips">
              <InputNumber
                min={60}
                max={130}
                className="w-full"
                style={{ width: "100%" }}
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
