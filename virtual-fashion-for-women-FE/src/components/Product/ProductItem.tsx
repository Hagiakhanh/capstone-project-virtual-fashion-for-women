'use client';
import { api } from '@/api/instance';
import { useAuth } from '@/contexts/AuthContext';
import { messageToast } from '@/helpers/toastHelper';
import formatPrice from '@/utils/formatPrice';
import { HeartOutlined, HeartFilled, PlusOutlined } from '@ant-design/icons';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';

function ProductItem({
    product,
    onWishlistSuccess,
    setLoading,
    disabled = false
}: {
    product?: any,
    onWishlistSuccess: (productId: string, newStatus: boolean) => void,
    setLoading: (loading: boolean) => void,
    disabled?: boolean
}) {

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

        const colorObj = product?.productColors?.find(
            (x: any) => x.productColorId === colorItem.productColorId
        );

        setImageForColor(colorObj?.productImagesDto[0]?.imageUrl || null);

        const sizeList = colorObj?.productVariants?.map((v: any) => ({
            sizeId: v.sizeDto.sizeId,
            sizeCode: v.sizeDto.sizeCode,
            productVariantId: v.productVariantId
        })) || [];

        setSizesForColor(sizeList);
    };

    const handleToggleWishlist = async (e: React.MouseEvent, productId: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            messageToast.error('Vui lòng đăng nhập');
            router.push('/login');
            return;
        }

        let newStatus = wishlist;

        try {
            if (!wishlist) {
                const res = await api.post('/wishlist', { productId });
                if (res.status === 200) {
                    newStatus = true;
                    messageToast.success('Đã thêm vào yêu thích');
                }
            } else {
                const res = await api.delete(`/wishlist/product/${productId}`);
                if (res.status === 200) {
                    newStatus = false;
                    messageToast.success('Đã xóa khỏi yêu thích');
                }
            }
            setWishlist(newStatus);
            onWishlistSuccess(productId, newStatus);
        } catch {
            messageToast.error('Thao tác thất bại');
        }
    };

    const handleChooseSize = (sizeItem: any) => {
        handleAddToCart(sizeItem.productVariantId);
        setShowSize(false);
    };

    const handleAddToCart = async (productVariantId: string) => {
        if (!user || user.role === 'guest') {
            messageToast.error('Vui lòng đăng nhập');
            router.push('/login');
            return;
        }
        if (disabled) {
            messageToast.info('Chương trình đã kết thúc');
            return;
        }

        try {
            setLoading(true);
            const res = await api.post('/cartItem', {
                productVariantId,
                quantity: 1
            });

            if (res.status === 201) {
                messageToast.success('Đã thêm vào giỏ hàng');
                window.dispatchEvent(new Event('cart-updated'));
            }
        } catch (error: any) {
            messageToast.error(error?.response?.data?.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setWishlist(product?.isInWishlist || false);
    }, [product?.isInWishlist]);

    useEffect(() => {
        if (product?.productColors?.length > 0) {
            setSelectedHex(null);
            setImageForColor(product?.mainImageUrl || null);
            setSizesForColor([]);
        }
    }, [product]);

    const displayPrice = product?.priceAtTime || product?.price;
    const hasDiscount = product?.percentDiscount > 0 && product?.priceAtTime < product?.price;

    return (
        <Link href={`/products/${product.productSlug}`}>
            <div className="p-4 bg-[#f3f3f3] rounded-2xl hover:shadow-lg hover:scale-[1.02] transition-all duration-300">

                <div
                    className="relative aspect-[3/4]"
                    onMouseLeave={() => setShowSize(false)}
                >
                    <img
                        src={imageForColor || product?.mainImageUrl}
                        alt={product?.productName}
                        className="w-full h-full object-cover rounded-2xl"
                    />

                    {/* Wishlist */}
                    <div
                        onClick={(e) => handleToggleWishlist(e, product?.productId)}
                        className="absolute top-2 right-2 bg-white p-2 rounded-full z-30"
                    >
                        {wishlist ? <HeartFilled style={{ color: 'red' }} /> : <HeartOutlined />}
                    </div>

                    {/* Nút + (hover để hiện size) */}
                    {!showSize && (
                        <div
                            onMouseEnter={() => selectedHex && setShowSize(true)}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (!selectedHex)
                                    messageToast.info("Chọn màu trước");
                            }}
                            className={`absolute bottom-2 right-2 p-2 rounded-full z-30 
                            ${selectedHex ? 'bg-white hover:bg-black hover:text-white cursor-pointer'
                                    : 'bg-gray-300 cursor-not-allowed'}`}
                        >
                            <PlusOutlined />
                        </div>
                    )}

                    {showSize && (
                        <div className="absolute bottom-0 w-full bg-white/90 py-2 flex justify-center gap-2 rounded-b-2xl">
                            {sizesForColor.map(size => (
                                <button
                                    key={size.sizeId}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleChooseSize(size);
                                    }}
                                    className="border px-3 py-1 rounded hover:bg-black hover:text-white"
                                >
                                    {size.sizeCode}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <h2 className="mt-3 line-clamp-1">{product?.productName}</h2>

                <div className="flex gap-2 mt-2">
                    {allColors.map((color:any)  => (
                        <div
                            key={color.productColorId}
                            onClick={(e) => handleChooseColor(e, color)}
                            className={`w-5 h-5 rounded-full cursor-pointer 
                            ${selectedHex === color.hexCode ? 'border-2 border-black' : ''}`}
                            style={{ background: color.hexCode }}
                        />
                    ))}
                </div>

                <div className="mt-2 flex gap-2 items-center">
                    <span className="text-red-600 font-bold">
                        {formatPrice(displayPrice)}đ
                    </span>
                    {hasDiscount && (
                        <span className="line-through text-gray-500 text-sm">
                            {formatPrice(product?.price)}đ
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}

export default ProductItem;
