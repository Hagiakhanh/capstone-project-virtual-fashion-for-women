"use client";
import { useEffect, useState } from "react";
import { Card, Radio } from "antd";
import { motion } from "framer-motion";
import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import { AntButtonCommon } from "@/components/AntDesign/Button/AntButtonCommon";
import { Characteristic } from "@/models/CharacteristicDTO";
import { api } from "@/api/instance";
import { AIConversationDTO } from "@/models/AIConversationDTO";
import { messageToast } from "@/helpers/toastHelper";
import { CharacteristicForm } from "@/components/Characteristic/CharacteristicForm";

export function SelectPersonalStyle({
  setToNextState,
  setIsLoading,
  setConversationId,
}: {
  setToNextState: React.Dispatch<React.SetStateAction<number>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setConversationId: React.Dispatch<React.SetStateAction<number | null>>;
}) {
  const [open, setOpen] = useState(false);
  const [usePersonalStyle, setUsePersonalStyle] = useState<
    "personal" | "skip" | null
  >(null);
  const [characteristicData, setCharacteristicData] =
    useState<Characteristic | null>(null);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const handleGetCharacteristic = async () => {
    try {
      const result = await api.get("/characteristic");
      const data = result.data;
      setCharacteristicData(data ?? null);
    } catch (error) {
      console.error("Lỗi khi lấy characteristic:", error);
      setCharacteristicData(null);
    }
  };

  const handleNextStep = async () => {
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
      const response = await api.post("/aiconversation", { characteristicId });
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
    <motion.div
      className="w-full sm:w-[90%] md:w-2/3 lg:w-1/2 bg-white rounded-2xl mt-4 sm:mt-6 shadow-xl p-4 sm:p-6 mx-auto space-y-4 sm:space-y-6"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Tiêu đề responsive */}
      <motion.h2
        className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl w-[95%] sm:w-[85%] md:w-[80%] mx-auto font-semibold text-center leading-relaxed from-[#FFAF37] to-[#996921] bg-gradient-to-r bg-clip-text text-transparent"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        Chọn phong cách cá nhân
      </motion.h2>

      {/* Content area responsive */}
      <motion.div
        className="w-full sm:w-[90%] md:w-[85%] lg:w-[80%] mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <Radio.Group
          onChange={(e) =>
            setUsePersonalStyle(e.target.value as "personal" | "skip")
          }
          value={usePersonalStyle}
          className="w-full space-y-3 sm:space-y-4"
        >
          {/* Nếu đã có characteristic */}
          {characteristicData ? (
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Radio value="personal" className="block w-full">
                <Card
                  size="small"
                  className="relative mt-2 bg-gray-50 hover:shadow-md transition-all"
                >
                  <div className="pr-8">
                    <strong className="text-base sm:text-lg block mb-2">
                      Dùng phong cách cá nhân có sẵn
                    </strong>
                    <EditOutlined
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpen(true);
                      }}
                      className="absolute top-3 sm:top-4 right-3 text-gray-500 hover:text-blue-500 text-base sm:text-lg cursor-pointer"
                    />
                    
                    {/* Info grid - responsive */}
                    <div className="space-y-1 text-sm sm:text-base">
                      <p className="flex flex-wrap gap-x-4">
                        <span>
                          <b>Chiều cao:</b> {characteristicData.height} cm
                        </span>
                        <span>
                          <b>Cân nặng:</b> {characteristicData.weight} kg
                        </span>
                      </p>
                      <p>
                        <b>Tuổi:</b> {characteristicData.age}
                      </p>
                      <p>
                        <b>Phong cách:</b>{" "}
                        {characteristicData.styleType?.styleTypeName ?? "Chưa có"}
                      </p>
                      <p>
                        <b>Tông da:</b>{" "}
                        {characteristicData.skinTone?.skinToneName ?? "Chưa có"}
                      </p>
                      <p>
                        <b>Ngữ cảnh:</b>{" "}
                        {characteristicData.occasionPreference
                          ?.occasionPreferenceName ?? "Chưa có"}
                      </p>
                    </div>
                  </div>
                </Card>
              </Radio>
            </motion.div>
          ) : (
            // Nếu chưa có characteristic
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card
                onClick={() => setOpen(true)}
                className="flex flex-col sm:flex-row items-center justify-center border-2 border-dashed border-gray-300 hover:border-blue-400 py-8 sm:py-10 cursor-pointer transition"
              >
                <PlusOutlined className="text-xl sm:text-2xl text-gray-500 mb-2 sm:mb-0 sm:mr-2" />
                <span className="text-gray-700 font-medium text-sm sm:text-base text-center">
                  Tạo phong cách cá nhân
                </span>
              </Card>
            </motion.div>
          )}

          {/* Bỏ qua - responsive */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Radio value="skip" className="block w-full">
              <Card
                size="small"
                className="mt-2 bg-gray-50 hover:shadow-md transition-all"
              >
                <strong className="text-base sm:text-lg block mb-1">
                  Bỏ qua, không chọn phong cách cá nhân
                </strong>
                <p className="text-gray-500 text-xs sm:text-sm">
                  Bạn có thể chọn phong cách sau trong quá trình gợi ý.
                </p>
              </Card>
            </Radio>
          </motion.div>
        </Radio.Group>

        {/* Error message */}
        {attemptedSubmit && !usePersonalStyle && (
          <motion.p
            className="text-red-600 mt-2 text-xs sm:text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Vui lòng chọn một lựa chọn.
          </motion.p>
        )}
      </motion.div>

      {/* Popup form */}
      <CharacteristicForm
        open={open}
        onClose={() => {
          setOpen(false);
          handleGetCharacteristic();
        }}
      />

      {/* Button - responsive */}
      <motion.div
        className="flex justify-center pt-4 sm:pt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <motion.div 
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.95 }}
          className="w-full sm:w-auto"
        >
          <AntButtonCommon
            colorType="primary"
            label="Xác nhận"
            disabled={usePersonalStyle === null}
            onClick={handleNextStep}
            className="w-full sm:w-auto text-sm sm:text-base px-6 sm:px-8"
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}