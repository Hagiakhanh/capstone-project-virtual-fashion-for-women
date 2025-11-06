// src/app/admin/product/create/components/BasicInfoSection.tsx
import { Category } from "@/models/RequestCreateProduct";

interface BasicInfoSectionProps {
    formData: {
        productName: string;
        description: string;
    };
    onUpdate: (field: string, value: any) => void;
    errors: {
        productName?: string;
        description?: string;
    };
}

export default function BasicInfoSection({
    formData,
    onUpdate,
    errors,
}: BasicInfoSectionProps) {
    return (
        <div className="bg-white rounded-lg shadow-lg p-10">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
                Thông Tin Chung
            </h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên sản phẩm *
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.productName}
                        onChange={(e) => onUpdate("productName", e.target.value)}
                        //className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.productName ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {errors.productName && (
                        <p className="text-red-500 text-xs mt-1">{errors.productName}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mô tả *
                    </label>
                    <textarea
                        required
                        value={formData.description}
                        onChange={(e) => onUpdate("description", e.target.value)}
                        rows={4}
                        //className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.description ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {errors.description && (
                        <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                    )}
                </div>
            </div>
        </div>
    );
}