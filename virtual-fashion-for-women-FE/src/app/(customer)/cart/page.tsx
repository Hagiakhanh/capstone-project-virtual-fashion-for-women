'use client';

import { api } from "@/api/instance";
import CartItems from "@/components/CartItem/CartItem";
import LoadingOverlay from "@/components/Loading/LoadingOverlay";
import { messageToast } from "@/helpers/toastHelper";
import { CartItemDTO } from "@/models/CartItemDTO";
import formatPrice from "@/utils/formatPrice";
import { debounce } from "lodash";
import { ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function CartContainer() {
    const router = useRouter();
    const [cartItems, setCartItems] = useState<CartItemDTO[]>([]);
    const [selectAll, setSelectAll] = useState(true);
    const [loading, setLoading] = useState(false);

    const fetchCartItem = async () => {
        try {
            setLoading(true);
            const res = await api.get('/cartItem');
            if (res.status == 200) {
                sessionStorage.setItem("checkoutCartIds", JSON.stringify([]));
                const data: CartItemDTO[] = res.data;
                const mappedData = data.map(item => ({ ...item, selected: true }));
                sessionStorage.setItem("checkoutCartIds", JSON.stringify(mappedData.map(i => i.cartId)));
                setCartItems(mappedData);
                window.dispatchEvent(new Event("cart-updated"));
            }
        } catch (error: any) {
            console.error(error?.response?.data?.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCartItem();
    }, []);

    const toggleItemSelection = (id: number) => {
        setCartItems(items => {
            const newItems = items.map(item =>
                item.cartId === id ? { ...item, selected: !item.selected } : item
            );
            setSelectAll(newItems.every(item => item.selected));
            sessionStorage.setItem(
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
            sessionStorage.setItem("checkoutCartIds", JSON.stringify(selectedIds));

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
            const storedIds: number[] = JSON.parse(sessionStorage.getItem("checkoutCartIds") || "[]");
            const updatedIds = storedIds.filter((cartId: number) => cartId !== id);
            sessionStorage.setItem("checkoutCartIds", JSON.stringify(updatedIds));

            fetchCartItem();
            messageToast.success("Xóa sản phẩm khỏi giỏ hàng thành công");
            window.dispatchEvent(new Event("cart-updated"));
        }
    };

    const handleCheckout = () => {
        setLoading(true);
        const ids = cartItems.filter(i => i.selected).map(i => i.cartId);
        if (ids.length === 0) return;
        sessionStorage.setItem("checkoutCartIds", JSON.stringify(ids));
        setLoading(false);
        router.push("/checkout");
    };

    const totalAmount = cartItems
        .filter(i => i.selected)
        .reduce((sum, i) => sum + i.responseProductVariantDto.currentPrice * i.quantityItem, 0);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8 py-4 md:py-8 px-3 md:px-0">
            {loading && <LoadingOverlay size={60} />}

            {/* Left - Cart Items - Responsive */}
            <div className="lg:col-span-2 bg-white rounded-xl md:rounded-2xl shadow-md border border-gray-100">
                {/* Header - Responsive */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 md:p-6 border-b">
                    <div className="flex items-center space-x-2 md:space-x-3">
                        <ShoppingBag className="text-yellow-700 w-5 h-5 md:w-6 md:h-6" />
                        <h2 className="text-lg md:text-xl font-semibold text-gray-800">
                            Giỏ hàng của bạn
                        </h2>
                    </div>

                    <label className="flex items-center text-xs md:text-sm text-gray-600 space-x-2">
                        <input
                            type="checkbox"
                            checked={selectAll}
                            onChange={toggleSelectAll}
                            className="w-4 h-4 accent-yellow-600"
                        />
                        <span>Chọn tất cả</span>
                    </label>
                </div>

                {/* Cart Items - Responsive */}
                <div className="p-4 md:p-6 space-y-4 md:space-y-5">
                    {cartItems.length === 0 ? (
                        <div className="text-center py-6 md:py-8 text-gray-500">
                            <ShoppingBag className="w-10 h-10 md:w-12 md:h-12 text-gray-400 mx-auto mb-2 md:mb-3" />
                            <p className="text-sm md:text-base">Giỏ hàng của bạn đang trống</p>
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

            {/* Right - Summary - Responsive */}
            <div className="lg:col-span-1 lg:self-start bg-[#FFF8E1] rounded-xl md:rounded-2xl p-4 md:p-6 shadow-md border border-yellow-100">
                {/* Total - Responsive */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4 md:mb-6">
                    <span className="text-sm md:text-base text-gray-700 font-medium">
                        Tổng đơn hàng:
                    </span>
                    <span className="text-xl md:text-2xl font-bold text-gray-900">
                        {formatPrice(totalAmount)}₫
                    </span>
                </div>

                {/* Checkout Button - Responsive */}
                <button
                    onClick={handleCheckout}
                    disabled={totalAmount === 0}
                    className={`w-full py-2.5 md:py-3 rounded-lg md:rounded-xl text-sm md:text-base font-semibold transition mb-3 md:mb-4
                        ${totalAmount === 0
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-black text-white hover:bg-yellow-700"
                        }`}
                >
                    THANH TOÁN
                </button>

                {/* Continue Shopping Button - Responsive */}
                <button
                    onClick={() => router.push("/")}
                    className="w-full border border-yellow-600 text-yellow-700 py-2.5 md:py-3 rounded-lg md:rounded-xl text-sm md:text-base font-medium hover:bg-yellow-100 transition"
                >
                    Tiếp tục mua sắm
                </button>
            </div>
        </div>
    );
}