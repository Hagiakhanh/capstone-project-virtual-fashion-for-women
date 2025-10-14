'use client';

import { api } from "@/api/instance";
import CartItems from "@/components/CartItem/CartItem";
import { messageToast } from "@/helpers/toastHelper";
import { CartItemDTO } from "@/models/CartItemDTO";
import formatPrice from "@/utils/formatPrice";
import { message } from "antd";
import { debounce } from "lodash";
import { ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function CartContainer() {
    const router = useRouter();
    const [cartItems, setCartItems] = useState<CartItemDTO[]>([]);
    const [selectAll, setSelectAll] = useState(true);

    const fetchCartItem = useCallback(async () => {
        try {
            const res = await api.get('/cartItem');
            if (res.status == 200) {
                localStorage.setItem("checkoutCartIds", JSON.stringify([]));
                const data: CartItemDTO[] = res.data;
                const mappedData = data.map(item => ({ ...item, selected: true }));
                localStorage.setItem("checkoutCartIds", JSON.stringify(mappedData.map(i => i.cartId)));
                setCartItems(mappedData);
                window.dispatchEvent(new Event("cart-updated"));
            }
        } catch (error) { console.error("Fetch error:", error); }
    }, []);

    useEffect(() => {
        fetchCartItem();
    }, []);

    const toggleItemSelection = (id: number) => {
        setCartItems(items => {
            const newItems = items.map(item =>
                item.cartId === id ? { ...item, selected: !item.selected } : item
            );
            setSelectAll(newItems.every(item => item.selected));
            localStorage.setItem(
                "checkoutCartIds",
                JSON.stringify(newItems.filter(i => i.selected).map(i => i.cartId))
            );
            return newItems;
        });
    };

    const toggleSelectAll = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);

        setCartItems(items => {
            const newItems = items.map(item => ({ ...item, selected: newSelectAll }));

            const selectedIds = newSelectAll
                ? newItems.map(i => i.cartId)
                : [];
            localStorage.setItem("checkoutCartIds", JSON.stringify(selectedIds));

            return newItems;
        });
    };

    const debouncedUpdate = useCallback(
        debounce(async (id: number, productVariantId: string, quantity: number) => {
            try {
                await api.put('/cartItem', {
                    productVariantId,
                    quantity
                });
                window.dispatchEvent(new Event("cart-updated"));
            } catch (error) {
                console.error(error);
            }
        }, 1500),
        []
    );


    const updateQuantity = useCallback((id: number, change: number) => {
        setCartItems(prev => {
            const updatedItems = prev.map(item => {
                if (item.cartId === id) {
                    const newQuantity = Math.min(
                        Math.max(item.quantityItem + change, 1),
                        item.responseProductVariantDto.quantity
                    );

                    debouncedUpdate(id, item.productVariantId, newQuantity);

                    return { ...item, quantityItem: newQuantity };
                }
                return item;
            });

            return updatedItems;
        });
    }, [debouncedUpdate]);


    const removeItem = async (id: number) => {
        const res = await api.delete(`/cartItem/${id}`);
        if (res.status === 200) {
            const storedIds: number[] = JSON.parse(localStorage.getItem("checkoutCartIds") || "[]");
            const updatedIds = storedIds.filter((cartId: number) => cartId !== id);
            localStorage.setItem("checkoutCartIds", JSON.stringify(updatedIds));

            fetchCartItem();
            messageToast.success("Xóa sản phẩm khỏi giỏ hàng thành công");
            window.dispatchEvent(new Event("cart-updated"));
        }
    };

    const handleCheckout = () => {
        const ids = cartItems.filter(i => i.selected).map(i => i.cartId);
        if (ids.length === 0) return;
        localStorage.setItem("checkoutCartIds", JSON.stringify(ids));
        router.push("/checkout");
    };

    const totalAmount = cartItems
        .filter(i => i.selected)
        .reduce((sum, i) => sum + i.responseProductVariantDto.currentPrice * i.quantityItem, 0);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-8">
            {/* Left - Cart Items */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-md border border-gray-100">
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center space-x-3">
                        <ShoppingBag className="text-yellow-700 w-6 h-6" />
                        <h2 className="text-xl font-semibold text-gray-800">Giỏ hàng của bạn</h2>
                    </div>

                    <label className="flex items-center text-sm text-gray-600 space-x-2">
                        <input
                            type="checkbox"
                            checked={selectAll}
                            onChange={toggleSelectAll}
                            className="w-4 h-4 accent-yellow-600"
                        />
                        <span>Chọn tất cả</span>
                    </label>
                </div>

                <div className="p-6 space-y-5">
                    {cartItems.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            Giỏ hàng của bạn đang trống
                        </div>
                    ) : (
                        cartItems.map(item => (
                            <CartItems
                                key={item.cartId}
                                item={item}
                                onUpdateQuantity={updateQuantity}
                                showDeleteButton={true}
                                onRemoveItem={removeItem}
                                showCheckbox
                                onToggleSelection={toggleItemSelection}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Right - Summary */}
            <div className="lg:col-span-1 self-start bg-[#FFF8E1] rounded-2xl p-6 shadow-md border border-yellow-100">
                <div className="flex justify-between mb-6">
                    <span className="text-gray-700 font-medium">Tổng đơn hàng:</span>
                    <span className="text-2xl font-bold text-gray-900">
                        {formatPrice(totalAmount)}₫
                    </span>
                </div>

                <button
                    onClick={handleCheckout}
                    disabled={totalAmount === 0}
                    className={`w-full py-3 rounded-xl font-semibold transition mb-4
                            ${totalAmount === 0
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-black text-white hover:bg-yellow-700"
                        }`}
                >
                    THANH TOÁN
                </button>

                <button
                    onClick={() => router.push("/")}
                    className="w-full border border-yellow-600 text-yellow-700 py-3 rounded-xl font-medium hover:bg-yellow-100 transition"
                >
                    Tiếp tục mua sắm
                </button>
            </div>
        </div>

    );
}
