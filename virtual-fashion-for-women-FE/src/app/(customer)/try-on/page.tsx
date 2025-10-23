'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Plus, Upload } from 'lucide-react';
import { Category } from '@/models/RequestCreateProduct';
import { api } from '@/api/instance';
import SelectItemTryOn from '@/components/TryOn/SelectItemTryOn';
import { mapTryOnCode } from '@/helpers/errorCodeMapper';
import { messageToast } from '@/helpers/toastHelper';
import TryOnResultModal from '@/components/TryOn/TryOnModelResult';
import { TryOnDTO } from '@/models/TryOnDTO';
import ColorRecommendPanel from '@/components/TryOn/ColorRecommendation';
import ColorRecommendation from '@/components/TryOn/ColorRecommendation';
import { set } from 'lodash';

export default function VirtualTryOnPage() {
    const [category, setCategory] = useState<Category[]>([]);
    const [selectedTop, setSelectedTop] = useState<any>(null);
    const [selectedBottom, setSelectedBottom] = useState<any>(null);
    const [userImage, setUserImage] = useState<File | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState<'top' | 'bottom' | null>(null);
    const [isDress, setIsDress] = useState(false);
    const [imageValidation, setImageValidation] = useState<{
        isChecking: boolean;
        isValid: boolean | null;
        errorMessage: string;
        supportedTypes: string[];
    }>({
        isChecking: false,
        isValid: null,
        errorMessage: '',
        supportedTypes: []
    });
    const [showResultModal, setShowResultModal] = useState(false);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [tryOnData, setTryOnData] = useState<TryOnDTO | null>(null);
    const [progress, setProgress] = useState(0);
    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
    const [isCreatingTask, setIsCreatingTask] = useState(false);
    const [showRecommendation, setShowRecommendation] = useState(false);

    const handleFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>,
        setter: React.Dispatch<React.SetStateAction<File | null>>
    ) => {
        const file = event.target.files?.[0];
        if (file) {
            setter(file);
            console.log('Selected user image file:', file);

            resetOutputImage();
            await checkImageValidity(file);
        }
    };

    const checkImageValidity = async (file: File) => {
        setImageValidation({
            isChecking: true,
            isValid: null,
            errorMessage: '',
            supportedTypes: []
        });

        try {
            const formData = new FormData();
            formData.append('imageModelFile', file);

            const response = await api.post('check-image', formData);

            if (response.status === 200) {
                const result = response.data;
                console.log('Image validation result:', result);
                if (result.error_code) {
                    const errorMessage = mapTryOnCode(result.error_code) + " Vui lòng thử lại với ảnh khác.";
                    setImageValidation({
                        isChecking: false,
                        isValid: false,
                        errorMessage: errorMessage,
                        supportedTypes: []
                    });
                } else {
                    setImageValidation({
                        isChecking: false,
                        isValid: true,
                        errorMessage: '',
                        supportedTypes: result.goodClothesTypes || []
                    });
                }
            }
        } catch (error) {
            console.error('Error checking image validity:', error);
            setImageValidation({
                isChecking: false,
                isValid: false,
                errorMessage: 'Không thể kiểm tra ảnh. Vui lòng thử lại.',
                supportedTypes: []
            });
        }
    };


    const handleTryOn = async () => {
        if (!userImage) {
            alert('Vui lòng tải lên ảnh của bạn!');
            return;
        }

        if (!imageValidation.isValid) {
            alert('Ảnh của bạn không hợp lệ. Vui lòng tải lên ảnh khác.');
            return;
        }

        if (!selectedTop) {
            alert('Vui lòng chọn áo!');
            return;
        }

        // Mở modal và bắt đầu loading
        setShowResultModal(true);
        setProgress(0);
        resetOutputImage();


        setIsCreatingTask(true);

        try {
            console.log("UserImage:", userImage);
            // Gọi API try-on của bạn ở đây
            const formData = new FormData();
            formData.append('UserModelImage', userImage);
            if (selectedTop) {
                console.log("Selected top color :", selectedTop.productColors[0].productColorId);
                formData.append('topProductColorId', selectedTop.productColors[0].productColorId);
            }
            if (selectedBottom) {
                console.log("Selected bottom color :", selectedBottom.productColors[0].productColorId);
                formData.append('bottomProductColorId', selectedBottom.productColors[0].productColorId);
            }

            console.log(formData.get('userImage'));
            const response = await api.post('try-on', formData);

            if (response.status === 200) {
                const data = response.data;
                setTryOnData(data);
                setIsCreatingTask(false);
                const taskId = data.outputTaskId;
                if (data.outputImageUrl) {
                    setIsProcessing(false);
                    setErrorMessage(undefined);
                    setResultImage(data.outputImageUrl);
                } else if (taskId && !data.outputImageUrl) {
                    setIsProcessing(true);
                    pollTaskStatus(taskId, data.tryOnSlotId);

                } else {
                    // Nếu không có taskId thì coi như lỗi
                    setIsProcessing(false);
                    messageToast.error('Không tìm thấy Task ID');
                }
            }
        } catch (error: any) {
            console.error('Error during try-on:', error);
            setIsProcessing(false);
            messageToast.error(error.response?.data?.message);
        }
    };

    const pollTaskStatus = (taskId: string, tryOnId: number) => {
        const interval = setInterval(async () => {
            let isPolling = true; // Flag để kiểm soát
            try {
                const res = await api.get(`/fit-room/${taskId}`);
                if (res.status === 200) {
                    const responseData = res.data;
                    console.log('Task status:', responseData);
                    setProgress(responseData.progress ?? 0);
                    if (responseData.status === 'COMPLETED') {
                        isPolling = false;
                        clearInterval(interval);
                        setIsProcessing(false);
                        setTryOnData({
                            ...tryOnData!,
                            outputImageUrl: responseData.downloadSignedUrl
                        });
                        updateOutputImage(tryOnId, responseData.downloadSignedUrl);
                        setErrorMessage(undefined);

                        setResultImage(responseData.downloadSignedUrl); // đường dẫn ảnh thành phẩm
                    } else if (responseData.status === 'FAILED') {
                        isPolling = false;
                        clearInterval(interval);
                        setIsProcessing(false);
                        setResultImage(tryOnData?.uploadImageUrl || null);
                        setErrorMessage(responseData.error ?? 'Đã xảy ra lỗi khi xử lý ảnh');
                    }
                    // Nếu là PROCESSING thì không làm gì -> tiếp tục chờ
                } else {
                    console.warn('Unexpected response', res);
                }
            } catch (error) {
                console.error('Error fetching task status:', error);
                // Nếu gọi API lỗi nhiều lần có thể clearInterval sau N lần tuỳ ý
            }
        }, 5000); // gọi mỗi 5s
    };

    const updateOutputImage = async (tryOnSlotId: number, outputImageUrl: string) => {
        try {
            console.log("update image: ", outputImageUrl)
            const payload = {
                tryOnSlotId: tryOnSlotId,
                outputImageUrl: outputImageUrl
            }
            await api.put(`/try-on`, payload);
        } catch (error: any) {
            console.error('Error updating output image:', error);
            messageToast.error(error.response?.data?.message);
        }
    }

    const resetOutputImage = () => {
        setResultImage(null);
        setErrorMessage(undefined);
        setTryOnData(null);
    };

    const fetchProductColor = async (productColorId: string, categories: Category[]) => {
        try {
            const response = await api.get('product-color/' + productColorId);
            if (response.status === 200) {
                const product = response.data;
                console.log("Preselected product for try-on:", product);
                const categoryProductColor = categories.find((cat: Category) => cat.categoryId === product.categoryId);
                console.log("Category of preselected product:", categoryProductColor);
                if (categoryProductColor?.bodyPart === 'Toàn thân' || categoryProductColor?.bodyPart === 'Thân trên') {
                    setSelectedTop(() => ({
                        ...product,
                        productColorName: product.productName + " - " + product.productColors[0].color.colorName
                    }));
                    if (categoryProductColor?.bodyPart === 'Toàn thân') {
                        setIsDress(true);
                        setSelectedBottom(null);
                    }
                } else {
                    setSelectedBottom(() => ({
                        ...product,
                        productColorName: product.productName + " - " + product.productColors[0].color.colorName
                    }));
                }
            }
        } catch (error: any) {
            messageToast.error(error.response?.data?.message);
        }
    }




    useEffect(() => {
        const fetchCategories = async () => {
          const categoryRes = await api.get('/category');
          if (categoryRes.status === 200) {
            setCategory(categoryRes.data);
      
            // Đọc danh sách productColorID (mảng chuỗi)
            const storedItems = sessionStorage.getItem("productColor");
            if (storedItems) {
              try {
                const parsedItems = JSON.parse(storedItems);
                const productColorIds = Array.isArray(parsedItems) ? parsedItems : [parsedItems];
      
                await Promise.all(
                  productColorIds.map(id => fetchProductColor(id, categoryRes.data))
                );
      
              } catch (e) {
                console.error("❌ Lỗi parse sessionStorage productColor:", e);
              } finally {
              }
            }
          }
        };
      
        fetchCategories();
      }, []);
      

    const topCategories = category.filter(
        (c) => c.bodyPart === 'Thân trên' || c.bodyPart === 'Toàn thân'
    );
    const bottomCategories = category.filter(
        (c) => c.bodyPart === 'Thân dưới'
    );
    const canTryOn = userImage && imageValidation.isValid === true && selectedTop;
    console.log('Selected Top:', selectedTop);
    console.log('Selected Bottom:', selectedBottom);

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#FAE3B6] via-[#FAE3B6] via-60% to-white flex items-center justify-center p-4 font-poppins">
            <div className="w-full max-w-6xl">
                {/* Title */}
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 text-center mb-10 tracking-tight">
                    Thử đồ trực tuyến
                </h1>

                <div className="flex flex-col lg:flex-row bg-gray-700 rounded-3xl overflow-hidden shadow-2xl">
                    {/* Left panel */}
                    <div className="lg:w-[60%] p-4 lg:p-10 flex flex-col justify-center relative">
                        <div className="text-4xl sm:text-4xl font-semibold text-white text-center mb-10">
                            Quần áo được chọn
                        </div>

                        {selectedBottom &&
                            !selectedTop &&
                            bottomCategories.some(
                                (cat) =>
                                    cat.categoryId === selectedBottom.categoryId &&
                                    cat.categoryName.toLowerCase() === 'váy'
                            ) && (
                                <div className="mt-4 mb-6 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded-lg text-sm leading-relaxed">
                                    ⚠️ <strong>Lưu ý:</strong> Nếu bạn chỉ chọn váy nhưng ảnh bạn đang mặc đầm sẵn, kết quả có thể không chính xác.
                                    Hãy đổi ảnh sang trang phục khác hoặc thêm áo để thử đồ được chính xác hơn.
                                </div>
                            )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            {/* Khung chọn áo */}
                            <div
                                className={`bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border-2 border-orange-400/60 shadow-sm hover:shadow-lg transition-all
            ${isDress ? 'col-span-2 h-[300px]' : 'h-[250px]'}`}
                                onClick={() => {
                                    setShowModal(true);
                                    setModalType('top');
                                }}
                            >
                                <label htmlFor="top-upload" className="cursor-pointer block h-full">
                                    <div className="flex flex-col h-full">
                                        <div className={`flex items-center justify-center bg-gray-100 p-2 ${isDress ? 'h-[240px]' : 'h-[190px]'}`}>
                                            {selectedTop ? (
                                                <img
                                                    src={selectedTop?.productColors[0].noBgImgUrl}
                                                    alt={selectedTop?.productColorName}
                                                    className={`${isDress ? 'max-h-[230px]' : 'max-h-[180px]'} w-auto object-contain rounded-lg`}
                                                />
                                            ) : (
                                                <div className="bg-orange-400 rounded-full p-4 shadow-lg">
                                                    <Plus className="w-10 h-10 text-white" strokeWidth={3} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="bg-white text-center py-4 font-medium text-gray-800 text-base border-t border-gray-200 h-[60px] flex items-center justify-center">
                                            {selectedTop ? selectedTop?.productColorName : 'Chọn một loại áo để phối'}
                                        </div>
                                    </div>
                                </label>
                            </div>

                            {/* Khung chọn quần/váy */}
                            {!isDress && (
                                <div
                                    className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border-2 border-orange-400/60 shadow-sm hover:shadow-lg transition-all"
                                    onClick={() => {
                                        setShowModal(true);
                                        setModalType('bottom');
                                    }}
                                >
                                    <label htmlFor="bottom-upload" className="cursor-pointer block h-full">
                                        <div className="flex flex-col h-full">
                                            <div className="flex items-center justify-center bg-gray-100 p-2 h-[190px]">
                                                {selectedBottom ? (
                                                    <img
                                                        src={selectedBottom?.productColors[0].noBgImgUrl}
                                                        alt={selectedBottom?.productColorName}
                                                        className="max-h-[180px] w-auto object-contain rounded-lg"
                                                    />
                                                ) : (
                                                    <div className="bg-orange-400 rounded-full p-4 shadow-lg">
                                                        <Plus className="w-10 h-10 text-white" strokeWidth={3} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="bg-white text-center py-4 font-medium text-gray-800 text-base border-t border-gray-200 h-[60px] flex items-center justify-center">
                                                {selectedBottom
                                                    ? selectedBottom?.productColorName
                                                    : 'Chọn một loại quần hoặc váy để phối'}
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            )}
                        </div>
                        {((selectedTop && !selectedBottom) || (!selectedTop && selectedBottom)) && !isDress && (
                            <div className="flex justify-end mt-5">
                                <button
                                    onClick={() => setShowRecommendation(true)}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-base 
                                                bg-gradient-to-r from-orange-400 to-yellow-400 
                                                shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
                                >
                                    🌟 <span>Gợi ý phối đồ</span>
                                </button>
                            </div>
                        )}


                    </div>



                    {/* Right panel */}
                    <div className="lg:w-[40%] bg-white p-8 lg:p-10 flex flex-col justify-between rounded-t-3xl lg:rounded-t-none lg:rounded-r-3xl">
                        <div>
                            <div
                                className="text-3xl font-bold text-center mb-1 
                                            bg-gradient-to-b from-[#E3A03D] to-[#B67421] 
                                            bg-clip-text text-transparent whitespace-nowrap"
                            >
                                Tải lên hình ảnh của bạn
                            </div>

                            <label
                                htmlFor="user-image"
                                className="cursor-pointer border-2 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[230px] hover:border-orange-400 transition-all"
                            >
                                {userImage ? (
                                    <div className="flex items-center justify-center max-h-[350px] w-full overflow-hidden">
                                        <img
                                            src={URL.createObjectURL(userImage)}
                                            alt="User"
                                            className="max-h-[350px] w-auto object-contain rounded-2xl"
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                                            <Upload className="w-7 h-7 text-blue-500" />
                                        </div>
                                        <p className="text-gray-800 font-semibold text-center text-sm">
                                            Chọn một tệp ảnh của bạn
                                        </p>
                                        <p className="text-gray-400 text-xs text-center mt-1">
                                            Hỗ trợ jpg, png, webp
                                        </p>
                                    </>
                                )}
                            </label>
                            <input
                                id="user-image"
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, setUserImage)}
                                className="hidden"
                            />'
                            {imageValidation.isChecking && (
                                <div className="mt-3 flex items-center justify-center text-blue-600 text-sm">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                                    Đang kiểm tra ảnh...
                                </div>
                            )}

                            {/* Error message */}
                            {imageValidation.isValid === false && (
                                <div className="mt-3 flex items-start p-3 bg-red-100 border border-red-300 rounded-lg">
                                    <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                                    <p className="text-red-700 text-sm font-medium">
                                        {imageValidation.errorMessage}
                                    </p>
                                </div>
                            )}

                            {/* Success message */}
                            {imageValidation.isValid === true && (
                                <div className="mt-3 flex items-start p-3 bg-green-100 border border-green-300 rounded-lg">
                                    <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-green-700 text-sm font-medium">
                                            Ảnh hợp lệ! Bạn có thể tiếp tục thử đồ.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleTryOn}
                            disabled={!canTryOn}
                            className={`mt-6 w-full font-semibold py-3 rounded-xl transition-all text-base
                                ${canTryOn
                                    ? 'bg-gradient-to-r from-amber-200 to-orange-200 hover:from-amber-300 hover:to-orange-300 text-gray-800 hover:shadow-lg cursor-pointer'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            {imageValidation.isChecking ? 'Đang kiểm tra...' : 'Mặc thử ngay'}
                        </button>
                    </div>
                </div>
            </div>
            {showModal && (
                <SelectItemTryOn
                    category={modalType === 'top' ? topCategories : bottomCategories}
                    onClose={() => setShowModal(false)}
                    onSelect={(item) => {
                        const fullBodyCategoryIds = category
                            .filter((c) => c.bodyPart === 'Toàn thân')
                            .map((c) => c.categoryId);


                        const isDressItem = fullBodyCategoryIds.includes(item.categoryId);
                        if (isDressItem) {
                            setSelectedBottom(null);
                        }
                        setIsDress(isDressItem);
                        fetchProductColor(item.productColorId, category);
                        setShowModal(false);
                        sessionStorage.removeItem("productColor");
                    }}
                    onReset={() => {
                        if (modalType === 'top') {
                            setIsDress(false);
                            setSelectedTop(null);
                        } else {
                            setSelectedBottom(null);
                        }
                    }}
                />
            )}
            {showRecommendation && (
                <ColorRecommendation
                    category={
                        selectedBottom ? topCategories.filter(c => c.bodyPart === 'Thân trên') : bottomCategories
                    }
                    selectedHexcode={selectedTop ? selectedTop.productColors[0].color.hexCode : selectedBottom.productColors[0].color.hexCode}
                    onClose={() => setShowRecommendation(false)}
                    onSelect={(item) => {
                        fetchProductColor(item.productColorId, category);
                        setShowRecommendation(false);
                    }}
                />
            )}
            <TryOnResultModal
                isOpen={showResultModal}
                onClose={() => setShowResultModal(false)}
                resultImageUrl={resultImage || undefined}
                isCreatingLoading={isCreatingTask}
                isLoading={isProcessing}
                progress={progress}
                errorMessage={errorMessage}
                onRetry={handleTryOn}
                tryOnProducts={[
                    ...(selectedTop ? [selectedTop] : []),
                    ...(selectedBottom ? [selectedBottom] : []),
                ]}
                onAddToCart={async (productVariantId: string, quantity: number) => {
                    // Xử lý thêm vào giỏ hàng
                    try {
                        const payload = {
                            productVariantId: productVariantId,
                            quantity: quantity,
                            tryOnSlotId: tryOnData?.tryOnSlotId || null
                        };
                        const response = await api.post('/cartItem', payload);
                        if (response.status === 201) {
                            messageToast.success('Thêm vào giỏ hàng thành công');
                            window.dispatchEvent(new Event("cart-updated"));
                        }
                    } catch (error: any) {
                        console.error('Error adding to cart trong try on:', error.response?.data?.message);
                        messageToast.error(error.response?.data?.message);
                    }
                }}
            />

        </div>
    );
};


