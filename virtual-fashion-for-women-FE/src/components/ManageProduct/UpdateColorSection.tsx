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
    usedColorIds: number[];
    existingNames: string[];
    existingPrefixes: string[];
    existingHexCodes: string[];
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
    usedColorIds,
    existingNames,
    existingPrefixes,
    existingHexCodes,
    }: UpdateColorSectionProps) {
    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Màu sắc & Biến thể</h2> {/* Sửa title */}
                <button
                    type="button"
                    onClick={onAddColor}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm font-medium" // Style lại nút
                    >
                    <Plus size={16} /> {/* Giảm size icon */}
                    Thêm màu
                </button>
            </div>

            {/* Render các màu */}
            {productColors.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">Chưa có màu nào được thêm.</p>
            )}
            
            {productColors.map((pc, colorIndex) => {
                // For each color item, calculate the prefixes/hex codes of OTHER new colors.
                // This prevents an item from flagging its own prefix/hex as a duplicate.
                const otherNewNames = productColors
                    .filter((otherPc, otherIndex) =>
                        colorIndex !== otherIndex && // Not the current item
                        !otherPc.colorId &&          // It's a new color
                        otherPc.colorName            // It has a name defined
                    )
                    .map(p => (p.colorName || "").toLowerCase());

                const otherNewPrefixes = productColors
                    .filter((otherPc, otherIndex) =>
                        colorIndex !== otherIndex && // Not the current item
                        !otherPc.colorId &&          // It's a new color
                        otherPc.colorPrefix          // It has a prefix defined
                    )
                    .map(p => (p.colorPrefix || "").toLowerCase());

                const otherNewHexCodes = productColors
                    .filter((otherPc, otherIndex) =>
                        colorIndex !== otherIndex && // Not the current item
                        !otherPc.colorId &&          // It's a new color
                        otherPc.hexCode              // It has a hex code defined
                    )
                    .map(p => (p.hexCode || "").toLowerCase());

                return (
                    <UpdateColorItem
                        key={pc.productColorId || `new-${colorIndex}`}
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
                        // --- Pass all validation props down ---
                        usedColorIds={usedColorIds}
                        otherNewNames={otherNewNames}
                        otherNewPrefixes={otherNewPrefixes}
                        otherNewHexCodes={otherNewHexCodes}
                        existingNames={existingNames}
                        existingPrefixes={existingPrefixes}
                        existingHexCodes={existingHexCodes}
                    />
                );
            })}
        </div>
    );
}