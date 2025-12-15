'use client';

import { Characteristic } from '@/models/CharacteristicDTO';
import { Category } from '@/models/RequestCreateProduct';
import React, { useState } from 'react';

export default function BodyMeasurementForm({
    clothingType,
    onSubmit,
    onSkip,
    onBackToResult,
    characteristicData,
}: {
    clothingType: Category | undefined;
    onSubmit: (values: Record<string, number>) => void;
    onSkip: () => void;
    onBackToResult: () => void;
    characteristicData?: Characteristic | null;
}) {

    // Config các loại quần áo → form fields khác nhau
    const fieldsByType: Record<string, { key: string; label: string }[]> = {
        Áo: [
            { key: 'bust', label: 'Vòng ngực (cm)' },
            { key: 'waist', label: 'Vòng eo (cm)' },
            { key: 'shoulder', label: 'Chiều ngang vai (cm)' },
        ],
        Quần: [
            { key: 'waist', label: 'Vòng eo (cm)' },
            { key: 'hips', label: 'Vòng mông (cm)' },
        ],
        Váy: [
            { key: 'waist', label: 'Vòng eo (cm)' },
            { key: 'hips', label: 'Vòng mông (cm)' },
        ],
        Đầm: [
            { key: 'bust', label: 'Vòng ngực (cm)' },
            { key: 'waist', label: 'Vòng eo (cm)' },
            { key: 'hips', label: 'Vòng mông (cm)' },
        ],
    };


    const [values, setValues] = useState<Record<string, number>>(
        () => {
            if (!characteristicData) return {};
            // Lấy ra các key số đo mà form cần dựa vào clothingType
            const initialValues: Record<string, number> = {};
            const fields = fieldsByType[clothingType?.categoryName || 'Áo'] || [];
            fields.forEach(field => {
                // @ts-ignore
                if (characteristicData[field.key] !== undefined) {
                    // @ts-ignore
                    initialValues[field.key] = characteristicData[field.key];
                }
            });
            return initialValues;
        }
    );

    const handleChange = (key: string, value: string) => {
        setValues((prev) => ({
            ...prev,
            [key]: Number(value)
        }));
    };

    const fields = fieldsByType[clothingType?.categoryName || 'Áo'];

    return (
        <div className="border p-6 rounded-xl shadow bg-orange-50">
            <button
                onClick={onBackToResult}
                className="text-orange-600 hover:text-orange-700 font-medium mb-4 flex items-center gap-2"
            >
                ← Quay lại
            </button>
            <h3 className="text-xl font-bold mb-4 text-gray-800">
                Nhập số đo cơ thể
            </h3>

            <div className="grid grid-cols-2 gap-4">
                {fields.map((field) => (
                    <div key={field.key} className="flex flex-col">
                        <label className="text-gray-700 mb-1 font-medium">
                            {field.label}
                        </label>
                        <input
                            placeholder={field.label}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-orange-400 appearance-none"
                            value={values[field.key] ?? ''}
                            onChange={(e) => {
                                const val = e.target.value;
                                // chỉ giữ tối đa 3 chữ số
                                if (/^\d{0,3}$/.test(val)) {
                                    handleChange(field.key, val);
                                }
                            }}
                        />
                    </div>
                ))}
            </div>


            {/* BUTTONS */}
            <div className="flex gap-3 mt-5">
                <button
                    onClick={() => onSubmit(values)}
                    className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-semibold"
                >
                    Xác nhận
                </button>

                <button
                    onClick={onSkip}
                    className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-xl font-semibold"
                >
                    Bỏ qua
                </button>
            </div>
        </div>
    );
}
