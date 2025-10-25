'use client';
import React, { useState } from 'react';
import { X, Download, RotateCcw, Loader, AlertCircle, Minus, Plus, ShoppingCart } from 'lucide-react';
import formatPrice from '@/utils/formatPrice';
import { SizeDTO } from '@/models/SizeDto';
import { ProductVariant } from '@/models/RequestUpdateProduct';
import { ProductVariantDTO } from '@/models/ProductVariantDTO';


interface TryOnResultModalProps {
    isOpen: boolean;
    onClose: () => void;
    resultImageUrl?: string;
    originalImageUrl?: string;
    isCreatingLoading?: boolean;
    isLoading?: boolean;
    progress?: number;
    errorMessage?: string;
    onRetry?: () => void;
    tryOnProducts?: any[];
    onAddToCart?: (productVariantId: string, quantity: number) => void;
}

export default function TryOnResultModal({
    isOpen,
    onClose,
    resultImageUrl,
    isCreatingLoading = false,
    isLoading = false,
    progress = 0,
    errorMessage,
    onRetry,
    tryOnProducts = [],
    onAddToCart
}: TryOnResultModalProps) {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [showCartView, setShowCartView] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [selectedProductVariant, setSelectedProductVariant] = useState<ProductVariantDTO | null>(null);
    const [quantity, setQuantity] = useState(1);

    if (!isOpen) return null;

    const handleDownload = () => {
        if (resultImageUrl) {
            const link = document.createElement('a');
            link.href = resultImageUrl;
            link.download = `virtual-tryon-${Date.now()}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleAddToCartClick = () => {
        setShowCartView(true);
    };

    const handleBackToResult = () => {
        setShowCartView(false);
        setSelectedProduct(null);
        setSelectedProductVariant(null);
        setQuantity(1);
    };

    const handleProductClick = (product: any) => {
        setSelectedProduct(product);
        setSelectedProductVariant(null);
        setQuantity(1);
    };

    const handleProductVariantSelect = (productVariant: ProductVariantDTO) => {
        setSelectedProductVariant(productVariant);
        setQuantity(1);
    };

    const handleAddToCart = () => {
        if (selectedProductVariant && onAddToCart) {
            onAddToCart(selectedProductVariant.productVariantId, quantity);
            // Reset sau khi thêm
            setSelectedProduct(null);
            setSelectedProductVariant(null);
            setQuantity(1);
        }
    };

    const canAddToCart = resultImageUrl && !isLoading && !isCreatingLoading && !errorMessage && tryOnProducts.length > 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-scaleIn">
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-200 to-orange-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {showCartView ? 'Thêm vào giỏ hàng' : 'Kết quả thử đồ'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/30 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6 text-gray-800" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                    {!showCartView ? (
                        // View kết quả try-on
                        <div className="flex justify-center items-center min-h-[400px]">
                            {isCreatingLoading ? (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="relative">
                                        <div className="w-20 h-20 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
                                        <Loader className="w-8 h-8 text-orange-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                                    </div>
                                    <p className="text-gray-600 font-medium text-lg">Đang tạo yêu cầu...</p>
                                    <p className="text-gray-400 text-sm">Vui lòng đợi trong giây lát</p>
                                </div>
                            ) : isLoading ? (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="relative w-24 h-24">
                                        <div
                                            className="absolute inset-0 rounded-full"
                                            style={{
                                                background: `conic-gradient(#f97316 ${progress}%, #fcd9bd ${progress}% 100%)`
                                            }}
                                        ></div>
                                        <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                                            <span className="text-xl font-bold text-gray-800">
                                                {progress}%
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 font-medium text-lg">
                                        Đang xử lý ảnh...
                                    </p>
                                    <p className="text-gray-400 text-sm">
                                        Quá trình này có thể mất vài giây
                                    </p>
                                </div>
                            ) : errorMessage ? (
                                <div className="text-center">
                                    {resultImageUrl && (
                                        <img
                                            src={resultImageUrl}
                                            alt="Original"
                                            className="max-w-full max-h-[500px] rounded-2xl shadow-lg mb-4"
                                        />
                                    )}
                                    <div className="flex items-center justify-center gap-2 text-red-600">
                                        <AlertCircle className="w-6 h-6" />
                                        <p className="font-semibold">{errorMessage}</p>
                                    </div>
                                </div>
                            ) : resultImageUrl ? (
                                <div className="relative w-full flex justify-center">
                                    {!imageLoaded && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                    <img
                                        src={resultImageUrl}
                                        alt="Try-on result"
                                        className={`max-w-full max-h-[500px] rounded-2xl shadow-lg transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'
                                            }`}
                                        onLoad={() => setImageLoaded(true)}
                                    />
                                </div>
                            ) : (
                                <div className="text-center text-gray-600">
                                    Không có kết quả
                                </div>
                            )}
                        </div>
                    ) : (
                        // View giỏ hàng
                        <div className="space-y-6">
                            {!selectedProduct ? (
                                // Danh sách sản phẩm đã try-on
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                        Sản phẩm đã thử ({tryOnProducts.length})
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {tryOnProducts.map((product) => (
                                            <div
                                                key={product.productColors[0].productColorId}
                                                className="border-2 border-gray-200 rounded-xl p-4 hover:border-orange-400 transition-all cursor-pointer group"
                                            >
                                                <div className="flex gap-4">
                                                    <img
                                                        src={product.productColors[0].noBgImgUrl}
                                                        alt={product.productName}
                                                        className="w-24 h-24 object-cover rounded-lg"
                                                    />
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-gray-800 mb-1">
                                                            {product.productName}
                                                        </h4>
                                                        <p className="text-sm text-gray-600 mb-2">
                                                            Màu: {product.productColors[0].color.colorName}
                                                        </p>
                                                        <p className="text-lg font-bold text-orange-600 mb-3">
                                                            {formatPrice(product.priceAtTime)} ₫
                                                        </p>
                                                        <button
                                                            onClick={() => handleProductClick(product)}
                                                            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors text-sm font-medium"
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                            Chọn size
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                // Chi tiết sản phẩm và chọn size
                                <div>
                                    <button
                                        onClick={handleBackToResult}
                                        className="text-orange-600 hover:text-orange-700 font-medium mb-4 flex items-center gap-2"
                                    >
                                        ← Quay lại
                                    </button>

                                    <div className="border-2 border-gray-200 rounded-xl p-6">
                                        <div className="flex gap-6 mb-6">
                                            <img
                                                src={selectedProduct.productColors[0].noBgImgUrl}
                                                alt={selectedProduct.productName}
                                                className="w-32 h-32 object-cover rounded-lg"
                                            />
                                            <div className="flex-1">
                                                <h4 className="text-xl font-bold text-gray-800 mb-2">
                                                    {selectedProduct.productName}
                                                </h4>
                                                <p className="text-gray-600 mb-2">
                                                    Màu: {selectedProduct.productColors[0].color.colorName}
                                                </p>
                                                <p className="text-2xl font-bold text-orange-600">
                                                    {formatPrice(selectedProduct.price)} ₫
                                                </p>
                                            </div>
                                        </div>

                                        {/* Chọn size */}
                                        <div className="mb-6">
                                            <h5 className="font-semibold text-gray-800 mb-3">Chọn size:</h5>
                                            <div className="grid grid-cols-4 gap-3">
                                                {selectedProduct.productColors[0].productVariants.map((productVariants: ProductVariantDTO) => (
                                                    <button
                                                        key={productVariants.sizeDto?.sizeId}
                                                        onClick={() => handleProductVariantSelect(productVariants)}
                                                        disabled={productVariants.quantity === 0}
                                                        className={`px-4 py-3 rounded-lg font-medium transition-all ${selectedProductVariant?.sizeDto?.sizeId === productVariants.sizeDto?.sizeId
                                                            ? 'bg-orange-500 text-white border-2 border-orange-500'
                                                            : productVariants.quantity === 0
                                                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                                : 'bg-white border-2 border-gray-300 hover:border-orange-400 text-gray-800'
                                                            }`}
                                                    >
                                                        <div>{productVariants.sizeDto?.sizeCode}</div>
                                                        {productVariants.quantity === 0 && (
                                                            <div className="text-xs mt-1">Hết hàng</div>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Chọn số lượng */}
                                        {selectedProductVariant && (
                                            <div className="mb-6">
                                                <h5 className="font-semibold text-gray-800 mb-3">Số lượng:</h5>
                                                <div className="flex items-center gap-4">
                                                    <button
                                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                        className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <span className="text-xl font-semibold w-12 text-center">
                                                        {quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => setQuantity(Math.min(selectedProductVariant.quantity, quantity + 1))}
                                                        className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                    <span className="text-sm text-gray-600">
                                                        (Còn {selectedProductVariant.quantity} sản phẩm)
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Nút thêm vào giỏ */}
                                        <button
                                            onClick={handleAddToCart}
                                            disabled={!selectedProductVariant}
                                            className={`w-full py-3 rounded-xl font-semibold text-lg transition-all ${selectedProductVariant
                                                ? 'bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg'
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                }`}
                                        >
                                            {selectedProductVariant ? 'Thêm vào giỏ hàng' : 'Vui lòng chọn size'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="bg-gray-50 px-6 py-4 flex flex-wrap gap-3 justify-center border-t border-gray-200">
                    {!showCartView && canAddToCart && (
                        <button
                            onClick={handleAddToCartClick}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            Thêm vào giỏ hàng
                        </button>
                    )}

                    {!showCartView && resultImageUrl && !isLoading && !isCreatingLoading && !errorMessage && (
                        <button
                            onClick={handleDownload}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-200 to-orange-200 hover:from-amber-300 hover:to-orange-300 text-gray-800 font-semibold rounded-xl transition-all shadow-md hover:shadow-lg"
                        >
                            <Download className="w-5 h-5" />
                            Tải xuống
                        </button>
                    )}

                    {!showCartView && onRetry && (
                        <button
                            onClick={onRetry}
                            disabled={isLoading || isCreatingLoading}
                            className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-100 text-gray-800 font-semibold rounded-xl transition-all border-2 border-gray-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <RotateCcw className="w-5 h-5" />
                            Thử lại
                        </button>
                    )}

                    {showCartView && !selectedProduct && (
                        <button
                            onClick={handleBackToResult}
                            className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-100 text-gray-800 font-semibold rounded-xl transition-all border-2 border-gray-300 shadow-md hover:shadow-lg"
                        >
                            ← Quay lại kết quả
                        </button>
                    )}

                    <button
                        onClick={() => {
                            onClose();
                            setShowCartView(false);
                            setSelectedProduct(null);
                            setSelectedProductVariant(null);
                            setQuantity(1);
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl transition-all shadow-md hover:shadow-lg"
                    >
                        Đóng
                    </button>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes scaleIn {
                    from { opacity: 0; transform: scale(0.9); }
                    to { opacity: 1; transform: scale(1); }
                }

                .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
                .animate-scaleIn { animation: scaleIn 0.3s ease-out; }
            `}</style>
        </div>
    );
}