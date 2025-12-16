'use client';
import React, { useState } from 'react';
import { X, Download, RotateCcw, Loader, AlertCircle, Minus, Plus, ShoppingCart } from 'lucide-react';
import formatPrice from '@/utils/formatPrice';
import { ProductVariantDTO } from '@/models/ProductVariantDTO';
import { ResponseProductDTO } from '@/models/ResponseProductDTO';
import { Category } from '@/models/RequestCreateProduct';
import BodyMeasurementForm from './BodyMeasurementForm';
import { Characteristic } from '@/models/CharacteristicDTO';
import { api } from '@/api/instance';
import { messageToast } from '@/helpers/toastHelper';
import { set } from 'lodash';

interface TryOnResultModalProps {
    isOpen: boolean;
    onClose: () => void;
    resultImageUrl?: string;
    isCreatingLoading?: boolean;
    isLoading?: boolean;
    progress?: number;
    errorMessage?: string;
    onRetry?: () => void;
    tryOnProducts?: any[];
    category?: Category[]
    onAddToCart?: (productVariantId: string, quantity: number) => void;
    characteristicData?: Characteristic | null;
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
    category = [],
    onAddToCart,
    characteristicData,
}: TryOnResultModalProps) {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [showCartView, setShowCartView] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<ResponseProductDTO>();
    const [selectedProductVariant, setSelectedProductVariant] = useState<ProductVariantDTO | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [showBodyMeasurementForm, setShowBodyMeasurementForm] = useState(false);
    const [clothingType, setClothingType] = useState<Category | undefined>();
    const [recommendedVariant, setRecommendedVariant] = useState<ProductVariantDTO | null>(null);

    if (!isOpen) return null;

    // Kiểm tra xem có thể đóng modal không
    const canClose = resultImageUrl && !isLoading && !isCreatingLoading;

    const handleDownload = async () => {
        if (!resultImageUrl) return;

        try {
            const response = await fetch(resultImageUrl);
            const blob = await response.blob();

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `virtual-tryon-${Date.now()}.jpg`;

            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading image:", error);
            messageToast.error("Không thể tải ảnh xuống!");
        }
    };

    const handleAddToCartClick = () => {
        setShowCartView(true);
    };

    const handleSkipFromMeasurementForm = () => {
        setRecommendedVariant(null);
        setShowBodyMeasurementForm(false);
        // setSelectedProduct(undefined);
        // setSelectedProductVariant(null);
        // setQuantity(1);
    }

    const handleBackFromMeasurementForm = () => {
        setShowBodyMeasurementForm(false);
        setSelectedProduct(undefined);
        setSelectedProductVariant(null);
        setQuantity(1);
    }

    const handleBackToResult = () => {
        setRecommendedVariant(null);
        setShowCartView(false);
        setSelectedProduct(undefined);
        setShowBodyMeasurementForm(false);
        setSelectedProductVariant(null);
        setQuantity(1);
    };

    const handleProductClick = (product: ResponseProductDTO) => {
        const categoryName = category.find(c => c.categoryId == product.categoryId);
        setSelectedProduct(product);
        setClothingType(categoryName);
        setShowBodyMeasurementForm(true);
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
            setSelectedProduct(undefined);
            setSelectedProductVariant(null);
            setQuantity(1);
        }
    };

    const handleClose = () => {
        // Chỉ cho phép đóng nếu có kết quả ảnh
        if (!canClose) return;

        onClose();
        setRecommendedVariant(null);
        setShowCartView(false);
        setSelectedProduct(undefined);
        setShowBodyMeasurementForm(false);
        setSelectedProductVariant(null);
        setQuantity(1);
    }

    const handleSubmitMeasurement = async (measurements: Record<string, number>) => {
        try {
            const payload = {
                shoulder: measurements.shoulder || 0,
                bust: measurements.bust || 0,
                waist: measurements.waist || 0,
                hips: measurements.hips || 0,
                productColorId: selectedProduct?.productColors[0].productColorId || '',
                categoryId: clothingType?.categoryId
            }
            const response = await api.post("/variant-recommendation", payload);
            setRecommendedVariant(response.data);
            if (response.data) {
                const match = selectedProduct?.productColors[0].productVariants
                    .find(v => v.sizeDto?.sizeId === response.data.sizeDto.sizeId);
                if (match) {
                    setSelectedProductVariant(match);
                }
            }
            setShowBodyMeasurementForm(false);
        } catch (err) {
            console.error(err);
            messageToast.error("Không thể xác định size, vui lòng thử lại!");
        }
    };

    const canAddToCart = resultImageUrl && !isLoading && !isCreatingLoading && !errorMessage && tryOnProducts.length > 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-4xl max-h-[95vh] md:max-h-[90vh] overflow-hidden animate-scaleIn flex flex-col">
                {/* Header - Responsive */}
                <div className="bg-gradient-to-r from-amber-200 to-orange-200 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between flex-shrink-0">
                    <h2 className="text-lg md:text-2xl font-bold text-gray-800">
                        {showCartView ? 'Thêm vào giỏ hàng' : 'Kết quả thử đồ'}
                    </h2>
                    <button
                        disabled={!canClose}
                        onClick={handleClose}
                        className={`p-1.5 md:p-2 rounded-full transition-colors
                                ${!canClose
                                ? "opacity-40 cursor-not-allowed pointer-events-none"
                                : "hover:bg-white/30"
                            }`}
                        title={!canClose ? "Vui lòng đợi cho đến khi xử lý xong" : "Đóng"}
                    >
                        <X className="w-5 h-5 md:w-6 md:h-6 text-gray-800" />
                    </button>
                </div>

                {/* Content - Responsive */}
                <div className="p-4 md:p-6 overflow-y-auto flex-1">
                    {!showCartView ? (
                        // View kết quả try-on
                        <div className="flex justify-center items-center min-h-[300px] md:min-h-[400px]">
                            {isCreatingLoading ? (
                                <div className="flex flex-col items-center gap-3 md:gap-4">
                                    <div className="relative">
                                        <div className="w-16 h-16 md:w-20 md:h-20 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
                                        <Loader className="w-6 h-6 md:w-8 md:h-8 text-orange-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                                    </div>
                                    <p className="text-gray-600 font-medium text-base md:text-lg">Đang tạo yêu cầu...</p>
                                    <p className="text-gray-400 text-xs md:text-sm">Vui lòng đợi trong giây lát</p>
                                </div>
                            ) : isLoading ? (
                                <div className="flex flex-col items-center gap-3 md:gap-4">
                                    <div className="relative w-20 h-20 md:w-24 md:h-24">
                                        <div
                                            className="absolute inset-0 rounded-full"
                                            style={{
                                                background: `conic-gradient(#f97316 ${progress}%, #fcd9bd ${progress}% 100%)`
                                            }}
                                        ></div>
                                        <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                                            <span className="text-lg md:text-xl font-bold text-gray-800">
                                                {progress}%
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 font-medium text-base md:text-lg">Đang xử lý ảnh...</p>
                                    <p className="text-gray-400 text-xs md:text-sm">Quá trình này có thể mất vài giây</p>
                                </div>
                            ) : errorMessage ? (
                                <div className="text-center">
                                    {resultImageUrl && (
                                        <img
                                            src={resultImageUrl}
                                            alt="Original"
                                            className="max-w-full max-h-[350px] md:max-h-[500px] rounded-xl md:rounded-2xl shadow-lg mb-3 md:mb-4"
                                        />
                                    )}
                                    <div className="flex items-center justify-center gap-2 text-red-600">
                                        <AlertCircle className="w-5 h-5 md:w-6 md:h-6" />
                                        <p className="font-semibold text-sm md:text-base">{errorMessage}</p>
                                    </div>
                                </div>
                            ) : resultImageUrl ? (
                                <div className="relative w-full flex justify-center">
                                    {!imageLoaded && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-10 h-10 md:w-12 md:h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                    <img
                                        src={resultImageUrl}
                                        alt="Try-on result"
                                        className={`max-w-full max-h-[350px] md:max-h-[500px] rounded-xl md:rounded-2xl shadow-lg transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'
                                            }`}
                                        onLoad={() => setImageLoaded(true)}
                                    />
                                </div>
                            ) : (
                                <div className="text-center text-gray-600 text-sm md:text-base">Không có kết quả</div>
                            )}
                        </div>
                    ) : (
                        // View giỏ hàng - Responsive
                        <div className="space-y-4 md:space-y-6">
                            {showBodyMeasurementForm && selectedProduct ? (
                                <BodyMeasurementForm
                                    clothingType={clothingType}
                                    onSkip={handleSkipFromMeasurementForm}
                                    onSubmit={handleSubmitMeasurement}
                                    onBackToResult={handleBackFromMeasurementForm}
                                    characteristicData={characteristicData}
                                />
                            ) : (!showBodyMeasurementForm && !selectedProduct) ? (
                                // Danh sách sản phẩm - Responsive
                                <div>
                                    <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">
                                        Sản phẩm đã thử ({tryOnProducts.length})
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                        {tryOnProducts.map((product) => (
                                            <div
                                                key={product.productColors[0].productColorId}
                                                className="border-2 border-gray-200 rounded-xl p-3 md:p-4 hover:border-orange-400 transition-all"
                                            >
                                                <div className="flex gap-3 md:gap-4">
                                                    <img
                                                        src={product.productColors[0].noBgImgUrl}
                                                        alt={product.productName}
                                                        className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg flex-shrink-0"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-semibold text-gray-800 mb-1 text-sm md:text-base line-clamp-2">
                                                            {product.productName}
                                                        </h4>
                                                        <p className="text-xs md:text-sm text-gray-600 mb-1 md:mb-2">
                                                            Màu: {product.productColors[0].color.colorName}
                                                        </p>
                                                        <p className="text-base md:text-lg font-bold text-orange-600 mb-2 md:mb-3">
                                                            {formatPrice(product.priceAtTime)} ₫
                                                        </p>
                                                        <button
                                                            onClick={() => handleProductClick(product)}
                                                            className="flex items-center justify-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors text-xs md:text-sm font-medium w-full sm:w-auto"
                                                        >
                                                            <Plus className="w-3 h-3 md:w-4 md:h-4" />
                                                            Chọn size
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                // Product detail - Responsive
                                <div>
                                    <button
                                        onClick={handleBackToResult}
                                        className="text-orange-600 hover:text-orange-700 font-medium mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-base"
                                    >
                                        ← Quay lại
                                    </button>

                                    <div className="border-2 border-gray-200 rounded-xl p-4 md:p-6">
                                        {/* Product info */}
                                        <div className="flex flex-col sm:flex-row gap-4 md:gap-6 mb-4 md:mb-6">
                                            <img
                                                src={selectedProduct?.productColors[0].noBgImgUrl}
                                                alt={selectedProduct?.productName}
                                                className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 object-cover rounded-lg mx-auto sm:mx-0"
                                            />
                                            <div className="flex-1 text-center sm:text-left">
                                                <h4 className="text-lg md:text-xl font-bold text-gray-800 mb-2">
                                                    {selectedProduct?.productName}
                                                </h4>
                                                <p className="text-sm md:text-base text-gray-600 mb-2">
                                                    Màu: {selectedProduct?.productColors[0].color.colorName}
                                                </p>
                                                <p className="text-xl md:text-2xl font-bold text-orange-600">
                                                    {formatPrice(selectedProduct?.price ?? 0)} ₫
                                                </p>
                                            </div>
                                        </div>

                                        {/* Recommendation */}
                                        {recommendedVariant && (
                                            <div className="mb-3 md:mb-4 p-3 md:p-4 border border-orange-300 bg-orange-50 rounded-xl">
                                                <p className="text-orange-700 font-semibold text-sm md:text-base">
                                                    Gợi ý size phù hợp:{" "}
                                                    <span className="font-bold text-orange-800">
                                                        {recommendedVariant.sizeDto?.sizeCode}
                                                    </span>
                                                </p>
                                                <p className="text-xs md:text-sm text-orange-600 mt-1 italic">
                                                    ⚠️ Size này chỉ mang tính chất tham khảo.
                                                </p>
                                            </div>
                                        )}
                                        {!recommendedVariant && (
                                            <div className="mb-3 md:mb-4 p-3 md:p-4 rounded-lg bg-gray-100 border border-gray-300 text-gray-600 text-xs md:text-sm">
                                                Chúng tôi chưa thể đề xuất size chính xác. Hãy chọn size phù hợp với bạn nhé!
                                            </div>
                                        )}

                                        {/* Size selection - Responsive */}
                                        <div className="mb-4 md:mb-6">
                                            <h5 className="font-semibold text-gray-800 mb-2 md:mb-3 text-sm md:text-base">Chọn size:</h5>
                                            <div className="flex flex-wrap gap-2 md:gap-3">
                                                {selectedProduct?.productColors[0].productVariants.map((productVariants: ProductVariantDTO) => (
                                                    <button
                                                        key={productVariants.sizeDto?.sizeId}
                                                        onClick={() => handleProductVariantSelect(productVariants)}
                                                        disabled={productVariants.quantity === 0}
                                                        className={`px-3 md:px-4 py-2 md:py-3 rounded-lg font-medium transition-all min-w-[64px] md:min-w-[80px] text-sm md:text-base ${selectedProductVariant?.sizeDto?.sizeId === productVariants.sizeDto?.sizeId
                                                            ? 'bg-orange-500 text-white border-2 border-orange-500'
                                                            : productVariants.quantity === 0
                                                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                                : 'bg-white border-2 border-gray-300 hover:border-orange-400 text-gray-800'
                                                            }`}
                                                    >
                                                        <div>{productVariants.sizeDto?.sizeCode}</div>
                                                        {productVariants.quantity === 0 && (
                                                            <div className="text-[10px] md:text-xs mt-1">Hết hàng</div>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Quantity - Responsive */}
                                        {selectedProductVariant && (
                                            <div className="mb-4 md:mb-6">
                                                <h5 className="font-semibold text-gray-800 mb-2 md:mb-3 text-sm md:text-base">Số lượng:</h5>
                                                <div className="flex items-center gap-3 md:gap-4">
                                                    <button
                                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                        className="w-9 h-9 md:w-10 md:h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <span className="text-lg md:text-xl font-semibold w-10 md:w-12 text-center">
                                                        {quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => setQuantity(Math.min(selectedProductVariant.quantity, quantity + 1))}
                                                        className="w-9 h-9 md:w-10 md:h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                    <span className="text-xs md:text-sm text-gray-600">
                                                        (Còn {selectedProductVariant.quantity} sản phẩm)
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Add to cart button */}
                                        <button
                                            onClick={handleAddToCart}
                                            disabled={!selectedProductVariant}
                                            className={`w-full py-2.5 md:py-3 rounded-lg md:rounded-xl font-semibold text-base md:text-lg transition-all ${selectedProductVariant
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

                {/* Footer Actions - Responsive */}
                <div className="bg-gray-50 px-4 md:px-6 py-3 md:py-4 flex flex-col sm:flex-row flex-wrap gap-2 md:gap-3 justify-center border-t border-gray-200 flex-shrink-0">
                    {!showCartView && canAddToCart && (
                        <button
                            onClick={handleAddToCartClick}
                            className="flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500 text-white font-semibold rounded-lg md:rounded-xl transition-all shadow-md hover:shadow-lg text-sm md:text-base w-full sm:w-auto"
                        >
                            <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
                            Thêm vào giỏ hàng
                        </button>
                    )}

                    {!showCartView && resultImageUrl && !isLoading && !isCreatingLoading && !errorMessage && (
                        <button
                            onClick={handleDownload}
                            className="flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-amber-200 to-orange-200 hover:from-amber-300 hover:to-orange-300 text-gray-800 font-semibold rounded-lg md:rounded-xl transition-all shadow-md hover:shadow-lg text-sm md:text-base w-full sm:w-auto"
                        >
                            <Download className="w-4 h-4 md:w-5 md:h-5" />
                            Tải xuống
                        </button>
                    )}

                    {!showCartView && onRetry && (
                        <button
                            onClick={onRetry}
                            disabled={isLoading || isCreatingLoading}
                            className="flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-white hover:bg-gray-100 text-gray-800 font-semibold rounded-lg md:rounded-xl transition-all border-2 border-gray-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base w-full sm:w-auto"
                        >
                            <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
                            Thử lại
                        </button>
                    )}

                    {showCartView && !selectedProduct && (
                        <button
                            onClick={handleBackToResult}
                            className="flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-white hover:bg-gray-100 text-gray-800 font-semibold rounded-lg md:rounded-xl transition-all border-2 border-gray-300 shadow-md hover:shadow-lg text-sm md:text-base w-full sm:w-auto"
                        >
                            ← Quay lại kết quả
                        </button>
                    )}

                    <button
                        disabled={!canClose}
                        onClick={handleClose}
                        className={`flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 
                                    font-semibold rounded-lg md:rounded-xl transition-all shadow-md text-sm md:text-base w-full sm:w-auto
                                    ${!canClose
                                ? "bg-gray-300 text-gray-500 opacity-50 cursor-not-allowed pointer-events-none"
                                : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                            }`}
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
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
                .animate-scaleIn { animation: scaleIn 0.3s ease-out; }
            `}</style>
        </div>
    );
}