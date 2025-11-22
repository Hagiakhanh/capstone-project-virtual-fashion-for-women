'use client';
import { api } from '@/api/instance';
import { useAuth } from '@/contexts/AuthContext';
import { messageToast } from '@/helpers/toastHelper';
import formatPrice from '@/utils/formatPrice';
import { HeartOutlined, HeartFilled, PlusOutlined } from '@ant-design/icons';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';

// Cập nhật kiểu của onWishlistSuccess để nhận hai tham số: productId (string) và newStatus (boolean)
function ProductItem({ product, onWishlistSuccess, setLoading }: 
    { 
        product?: any, 
        onWishlistSuccess: (productId: string, newStatus: boolean) => void, // ĐÃ SỬA: Thêm tham số
        setLoading: (loading: boolean) => void 
    }) {
    
    // Khởi tạo wishlist từ prop, dùng || false cho an toàn
    const [wishlist, setWishlist] = useState<boolean>(product?.isInWishlist || false);
    const [selectedHex, setSelectedHex] = useState<string | null>(null);
    const [imageForColor, setImageForColor] = useState<string | null>(null);
    const [showSize, setShowSize] = useState<boolean>(false);
    const [sizesForColor, setSizesForColor] = useState<any[]>([]);
    const { user } = useAuth();
    const router = useRouter();

    const allColors = useMemo(() => {
        return product?.productColors?.map((x: any) => ({
            hexCode: x?.color?.hexCode,
            productColorId: x?.productColorId
        })) || [];
    }, [product?.productColors]);

    const handleChooseColor = (e: React.MouseEvent, colorItem: any) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedHex(colorItem.hexCode);
        const colorObj = product?.productColors?.find((x: any) => x.productColorId === colorItem.productColorId);
        setImageForColor(colorObj?.productImagesDto[0]?.imageUrl || null);

        const sizeList = colorObj?.productVariants?.map((v: any) => ({
            sizeId: v.sizeDto.sizeId,
            sizeCode: v.sizeDto.sizeCode,
            productVariantId: v.productVariantId
        })) || [];
        setSizesForColor(sizeList);
    };

    // ĐÃ SỬA LOGIC ONWISHLIST SUCCESS Ở ĐÂY
    const handleToggleWishlist = async (e: React.MouseEvent, productId: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            messageToast.error('Vui lòng đăng nhập để thêm vào danh sách yêu thích');
            router.push("/login");
            return;
        }

        const currentStatus = wishlist;
        let newStatus = currentStatus;

        try {
            if (!currentStatus) {
                // Thêm vào Wishlist
                const response = await api.post('/wishlist', { productId });
                if (response.status === 200) {
                    newStatus = true;
                    setWishlist(newStatus); // Cập nhật state nội bộ
                    messageToast.success("Thêm vào yêu thích thành công.");
                }
            } else {
                // Xóa khỏi Wishlist
                const response = await api.delete(`/wishlist/product/${productId}`);
                if (response.status === 200) {
                    newStatus = false;
                    setWishlist(newStatus); // Cập nhật state nội bộ
                    messageToast.success("Xóa khỏi yêu thích thành công.");
                }
            }
            // Truyền productId và trạng thái MỚI ra component cha
            onWishlistSuccess(productId, newStatus); 
        } catch (error) {
            console.error("Lỗi khi thêm/xóa sản phẩm vào danh sách yêu thích:", error);
            messageToast.error("Thao tác thất bại.");
        }
    };

    const handleChooseSize = (sizeItem: any) => {
        handleAddToCart(sizeItem.productVariantId);
        setShowSize(false);
    };

    const handleAddToCart = async (productVariantId: string) => {
        if (user?.role === 'guest' || !user) {
            messageToast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
            router.push("/login");
            return;
        }
        try {
            setLoading(true);
            const payload = {
                productVariantId: productVariantId,
                quantity: 1,
            };
            const response = await api.post('/cartItem', payload);
            if (response.status === 201) {
                messageToast.success('Thêm vào giỏ hàng thành công');
                window.dispatchEvent(new Event("cart-updated"));
            }
        } catch (error: any) {
            messageToast.error(error?.response?.data?.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        // Đồng bộ state nội bộ với prop khi prop thay đổi
        setWishlist(product?.isInWishlist || false);
    }, [product?.isInWishlist]);

    useEffect(() => {
        if (product?.productColors?.length > 0) {
            setSelectedHex(null);
            setImageForColor(product?.mainImageUrl || null);
            setSizesForColor([]);
        }
    }, [product]);

    // Giá hiển thị: Ưu tiên priceAtTime (giá sale) nếu có
    const displayPrice = product?.priceAtTime || product?.price;
    const originalPrice = product?.price;
    const hasDiscount = product?.percentDiscount > 0 && product?.priceAtTime < product?.price;

    return (
        <Link href={`/products/${product.productSlug}`}>
            <div className="p-[1rem] relative rounded-2xl bg-[#f3f3f3] cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
                {/* Hình ảnh */}
                <div
                    className="flex justify-center aspect-[3/4] overflow-hidden relative"
                    onMouseLeave={() => setShowSize(false)}
                >
                    <img
                        src={imageForColor ? imageForColor : product?.mainImageUrl}
                        alt={product?.productName}
                        className="w-full h-auto object-cover rounded-2xl"
                    />

                    {/* Badge Sale (Thêm từ bản sửa trước) */}
                    {hasDiscount && (
                        <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full z-30">
                            -{product.percentDiscount}%
                        </div>
                    )}

                    {/* Wishlist */}
                    <div
                        onClick={(e) => handleToggleWishlist(e, product?.productId)}
                        className="absolute z-30 top-0 right-0 m-2 p-2 rounded-full bg-white text-xl shadow-md transition hover:scale-110"
                    >
                        {wishlist ? <HeartFilled style={{ color: 'red' }} /> : <HeartOutlined />}
                    </div>

                    {/* Nút + */}
                    {!showSize && (
                        <div
                            onMouseEnter={() => selectedHex && setShowSize(true)}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (!selectedHex) {
                                    messageToast.info("Vui lòng chọn màu sắc trước.");
                                    return;
                                }
                            }}
                            className={`absolute bottom-2 right-2 rounded-full p-2 shadow-md transition z-30 
                                ${selectedHex
                                    ? 'bg-white hover:bg-black hover:text-white cursor-pointer'
                                    : 'bg-gray-300 cursor-not-allowed pointer-events-none'}`}
                        >
                            <PlusOutlined />
                        </div>
                    )}

                    {showSize && (
                        <div
                            onMouseLeave={() => setShowSize(false)}
                            className="absolute bottom-0 left-0 right-0 bg-white/90 py-2 flex justify-center gap-2 rounded-b-2xl z-40 shadow-xl"
                        >
                            {sizesForColor.length > 0 ? (
                                sizesForColor.map((sizeItem) => (
                                    <button
                                        key={sizeItem.sizeId}
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleChooseSize(sizeItem); }}
                                        className="border border-black rounded-md px-3 py-1 text-sm hover:bg-black hover:text-white transition"
                                    >
                                        {sizeItem.sizeCode}
                                    </button>
                                ))
                            ) : (
                                <span className="text-sm text-gray-500">Hết hàng</span>
                            )}
                        </div>
                    )}
                </div>

                {/* Nội dung */}
                <div className="flex flex-col mt-5">
                    <div className="line-clamp-1">
                        <h2 className="text-lg font-normal">{product?.productName}</h2>
                    </div>

                    {/* Khối màu */}
                    {allColors.length > 0 && (
                        <div
                            className="flex gap-2 mt-2 mb-1"
                            onClick={(e) => e.preventDefault()}
                            onMouseDown={(e) => e.stopPropagation()}
                            onTouchStart={(e) => e.stopPropagation()}
                        >
                            {allColors.map((item: any) => {
                                const isSelected = selectedHex === item.hexCode;
                                return (
                                    <div
                                        key={item.productColorId}
                                        onClick={(e) => handleChooseColor(e, item)}
                                        className={`${isSelected ? 'border-2 border-black ' : ''} w-5 h-5 rounded-full shadow-sm cursor-pointer transition-all`}
                                        style={{ backgroundColor: item.hexCode }}
                                    ></div>
                                )
                            })}
                        </div>
                    )}

                    <div className="mt-2 flex items-center gap-2">
                        {/* Giá */}
                        <span className="font-bold text-lg text-red-600">
                             {displayPrice ? `${formatPrice(displayPrice)}đ` : '0đ'}
                        </span>
                        {/* Giá gốc (nếu có giảm giá) */}
                        {hasDiscount && (
                            <span className="text-sm text-gray-500 line-through">
                                {originalPrice ? `${formatPrice(originalPrice)}đ` : ''}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default ProductItem;