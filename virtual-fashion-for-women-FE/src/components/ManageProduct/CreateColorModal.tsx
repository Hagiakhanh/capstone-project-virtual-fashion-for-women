// src/app/admin/product/update/[productId]/components/CreateColorModal.tsx
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface CreateColorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (colorData: { colorName: string; colorPrefix: string; hexCode: string }) => void;
    initialData?: { colorName?: string; colorPrefix?: string; hexCode?: string };
}

export default function CreateColorModal({
    isOpen,
    onClose,
    onSave,
    initialData,
}: CreateColorModalProps) {
    const [colorName, setColorName] = useState('');
    const [colorPrefix, setColorPrefix] = useState('');
    const [hexCode, setHexCode] = useState('#');

    useEffect(() => {
        if (isOpen) {
            setColorName(initialData?.colorName || '');
            setColorPrefix(initialData?.colorPrefix || '');
            setHexCode(initialData?.hexCode || '#');
        }
    }, [isOpen, initialData]);

    const handleSave = () => {
        if (colorName && colorPrefix && hexCode.length === 7) {
             onSave({ colorName, colorPrefix, hexCode });
            onClose();
        } else {
            alert('Vui lòng điền đầy đủ thông tin màu.');
        }
    };

    const handleHexChange = (value: string) => {
        let formatted = value.startsWith("#") ? value : `#${value}`;
        if (formatted.length > 7) formatted = formatted.slice(0, 7);
        const regex = /^#([A-Fa-f0-9]{0,6})$/;
        if (regex.test(formatted)) {
             setHexCode(formatted.toUpperCase());
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0  bg-black/10 backdrop-blur-xs flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md relative">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                >
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold mb-4">Tạo Màu Mới</h2>
                <p className="text-sm text-gray-600 mb-6">
                    Thông tin màu này sẽ được lưu cùng với sản phẩm.
                </p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên màu *</label>
                        <input
                            type="text"
                            placeholder="VD: Đen"
                            value={colorName}
                            onChange={(e) => setColorName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mã màu (Prefix) *</label>
                        <input
                            type="text"
                            placeholder="VD: BLK"
                            value={colorPrefix}
                            onChange={(e) => setColorPrefix(e.target.value.toUpperCase())}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hex Code *</label>
                        <div className="flex items-center gap-2">
                            <span 
                                className="w-10 h-10 rounded border border-gray-300"
                                style={{ backgroundColor: hexCode.length === 7 ? hexCode : '#FFFFFF' }}
                            ></span>
                            <input
                                type="text"
                                placeholder="#FFFFFF"
                                value={hexCode}
                                onChange={(e) => handleHexChange(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleSave}
                    className="w-full bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 mt-6 font-semibold"
                >
                    Xong
                </button>
            </div>
        </div>
    );
}