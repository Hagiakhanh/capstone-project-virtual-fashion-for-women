"use client";
import { CartItemDTO } from '@/models/CartItemDTO';
import formatPrice from '@/utils/formatPrice';
import { Minus, Plus, Trash2 } from 'lucide-react';

export default function CartItems({
    item,
    onUpdateQuantity,
    onRemoveItem,
    onToggleSelection,
    showCheckbox = false,
    showDeleteButton = false,
    showQuantityControls = true,
}: {
    item: CartItemDTO;
    onUpdateQuantity?: (id: number, change: number) => void;
    onRemoveItem?: (id: number) => void;
    onToggleSelection?: (id: number) => void;
    showCheckbox?: boolean;
    showDeleteButton?: boolean;
    showQuantityControls?: boolean;
}) {

    return (
        <div className="flex items-start gap-4 p-4 min-h-[120px] hover:shadow-sm transition-all rounded-lg border border-gray-200">
            {/* Checkbox */}
            {showCheckbox && onToggleSelection && (
                <input
                    type="checkbox"
                    checked={item.selected}
                    onChange={() => onToggleSelection(item.cartId)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-2"
                />
            )}

            {/* Image */}
            <div className="w-20 h-20 bg-gradient-to-br from-gray-300 to-gray-400 rounded-lg flex-shrink-0">
                <img
                    src={item.responseProductVariantDto.imageUrl}
                    alt={item.responseProductVariantDto.variantName}
                    className="object-cover w-full h-full rounded-lg"
                />
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2 break-words max-w-[95%]">
                        {item.responseProductVariantDto.variantName} - {item.productVariantId}
                    </h3>
                    <div className="text-gray-400 mb-3 text-sm">
                        {item.responseProductVariantDto.colorDto?.colorName},
                        {item.responseProductVariantDto.sizeDto?.sizeCode}
                    </div>
                </div>

                {/* Quantity + Price */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center border border-gray-300 rounded-md px-2 py-1 flex-shrink-0">
                        {showQuantityControls ? (
                            <>
                                <button
                                    onClick={() => onUpdateQuantity?.(item.cartId, -1)}
                                    className="p-2 hover:bg-gray-100 rounded-l-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    disabled={item.quantityItem <= 1}
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="px-4 py-2 text-sm font-medium min-w-[3rem] text-center">
                                    {item.quantityItem}
                                </span>
                                <button
                                    onClick={() => onUpdateQuantity?.(item.cartId, 1)}
                                    className="p-2 hover:bg-gray-100 rounded-l-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    disabled={item.quantityItem >= item.responseProductVariantDto.quantity}
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </>
                        ) : (
                            <span className="text-sm font-medium">
                                Số lượng: {item.quantityItem}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-lg font-semibold text-gray-900 whitespace-nowrap">
                            {formatPrice(item.responseProductVariantDto.currentPrice)}₫
                        </span>

                        {showDeleteButton && onRemoveItem && (
                            <button
                                onClick={() => onRemoveItem(item.cartId)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors flex-shrink-0"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
