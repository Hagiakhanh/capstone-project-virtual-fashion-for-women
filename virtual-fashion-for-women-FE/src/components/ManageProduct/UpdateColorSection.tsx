// src/app/admin/product/update/[productId]/components/UpdateColorSection.tsx
import { Plus } from 'lucide-react';
import { Color, Size, UpdateProductColorFormData } from '@/models/RequestUpdateProduct';
import UpdateColorItem from './UpdateColorItem';

interface UpdateColorSectionProps {
    productColors: UpdateProductColorFormData[];
    colors: Color[];
    sizes: Size[];
    onAddColor: () => void;
    onRemoveColor: (index: number) => void;
    onUpdateColor: (index: number, field: string, value: any) => void;
    onAddVariant: (colorIndex: number) => void;
    onRemoveVariant: (colorIndex: number, variantIndex: number) => void;
    onUpdateVariant: (colorIndex: number, variantIndex: number, field: string, value: any) => void;
}

export default function UpdateColorSection({
    productColors,
    colors,
    sizes,
    onAddColor,
    onRemoveColor,
    onUpdateColor,
    onAddVariant,
    onRemoveVariant,
    onUpdateVariant,
    }: UpdateColorSectionProps) {
    return (
        <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Màu sắc sản phẩm</h2>
            <button
            type="button"
            onClick={onAddColor}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
            <Plus size={20} />
            Thêm màu
            </button>
        </div>

        {productColors.map((pc, colorIndex) => (
            <UpdateColorItem
            key={colorIndex}
            productColor={pc}
            colorIndex={colorIndex}
            colors={colors}
            sizes={sizes}
            onUpdate={(field, value) => onUpdateColor(colorIndex, field, value)}
            onRemove={() => onRemoveColor(colorIndex)}
            onAddVariant={() => onAddVariant(colorIndex)}
            onRemoveVariant={(variantIndex) => onRemoveVariant(colorIndex, variantIndex)}
            onUpdateVariant={(variantIndex, field, value) =>
                onUpdateVariant(colorIndex, variantIndex, field, value)
            }
            />
        ))}
        </div>
    );
}