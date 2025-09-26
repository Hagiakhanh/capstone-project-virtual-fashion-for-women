"use client";

import { api } from "@/api/instance";
import CartItems from "@/components/CartItem/CartItem";
import { CartItemDTO } from "@/models/CartItemDTO";
import formatPrice from "@/utils/formatPrice";
import { ShoppingBag } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export default function CartContainer() {

    const [cartItems, setCartItems] = useState<CartItemDTO[]>([]);
    const [selectAll, setSelectAll] = useState(() =>
        cartItems.every(item => item.selected)
    );

    const updateQuantity = useCallback(async (id: number, change: number) => {
        try {

            console.log("CartItems: ", cartItems);
            const selectedItem = cartItems.find(item => item.cartId == id);
            console.log("Update quantity for item:", selectedItem);
            const payload = {
                productVariantId: selectedItem?.productVariantId,
                quantity: (selectedItem?.quantityItem ?? 0) + change
            };
            const res = await api.put('/cartItem', payload);
            if (res.status === 200) {
                console.log("Quantity updated:", res.data);
                const data: CartItemDTO = {
                    ...res.data,
                    selected: true
                };
                setCartItems(prevItems =>
                    prevItems.map(item =>
                        item.cartId === data.cartId ? data : item
                    )
                );
            }
        } catch (error) {
            console.error("Fetch error:", error);
        }

    }, [cartItems]);

    const removeItem = useCallback(async (id: number) => {
        // setCartItems(items => {
        //     const newItems = items.filter(item => item.cartId !== id);
        //     // Update selectAll state if needed
        //     if (newItems.length === 0) {
        //         setSelectAll(false);
        //     }
        //     return newItems;
        // });
        const res = await api.delete(`/cartItem/${id}`);
        if (res.status === 200) {
            await fetchCartItem();
        }
    }, []);

    const toggleItemSelection = useCallback((id: number) => {
        setCartItems(items => {
            const newItems = items.map(item =>
                item.cartId === id ? { ...item, selected: !item.selected } : item
            );
            // Update selectAll based on all items selection status
            setSelectAll(newItems.every(item => item.selected));
            return newItems;
        });
    }, []);

    const toggleSelectAll = useCallback(() => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);
        setCartItems(items =>
            items.map(item => ({ ...item, selected: newSelectAll }))
        );
    }, [selectAll]);

    const selectedItems = cartItems.filter(item => item.selected);
    const totalAmount = selectedItems.reduce((sum, item) => sum + (item.responseProductVariantDto.currentPrice * item.quantityItem), 0);


    const fetchCartItem = useCallback(async () => {
        try {
            const res = await api.get('/cartItem');
            if (res.status == 200) {
                const data: CartItemDTO[] = res.data;
                const mappedData = data.map(item => ({
                    ...item,
                    selected: true
                }));
                setCartItems(mappedData);
            }
        } catch (error) {
            console.error("Fetch error:", error);
        }
    }, []);

    useEffect(() => {
        fetchCartItem();
    }, []);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items Section */}
            <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm">
                    {/* Header */}
                    <div className="border-b border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900">Giao Hàng</h2>
                        </div>

                        {/* Select All */}
                        <div className="flex items-center mt-4">
                            <input
                                type="checkbox"
                                id="select-all"
                                checked={selectAll}
                                onChange={toggleSelectAll}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="select-all" className="ml-2 text-sm text-gray-700">
                                Chọn tất cả
                            </label>
                        </div>
                    </div>

                    {/* Cart Items */}
                    <div className="p-6 space-y-6">
                        {cartItems.length === 0 ? (
                            <div className="text-center py-8">
                                <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">Giỏ hàng của bạn đang trống</p>
                            </div>
                        ) : (
                            cartItems.map((item) => (
                                <CartItems
                                    key={item.cartId}
                                    item={item}
                                    onUpdateQuantity={updateQuantity}
                                    onRemoveItem={removeItem}
                                    showDeleteButton={true}
                                    showQuantityControls={true}
                                    showCheckbox={true}
                                    onToggleSelection={toggleItemSelection}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-gray-600">Tổng đơn hàng</span>
                            <span className="text-xl font-semibold">{formatPrice(totalAmount ?? 0)}₫</span>
                        </div>
                    </div>

                    <button
                        onClick={() => alert('Proceed to checkout')}
                        className="w-full bg-black text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors mb-4"
                        disabled={totalAmount === 0}
                    >
                        THANH TOÁN
                    </button>

                    <button
                        onClick={() => alert('Continue shopping')}
                        className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                        TIẾP TỤC MUA SẮM
                    </button>
                </div>
            </div>
        </div>
    );
}