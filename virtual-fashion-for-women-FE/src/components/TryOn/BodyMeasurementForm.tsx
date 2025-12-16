'use client';

import { Characteristic } from '@/models/CharacteristicDTO';
import { Category } from '@/models/RequestCreateProduct';
import React, { useState, useCallback, useMemo } from 'react';
import { AlertCircle } from 'lucide-react'; // Sử dụng icon cảnh báo từ lucide-react (phổ biến trong Next.js/Tailwind)

// --- LOGIC KIỂM TRA SỐ ĐO (Dùng lại từ component trước) ---
type Range = { min: number; max: number };

function rangeByHeight(height: number) {
  return {
    bust: { min: 0.48 * height, max: 0.56 * height },
    waist: { min: 0.36 * height, max: 0.43 * height },
    hips: { min: 0.50 * height, max: 0.58 * height },
    shoulder: { min: 0.21 * height, max: 0.25 * height },
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

function intersect(a: Range | null, b: Range | null): Range | null {
  if (!a || !b) return a || b || null;
  const min = Math.max(a.min, b.min);
  const max = Math.min(a.max, b.max);
  return min <= max ? { min, max } : null;
}

export function rangeShoulderFromBust(bust: number): Range {
    return {
        min: 0.28 * bust,
        max: 0.33 * bust,
    };
}

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
            { key: 'height', label: 'Chiều cao (cm)' },
            { key: 'bust', label: 'Vòng ngực (cm)' },
            { key: 'waist', label: 'Vòng eo (cm)' },
            { key: 'shoulder', label: 'Chiều ngang vai (cm) - Không bắt buộc' },
        ],
        Quần: [
            { key: 'height', label: 'Chiều cao (cm)' },
            { key: 'waist', label: 'Vòng eo (cm)' },
            { key: 'hips', label: 'Vòng mông (cm)' },
        ],
        Váy: [
            { key: 'height', label: 'Chiều cao (cm)' },
            { key: 'waist', label: 'Vòng eo (cm)' },
            { key: 'hips', label: 'Vòng mông (cm)' },
        ],
        Đầm: [
            { key: 'height', label: 'Chiều cao (cm)' },
            { key: 'bust', label: 'Vòng ngực (cm)' },
            { key: 'waist', label: 'Vòng eo (cm)' },
            { key: 'hips', label: 'Vòng mông (cm)' },
        ],
    };

    // const [values, setValues] = useState<Record<string, number>>(
    //     () => {
    //         if (!characteristicData) return {};
    //         // Lấy ra các key số đo mà form cần dựa vào clothingType
    //         const initialValues: Record<string, number> = {};
    //         const fields = fieldsByType[clothingType?.categoryName || 'Áo'] || [];
    //         fields.forEach(field => {
    //             // @ts-ignore
    //             if (characteristicData[field.key] !== undefined) {
    //                 // @ts-ignore
    //                 initialValues[field.key] = characteristicData[field.key];
    //             }
    //         });
    //         return initialValues;
    //     }
    // );

    const fields = useMemo(() => fieldsByType[clothingType?.categoryName || 'Áo'], [clothingType]);

    const getInitialValues = () => {
        if (!characteristicData) return {};
        const initialValues: Record<string, number> = {};
        fields.forEach(field => {
            // @ts-ignore: Bỏ qua type check tạm thời vì CharacteristicDTO có thể thiếu thuộc tính 'shoulder'
            if (characteristicData[field.key] !== undefined && characteristicData[field.key] !== null) {
                // @ts-ignore
                initialValues[field.key] = characteristicData[field.key];
            }
        });
        return initialValues;
    };

    const [values, setValues] = useState<Record<string, number>>(() => getInitialValues());
    const [warnings, setWarnings] = useState<Record<string, string | null>>({});

    const validateMeasurements = useCallback((currentValues: Record<string, number>) => {
        const { height, bust, waist, hips, shoulder } = currentValues;
        const newWarnings: Record<string, string | null> = {
            height: null,
            bust: null,
            waist: null,
            hips: null,
            shoulder: null,
        };

        if (!height) {
            setWarnings(newWarnings);
            return;
        }
        
        // Tính toán giao điểm của phạm vi
        let bustRange: Range | null = null;
        let waistRange: Range | null = null;
        let hipsRange: Range | null = null;
        let shoulderRange: Range | null = null;

        // Phạm vi từ chiều cao
        if(height) {
            const hRange = rangeByHeight(height);
            bustRange = intersect(bustRange, hRange.bust);
            waistRange = intersect(waistRange, hRange.waist);
            hipsRange = intersect(hipsRange, hRange.hips);
            shoulderRange = intersect(shoulderRange, hRange.shoulder);
        }

        // Phạm vi từ vòng ngực
        if (bust) {
            const bRange = rangeFromBust(bust);
            waistRange = intersect(waistRange, bRange.waist);
            hipsRange = intersect(hipsRange, bRange.hips);
        }

        // Phạm vi từ vòng eo
        if (waist) {
            const wRange = rangeFromWaist(waist);
            bustRange = intersect(bustRange, wRange.bust);
            hipsRange = intersect(hipsRange, wRange.hips);
        }

        // Phạm vi từ vòng mông
        if (hips) {
            const hpRange = rangeFromHips(hips);
            waistRange = intersect(waistRange, hpRange.waist);
            bustRange = intersect(bustRange, hpRange.bust);
        }

        const heightRange = rangeByHeight(height);

        // Kiểm tra Vòng ngực (bust)
        if (bust) {
            const r = heightRange.bust;
            if (bust < r.min || bust > r.max) {
                newWarnings.bust = `Vòng ngực thường nằm trong khoảng ${r.min.toFixed(0)} - ${r.max.toFixed(0)} cm với chiều cao ${height} cm`;
            }
        }

        // Kiểm tra Vòng eo (waist)
        if (waist) {
            const r = heightRange.waist;
            if (waist < r.min || waist > r.max) {
                newWarnings.waist = `Vòng eo thường nằm trong khoảng ${r.min.toFixed(0)} - ${r.max.toFixed(0)} cm với chiều cao ${height} cm`;
            }
        }

        // Kiểm tra Vòng mông (hips)
        if (hips) {
            const r = heightRange.hips;
            if (hips < r.min || hips > r.max) {
                newWarnings.hips = `Vòng mông thường nằm trong khoảng ${r.min.toFixed(0)} - ${r.max.toFixed(0)} cm với chiều cao ${height} cm`;
            }
        }

        // Kiểm tra Vai (shoulder)
        if (shoulder) {
            const r = heightRange.shoulder;
            if (shoulder < r.min || shoulder > r.max) {
                newWarnings.shoulder = `Chiều ngang vai thường nằm trong khoảng ${r.min.toFixed(0)} - ${r.max.toFixed(0)} cm với chiều cao ${height} cm`;
            }
        }

        setWarnings(newWarnings);
    }, [fields]);

    // const handleChange = (key: string, value: string) => {
    //     setValues((prev) => ({
    //         ...prev,
    //         [key]: Number(value)
    //     }));
    // };

    const handleChange = (key: string, value: string) => {
        // Chỉ giữ tối đa 3 chữ số
        if (!/^\d{0,3}$/.test(value)) return;
        
        const newValue = value === '' ? undefined : Number(value);
        const updatedValues = {
            ...values,
            ...(newValue === undefined ? {} : { [key]: newValue })
        };
        
        if (newValue === undefined) {
            delete updatedValues[key];
        }
        
        setValues(updatedValues);
        validateMeasurements(updatedValues);
    };

    //const fields = fieldsByType[clothingType?.categoryName || 'Áo'];

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
                            type="text"
                            inputMode="numeric"
                            placeholder={field.label}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                focus:outline-none focus:ring-2 focus:ring-orange-400 appearance-none"
                            value={values[field.key] ?? ''}
                            // onChange={(e) => {
                            //     const val = e.target.value;
                            //     // chỉ giữ tối đa 3 chữ số
                            //     if (/^\d{0,3}$/.test(val)) {
                            //         handleChange(field.key, val);
                            //     }
                            // }}
                            onChange={(e) => handleChange(field.key, e.target.value)}
                        />
                        {warnings[field.key] && (
                            <div className="flex items-start gap-1 mt-1 text-amber-600 text-sm">
                                <AlertCircle className="w-4 h-4 mt-0.5" />
                                <span>{warnings[field.key]}</span>
                            </div>
                        )}
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
