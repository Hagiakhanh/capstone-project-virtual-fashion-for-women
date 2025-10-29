"use client";
import React, { useEffect, useState } from "react";
import { Input, Spin } from "antd";
import { api } from "@/api/instance";
import Image from "next/image";

interface StyleOption {
  id: string | number;
  name: string;
  imageUrl?: string;
}

interface RadioWithOtherProps {
  label: string;
  apiUrl: string;
  selectedId?: string | number | null;
  note?: string;
  onChange: (id: string | number | "other", note?: string) => void;
  idField?: string;
  nameField?: string;
}

export const RadioWithOther: React.FC<RadioWithOtherProps> = ({
  label,
  apiUrl,
  selectedId,
  note,
  onChange,
  idField = "id",
  nameField = "name",
}) => {
  const [options, setOptions] = useState<StyleOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string | number | "other" | null>(
    selectedId ?? null
  );
  const [customNote, setCustomNote] = useState<string>(note || "");

  useEffect(() => {
    console.log(selectedId);
    if (selectedId == null || selectedId == 0) {
      setSelected("other");
    } else {
      setSelected(selectedId ?? null);
    }
    setCustomNote(note || "");
  }, [selectedId, note]);

  useEffect(() => {
    const fetchOptions = async () => {
      setLoading(true);
      try {
        const res = await api.get(apiUrl);
        const data = res.data.map((item: any) => ({
          id: item[idField],
          name: item[nameField],
          imageUrl: item.imageUrl,
        }));
        setOptions(data);
      } catch (err) {
        console.error("Error fetching:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOptions();
  }, [apiUrl, idField, nameField]);

  const handleSelect = (val: string | number | "other") => {
    setSelected(val);
    if (val !== "other") onChange(val, undefined);
    else onChange("other", customNote);
  };

  const handleNoteChange = (val: string) => {
    setCustomNote(val);
    onChange("other", val);
  };

  return (
    <div className="mb-6">
      <label className="font-semibold block mb-3 text-lg">{label}</label>

      {loading ? (
        <div className="flex justify-center py-8">
          <Spin />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {options.map((opt) => (
              <div
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all group ${
                  selected === opt.id
                    ? "border-blue-500 shadow-md"
                    : "border-transparent hover:border-gray-300"
                }`}
              >
                {opt.imageUrl && (
                  <div className="relative w-full aspect-[4/5]">
                    <Image
                      src={opt.imageUrl}
                      alt={opt.name}
                      fill
                      className="object-cover group-hover:opacity-80 transition"
                    />
                  </div>
                )}
                <div
                  className={`absolute bottom-0 left-0 right-0 text-center py-2 text-white text-sm font-medium bg-black/50 opacity-0 group-hover:opacity-100 transition`}
                >
                  {opt.name}
                </div>
              </div>
            ))}

            {/* Option "Khác" */}
            <div
              onClick={() => handleSelect("other")}
              className={`flex items-center justify-center rounded-xl border-2 p-4 text-gray-600 cursor-pointer transition-all ${
                selected === "other"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              Khác
            </div>
          </div>

          {selected === "other" && (
            <div className="mt-3">
              <Input.TextArea
                value={customNote}
                onChange={(e) => handleNoteChange(e.target.value)}
                rows={3}
                placeholder={`Nhập mô tả chi tiết cho ${label.toLowerCase()}...`}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};
