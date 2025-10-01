"use client";
import { CartItemDTO } from '@/models/CartItemDTO';
import formatPrice from '@/utils/formatPrice';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';


// Flexible ProductItem Component - Reusable for cart and other pages
export default function CartItems({
    item,
    onUpdateQuantity,
    onRemoveItem,
    onToggleSelection,
    showCheckbox = false,
    showDeleteButton = false,
    showQuantityControls = true, // control quantity +/- buttons
    variant = "default" // "default" | "cart" | "order" | "checkout"
}: {
    item: CartItemDTO;
    onUpdateQuantity?: (id: number, change: number) => void;
    onRemoveItem?: (id: number) => void;
    onToggleSelection?: (id: number) => void;
    showCheckbox?: boolean;
    showDeleteButton?: boolean;
    showQuantityControls?: boolean;
    variant?: "default" | "cart" | "order" | "checkout";
}) {

    const containerClasses = variant === "cart"
        ? "flex items-start gap-4 p-4 border border-gray-200 rounded-lg"
        : "flex items-start gap-4 p-4 bg-white rounded-lg border border-gray-100";

    return (
        <div className={containerClasses}>
            {/* Checkbox - chỉ hiển thị khi showCheckbox = true */}
            {showCheckbox && onToggleSelection && (
                <input
                    type="checkbox"
                    checked={item.selected}
                    onChange={() => onToggleSelection(item.cartId)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-2"
                />
            )}

            {/* Product Image */}
            <div className="w-20 h-20 bg-gradient-to-br from-gray-300 to-gray-400 rounded-lg flex-shrink-0 flex items-center justify-center">
                <img src={item.responseProductVariantDto.imageUrl} alt={item.responseProductVariantDto.variantName} className="object-cover w-full h-full rounded-lg" />
            </div>

            {/* Product Details */}
            <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                    {item.responseProductVariantDto.variantName} - {item.productVariantId}
                </h3>
                <div className='text-gray-400  mb-3'>
                    {item.responseProductVariantDto.colorDto?.colorName},{item.responseProductVariantDto.sizeDto?.sizeCode}
                </div>
                {/* <div className="text-sm text-gray-500 mb-3">
                    {item.brand}, {item.size}
                </div> */}

                {/* Quantity and Price Controls */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center border border-gray-300 rounded-md px-2 py-1">
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
                                    className="p-2 hover:bg-gray-100 rounded-r-md transition-colors"
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

                    <div className="flex items-center gap-4">
                        <span className="text-lg font-semibold text-gray-900">
                            {formatPrice(item.responseProductVariantDto.currentPrice)}₫
                        </span>
                        {/* Delete button - chỉ hiển thị khi showDeleteButton = true */}
                        {showDeleteButton && onRemoveItem && (
                            <button
                                onClick={() => onRemoveItem(item.cartId)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};