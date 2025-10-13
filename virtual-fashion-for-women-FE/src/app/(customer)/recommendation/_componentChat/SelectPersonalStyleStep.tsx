"use client";
import { useEffect, useState } from "react";
import { Card, Radio } from "antd";
import { AntButtonCommon } from "@/components/AntDesign/Button/AntButtonCommon";
import { Characteristic } from "@/models/CharacteristicDTO";
import { api } from "@/api/instance";
import { AIConversationDTO } from "@/models/AIConversationDTO";
import { messageToast } from "@/helpers/toastHelper";

export function SelectPersonalStyle({
  setToNextState,
  setIsLoading,
  setConversationId,
}: {
  setToNextState: React.Dispatch<React.SetStateAction<number>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setConversationId: React.Dispatch<React.SetStateAction<number | null>>;
}) {
  // KHÔNG auto chọn: bắt buộc người dùng chọn radio
  const [usePersonalStyle, setUsePersonalStyle] = useState<
    "personal" | "skip" | null
  >(null);

  const [characteristicData, setCharacteristicData] =
    useState<Characteristic | null>(null);

  // trạng thái để hiển thị lỗi validation (sau khi user cố submit mà chưa chọn)
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const handleGetCharacteristic = async () => {
    try {
      const result = await api.get("/characteristic");
      const data = result.data?.data || result.data;
      if (data) {
        setCharacteristicData(data);
        // Không tự set usePersonalStyle — người dùng phải chọn thủ công
      }
    } catch (error) {
      console.error("Lỗi khi lấy characteristic:", error);
    }
  };

  const handleNextStep = async () => {
    // validation client-side: đảm bảo đã chọn radio
    if (!usePersonalStyle) {
      setAttemptedSubmit(true);
      messageToast.error("Vui lòng chọn một lựa chọn trước khi tiếp tục");
      return;
    }

    setIsLoading(true);
    try {
      const characteristicId =
        usePersonalStyle === "personal"
          ? characteristicData?.characteristicId
          : null;

      const response = await api.post("/aiconversation", {
        characteristicId,
      });

      const dataResponse = response.data?.data as AIConversationDTO;
      messageToast.success("Tạo thành công cuộc trò chuyện với AI");

      setTimeout(() => {
        window.history.pushState(
          {},
          "",
          "/recommendation/" + dataResponse.aiconversationId
        );
        setConversationId(dataResponse.aiconversationId);
        setToNextState(1);
        setIsLoading(false);
      }, 300);
    } catch (error) {
      console.error("Lỗi khi tạo conversation:", error);
      messageToast.error("Không thể tạo cuộc trò chuyện");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleGetCharacteristic();
  }, []);

  return (
    <div className="md:w-1/2 bg-white rounded-2xl mt-6 shadow-xl p-6 mx-auto space-y-6" >
      <h2 className="text-6xl w-[80%] mx-auto font-semibold text-center leading-relaxed from-[#FFAF37] to-[#996921] bg-gradient-to-r bg-clip-text text-transparent">
        Chọn phong cách cá nhân
      </h2>

      <div className="w-[80%] mx-auto">
        <Radio.Group
          onChange={(e) =>
            setUsePersonalStyle(e.target.value as "personal" | "skip")
          }
          value={usePersonalStyle}
        >
          {characteristicData && (
            <Radio value="personal">
              <Card size="small" className="mt-2 bg-gray-50">
                <strong>Dùng phong cách cá nhân có sẵn</strong>
                <p>
                  <b>Chiều cao:</b> {characteristicData.height} cm —{" "}
                  <b>Cân nặng:</b> {characteristicData.weight} kg
                </p>
                <p>
                  <b>Tuổi:</b> {characteristicData.age}
                </p>
                <p>
                  <b>Phong cách:</b> {characteristicData.styleType}
                </p>
                <p>
                  <b>Tông da:</b> {characteristicData.skinTone}
                </p>
                <p>
                  <b>Màu ưa thích:</b> {characteristicData.colorPreference}
                </p>
                <p>
                  <b>Ngữ cảnh:</b> {characteristicData.occasionPreference}
                </p>
              </Card>
            </Radio>
          )}

          <Radio value="skip">
            <Card size="small" className="mt-2 bg-gray-50">
              <strong>Bỏ qua, không chọn phong cách cá nhân</strong>
              <p className="text-gray-500 text-sm">
                Bạn có thể chọn phong cách sau trong quá trình gợi ý.
              </p>
            </Card>
          </Radio>
        </Radio.Group>

        {/* Thông báo validation nếu người dùng cố submit mà chưa chọn */}
        {attemptedSubmit && !usePersonalStyle && (
          <p className="text-red-600 mt-2 text-sm">Vui lòng chọn một lựa chọn.</p>
        )}
      </div>

      <div className="flex justify-center pt-6">
        <AntButtonCommon
          colorType="primary"
          label="Xác nhận"
          // disabled nếu chưa chọn radio
          disabled={usePersonalStyle === null|| attemptedSubmit}
          onClick={handleNextStep}
          aria-disabled={usePersonalStyle === null}
          
        />
      </div>
    </div>
  );
}
