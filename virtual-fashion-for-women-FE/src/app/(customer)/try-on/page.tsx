'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Upload } from 'lucide-react';
import { Category } from '@/models/RequestCreateProduct';
import { api } from '@/api/instance';
import SelectItemTryOn from '@/components/TryOn/SelectItemTryOn';

export default function VirtualTryOnPage() {
    const [category, setCategory] = useState<Category[]>([]);
    const [selectedTop, setSelectedTop] = useState<any>(null);
    const [selectedBottom, setSelectedBottom] = useState<any>(null);
    const [userImage, setUserImage] = useState<File | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState<'top' | 'bottom' | null>(null);
    const [isDress, setIsDress] = useState(false);

    const handleFileChange = (
        event: React.ChangeEvent<HTMLInputElement>,
        setter: React.Dispatch<React.SetStateAction<File | null>>
    ) => {
        const file = event.target.files?.[0];
        if (file) setter(file);
    };

    useEffect(() => {
        const fetchCategories = async () => {
            const response = await api.get('/category');
            if (response.status === 200) {
                console.log('Fetched categories:', response.data);
                setCategory(response.data);
            }
        };
        fetchCategories();
        const productId = sessionStorage.getItem("product_id");
        if (productId) {
            console.log("Product ID nhận được:", productId);
        }
    }, []);

    const topCategories = category.filter(
        (c) => c.bodyPart === 'Upper body' || c.bodyPart === 'Full body'
    );
    const bottomCategories = category.filter(
        (c) => c.bodyPart === 'Lower body'
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#FAE3B6] via-[#FAE3B6] via-60% to-white flex items-center justify-center p-4 font-poppins">
            <div className="w-full max-w-6xl">
                {/* Title */}
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 text-center mb-10 tracking-tight">
                    Thử đồ trực tuyến
                </h1>

                <div className="flex flex-col lg:flex-row bg-gray-700 rounded-3xl overflow-hidden shadow-2xl">
                    {/* Left panel */}
                    <div className="lg:w-[60%] p-8 lg:p-12 flex flex-col justify-center">
                        <div className="text-4xl sm:text-4xl font-semibold text-white text-center mb-10">
                            Quần áo được chọn
                        </div>
                        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-8`}>
                            {/* Khung chọn áo */}
                            <div
                                className={`bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border-2 border-orange-400/60 shadow-sm hover:shadow-lg transition-all
                                ${isDress ? 'col-span-2 h-[300px]' : 'h-[250px]'}
                                `}
                                onClick={() => {
                                    setShowModal(true);
                                    setModalType('top');
                                }}
                            >
                                <label htmlFor="top-upload" className="cursor-pointer block h-full">
                                    <div className="flex flex-col h-full">
                                        <div className={`flex-1 flex items-center justify-center bg-gray-100 p-8 ${isDress ? 'h-[320px]' : 'h-[220px]'}`}>
                                            {selectedTop ? (
                                                <img
                                                    src={selectedTop.noBgImgUrl}
                                                    alt={selectedTop.productName}
                                                    className={`${isDress ? 'max-h-80' : 'max-h-44'} object-contain rounded-lg`}
                                                />
                                            ) : (
                                                <div className="bg-orange-400 rounded-full p-4 shadow-lg">
                                                    <Plus className="w-10 h-10 text-white" strokeWidth={3} />
                                                </div>
                                            )}
                                        </div>

                                        <div className="bg-white text-center py-4 font-medium text-gray-800 text-base border-t border-gray-200 h-[60px]">
                                            {selectedTop ? selectedTop.productName : 'Chọn một loại áo để phối'}
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
                                            <div className="flex-1 flex items-center justify-center bg-gray-100 p-8">
                                                {selectedBottom ? (
                                                    <img
                                                        src={selectedBottom.noBgImgUrl}
                                                        alt={selectedBottom.productName}
                                                        className="max-h-44 object-contain rounded-lg"
                                                    />
                                                ) : (
                                                    <div className="bg-orange-400 rounded-full p-4 shadow-lg">
                                                        <Plus className="w-10 h-10 text-white" strokeWidth={3} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="bg-white text-center py-4 font-medium text-gray-800 text-base border-t border-gray-200 h-[60px]">
                                                {selectedBottom
                                                    ? selectedBottom.productName
                                                    : 'Chọn một loại quần hoặc váy để phối'}
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            )}
                        </div>

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
                            />
                        </div>

                        <button
                            className="mt-6 w-full bg-gradient-to-r from-amber-200 to-orange-200 hover:from-amber-300 hover:to-orange-300 text-gray-800 font-semibold py-3 rounded-xl transition-all hover:shadow-lg text-base"
                        >
                            Mặc thử ngay
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
                            .filter((c) => c.bodyPart === 'Full body')
                            .map((c) => c.categoryId);

                        console.log('Item categoryId:', item.categoryId);
                        console.log('Category with full body:', fullBodyCategoryIds);

                        const isDressItem = fullBodyCategoryIds.includes(item.categoryId);
                        if (isDressItem) {
                            setSelectedBottom(null);
                        }
                        setIsDress(isDressItem);
                        console.log('Selected item:', item);
                        if (modalType === 'top') {
                            setSelectedTop(item);
                        } else {
                            setSelectedBottom(item);
                        }
                        setShowModal(false);
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
        </div>
    );
};


