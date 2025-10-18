'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronRight, ShoppingBag, MapPin } from 'lucide-react';
import { CheckoutDTO } from '@/models/CheckoutDTO';
import { RequestCheckout } from '@/models/RequestCheckout';
import { api } from '@/api/instance';
import CartItems from '@/components/CartItem/CartItem';
import MomoPng from '../../../assets/payment/momo.png';
import VnpayPng from '../../../assets/payment/vnpay.png';
import { useRouter } from 'next/navigation';
import { messageToast } from '@/helpers/toastHelper';

export default function CheckoutForm() {
    const router = useRouter();
    const isSelectingRef = useRef(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [checkoutDTO, setCheckoutDTO] = useState<CheckoutDTO>({
        items: [],
        totalProductPrice: 0,
        serviceFee: 0,
        insuranceFee: 0,
        totalPrice: 0
    });
    const [provinces, setProvince] = useState<Record<string, string>>({});
    const [districts, setDistrict] = useState<Record<string, string>>({});
    const [wards, setWard] = useState<Record<string, string>>({});
    const [addressInformation, setAddressInformation] = useState({
        provinceName: '',
        districtName: '',
        wardName: ''
    });
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        address: '',
        note: ''
    });
    const [showAddressDropdown, setShowAddressDropdown] = useState(false);
    const [currentAddressTab, setCurrentAddressTab] = useState('city');
    const [addressSuggestions, setAddressSuggestions] = useState<{ placeId: string, description: string }[]>([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState('Momo');
    const isFormValid = useMemo(() => {
        return (
            formData.fullName.trim() !== '' &&
            formData.phone.trim() !== '' &&
            formData.address.trim() !== '' &&
            addressInformation.provinceName.trim() !== '' &&
            addressInformation.districtName.trim() !== '' &&
            addressInformation.wardName.trim() !== ''
        );
    }, [formData, addressInformation]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handlePayment = async () => {
        if (isProcessing) return;
        setIsProcessing(true);

        if (!isFormValid) {
            messageToast.error("Vui lòng nhập đầy đủ thông tin giao hàng!");
            setIsProcessing(false);
            return;
        }

        const payload = {
            cartIds: checkoutDTO.items.map(item => item.cartId),
            recieverName: formData.fullName,
            recieverPhone: formData.phone,
            fullAddress: formData.address,
            paymentMethod: selectedPayment,
            provinceName: addressInformation.provinceName,
            districtName: addressInformation.districtName,
            wardName: addressInformation.wardName,
            note: formData.note
        };

        try {
            const response = await api.post('/payment', payload);
            if (response.status === 200) {
                const paymentUrl = response.data;
                router.push(paymentUrl);
            } else {
                messageToast.error("Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại sau.");
                setIsProcessing(false);
            }
        } catch (error: any) {
            console.error("Payment error:", error.response.data.message);
            messageToast.error(error.response.data.message);
            setIsProcessing(false);
        }
    };

    const handleCitySelect = async (provinceId: string, provinceName: string) => {
        if (addressInformation.provinceName !== provinceName) {
            setAddressInformation({
                provinceName,
                districtName: '',
                wardName: ''
            });
            clearAddressSelection();
            await fetchDistrictData(provinceId).then(() => {
                setCurrentAddressTab('district');
            });
        }
    };

    const handleDistrictSelect = async (districtId: string, districtName: string) => {
        if (addressInformation.districtName !== districtName) {
            setAddressInformation({
                ...addressInformation,
                districtName,
                wardName: ''
            });
            clearAddressSelection();
            await fetchWardData(districtId).then(() => {
                setCurrentAddressTab('ward');
            });
        }
    };

    const handleWardSelect = (wardName: string) => {
        if (addressInformation.wardName !== wardName) {
            setAddressInformation({
                ...addressInformation,
                wardName
            });
            clearAddressSelection();
        }
        setShowAddressDropdown(false);
        setCurrentAddressTab('city');
    };

    const getAddressDisplayValue = () => {
        const parts = [];
        if (addressInformation.provinceName) parts.push(addressInformation.provinceName);
        if (addressInformation.districtName) parts.push(addressInformation.districtName);
        if (addressInformation.wardName) parts.push(addressInformation.wardName);
        return parts.length > 0 ? parts.join(', ') : 'Tỉnh/TP, Quận/Huyện, Phường/Xã';
    };

    const handleAddressTabClick = (tab: string) => setCurrentAddressTab(tab);
    const clearAddressSelection = () => setFormData({ ...formData, address: '' });

    const fetchCheckoutData = async (payload: RequestCheckout) => {
        try {
            const response = await api.post('/checkout', payload);
            if (response.status === 200) setCheckoutDTO(response.data);
        } catch (error: any) {
            console.error("Fetch checkout data error:", error);
            messageToast.error(error.response?.data);
            router.push('/cart');
        }
    };

    const fetchProvinceData = async () => {
        try {
            const response = await api.get('/location/provinces');
            if (response.status === 200) {
                setProvince(response.data);
            }
        } catch (error) {
            console.error("Fetch province data error:", error);
        }
    };

    const fetchDistrictData = async (provinceId: string): Promise<Record<string, string>> => {
        try {
            const response = await api.get(`/location/districts/${provinceId}`);
            if (response.status === 200) {
                setDistrict(response.data);
                return response.data;
            }
        } catch {
            return {};
        }
        return {};
    };

    const fetchWardData = async (districtId: string): Promise<Record<string, string>> => {
        try {
            const response = await api.get(`/location/wards/${districtId}`);
            if (response.status === 200) {
                setWard(response.data);
                return response.data;
            }
        } catch {
            return {};
        }
        return {};
    };

    const fetchAddressSuggestions = async (query: string) => {
        if (!query) return setAddressSuggestions([]);
        try {
            setIsLoadingSuggestions(true);
            const response = await api.get(`/location/googleMap/${encodeURIComponent(query)}`);
            if (response.status === 200) {
                const data: Record<string, string> = response.data;
                const arr = Object.entries(data).map(
                    ([placeId, description]) => ({ placeId, description })
                );
                setAddressSuggestions(arr);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoadingSuggestions(false);
        }
    };

    const fetchAddressDetails = async (placeId: string, placeName: string) => {
        try {
            const parts = placeName.split(',').map(part => part.trim());

            const lastThree = parts.slice(-4, -1);

            const data = {
                provinceName: lastThree[2],
                districtName: lastThree[1],
                wardName: lastThree[0]
            }
            console.log(data);
            const matchedProvinceEntry = Object.entries(provinces).find(
                ([, name]) => name.toLowerCase().includes(data.provinceName.toLowerCase())
            );
            if (matchedProvinceEntry) {
                const [provinceId, provinceName] = matchedProvinceEntry;
                const districtsData = await fetchDistrictData(provinceId);
                if (data.districtName === "Thủ Đức") data.districtName = "Thành phố Thủ Đức";
                const matchedDistrictEntry = Object.entries(districtsData).find(
                    ([, name]) => name.toLowerCase().includes(data.districtName.toLowerCase())
                );
                if (matchedDistrictEntry) {
                    const [districtId, districtName] = matchedDistrictEntry;
                    const wardsData = await fetchWardData(districtId);
                    const matchedWardEntry = Object.entries(wardsData).find(
                        ([, name]) => name.toLowerCase().includes(data.wardName.toLowerCase())
                    );
                    if (matchedWardEntry) {
                        const [, wardName] = matchedWardEntry;
                        setAddressInformation({ provinceName, districtName, wardName });
                    }
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (isSelectingRef.current) {
            isSelectingRef.current = false;
            return;
        }
        const handler = setTimeout(() => {
            if (formData.address.length > 1) fetchAddressSuggestions(formData.address);
            else setAddressSuggestions([]);
        }, 500);
        return () => clearTimeout(handler);
    }, [formData.address]);

    useEffect(() => { fetchProvinceData(); }, []);
    useEffect(() => {
        const idsStr = sessionStorage.getItem("checkoutCartIds");
        if (idsStr) {
            const ids: number[] = JSON.parse(idsStr);
            const payload = {
                cartIds: ids,
                provinceName: addressInformation.provinceName,
                districtName: addressInformation.districtName,
                wardName: addressInformation.wardName
            };
            fetchCheckoutData(payload);
        }
    }, [addressInformation]);

    // ================= UI ==================
    return (
        <div className="max-w-7xl mx-auto p-6 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Shipping Info */}
                    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                        <h2 className="text-xl font-bold mb-5 text-gray-800 border-b pb-2">Thông tin giao hàng</h2>
                        <div className="space-y-4">
                            <input type="text" name="fullName" placeholder="Họ và tên" value={formData.fullName}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all" />
                            <input type="tel" name="phone" placeholder="Số điện thoại" value={formData.phone}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all" />

                            {/* Address input */}
                            <div className="relative">
                                <input type="text" name="address" placeholder="Địa chỉ"
                                    value={formData.address} onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all" />
                                {isLoadingSuggestions && (
                                    <div className="absolute right-3 top-3 text-gray-400 text-sm animate-pulse">...</div>
                                )}
                                {addressSuggestions.length > 0 && (
                                    <div className="absolute z-20 w-full bg-white border rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto">
                                        {addressSuggestions.map((s, idx) => (
                                            <div key={s.placeId}
                                                onClick={() => {
                                                    isSelectingRef.current = true;
                                                    setFormData({ ...formData, address: s.description });
                                                    fetchAddressDetails(s.placeId, s.description);
                                                    setAddressSuggestions([]);
                                                }}
                                                className="flex items-center gap-2 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-0 border-gray-100">
                                                <MapPin className="w-4 h-4 text-red-500" />
                                                <span>{s.description}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Dropdown */}
                            <div className="relative">
                                <div
                                    onClick={() => setShowAddressDropdown(!showAddressDropdown)}
                                    className="w-full p-3 border border-gray-300 rounded-lg cursor-pointer bg-white flex justify-between items-center hover:border-gray-400 transition-all"
                                >
                                    <span className={addressInformation.provinceName ? 'text-gray-800' : 'text-gray-500'}>
                                        {getAddressDisplayValue()}
                                    </span>
                                    <ChevronRight
                                        className={`w-5 h-5 text-gray-500 transition-transform ${showAddressDropdown ? 'rotate-90' : ''
                                            }`}
                                    />
                                </div>

                                {showAddressDropdown && (
                                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                                        {/* Tabs */}
                                        <div className="flex border-b">
                                            {['city', 'district', 'ward'].map(tab => {
                                                const isDisabled =
                                                    (tab === 'district' && !addressInformation.provinceName) ||
                                                    (tab === 'ward' && !addressInformation.districtName);

                                                return (
                                                    <button
                                                        key={tab}
                                                        onClick={() => !isDisabled && handleAddressTabClick(tab)}
                                                        disabled={isDisabled}
                                                        className={`flex-1 py-2 text-sm font-medium transition-colors relative
                ${currentAddressTab === tab
                                                                ? 'text-red-600 font-semibold after:content-[""] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-red-600'
                                                                : isDisabled
                                                                    ? 'text-gray-300 cursor-not-allowed'
                                                                    : 'text-gray-500 hover:text-gray-700'
                                                            }`}
                                                    >
                                                        {tab === 'city'
                                                            ? 'Tỉnh / TP'
                                                            : tab === 'district'
                                                                ? 'Quận / Huyện'
                                                                : 'Phường / Xã'}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Options */}
                                        <div className="max-h-60 overflow-y-auto">
                                            {currentAddressTab === 'city' &&
                                                Object.entries(provinces).map(([id, name]) => (
                                                    <div
                                                        key={id}
                                                        onClick={() => handleCitySelect(id, name)}
                                                        className={`p-3 cursor-pointer border-b last:border-0 transition-all
                ${addressInformation.provinceName === name
                                                                ? 'bg-red-50 text-red-600 font-medium'
                                                                : 'hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        {name}
                                                    </div>
                                                ))}

                                            {currentAddressTab === 'district' &&
                                                (addressInformation.provinceName ? (
                                                    Object.entries(districts).map(([id, name]) => (
                                                        <div
                                                            key={id}
                                                            onClick={() => handleDistrictSelect(id, name)}
                                                            className={`p-3 cursor-pointer border-b last:border-0 transition-all
                  ${addressInformation.districtName === name
                                                                    ? 'bg-red-50 text-red-600 font-medium'
                                                                    : 'hover:bg-gray-50'
                                                                }`}
                                                        >
                                                            {name}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="p-3 text-gray-400 text-center">Vui lòng chọn Tỉnh/TP trước</div>
                                                ))}

                                            {currentAddressTab === 'ward' &&
                                                (addressInformation.districtName ? (
                                                    Object.entries(wards).map(([id, name]) => (
                                                        <div
                                                            key={id}
                                                            onClick={() => handleWardSelect(name)}
                                                            className={`p-3 cursor-pointer border-b last:border-0 transition-all
                  ${addressInformation.wardName === name
                                                                    ? 'bg-red-50 text-red-600 font-medium'
                                                                    : 'hover:bg-gray-50'
                                                                }`}
                                                        >
                                                            {name}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="p-3 text-gray-400 text-center">Vui lòng chọn Quận/Huyện trước</div>
                                                ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Payment */}
                    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                        <h2 className="text-xl font-bold mb-5 text-gray-800 border-b pb-2">Phương thức thanh toán</h2>
                        <div className="space-y-3">
                            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-all">
                                <input type="radio" name="payment" value="Momo"
                                    checked={selectedPayment === 'Momo'}
                                    onChange={(e) => setSelectedPayment(e.target.value)} className="mr-3 accent-red-500" />
                                <img src={MomoPng.src} alt="MoMo" className="w-8 h-8 mr-3" />
                                <span className="text-gray-700">Thanh toán qua ví MoMo</span>
                            </label>

                            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-all">
                                <input type="radio" name="payment" value="VnPay"
                                    checked={selectedPayment === 'VnPay'}
                                    onChange={(e) => setSelectedPayment(e.target.value)} className="mr-3 accent-red-500" />
                                <img src={VnpayPng.src} alt="VNPay" className="w-8 h-8 mr-3" />
                                <span className="text-gray-700">Thanh toán qua cổng VNPay (ATM / Visa / MasterCard / QR Pay)</span>
                            </label>
                        </div>
                    </div>

                    {/* Note */}
                    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                        <textarea name="note" placeholder="Ghi chú đơn hàng"
                            rows={3} value={formData.note} onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none resize-none transition-all" />
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Cart Items */}
                    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                        <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Giỏ hàng</h2>
                        <div className="space-y-4">
                            {checkoutDTO.items.length === 0 ? (
                                <div className="text-center py-8">
                                    <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">Giỏ hàng của bạn đang trống</p>
                                </div>
                            ) : (
                                checkoutDTO.items.map((item) => (
                                    <CartItems
                                        key={item.cartId}
                                        item={item}
                                        showDeleteButton={false}
                                        showQuantityControls={false}
                                        showCheckbox={false}
                                    />
                                ))
                            )}
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                        <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Tóm tắt đơn hàng</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Tổng tiền hàng</span>
                                <span className="font-semibold">{checkoutDTO.totalProductPrice.toLocaleString('vi-VN')}đ</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Phí vận chuyển</span>
                                <span className="font-semibold">
                                    {checkoutDTO.serviceFee === 0 ? "" : `${checkoutDTO.serviceFee.toLocaleString('vi-VN')}đ`}
                                </span>
                            </div>
                            {checkoutDTO.insuranceFee > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Phí bảo hiểm</span>
                                    <span className="font-semibold">
                                        {checkoutDTO.insuranceFee.toLocaleString('vi-VN')}đ
                                    </span>
                                </div>
                            )}
                            <div className="border-t pt-3 flex justify-between text-lg font-bold">
                                <span>Tổng thanh toán</span>
                                <span className="text-red-600">{checkoutDTO.totalPrice.toLocaleString('vi-VN')}đ</span>
                            </div>
                        </div>
                        <button
                            className={`w-full py-4 mt-6 text-lg font-semibold rounded-xl transition-all duration-300 flex justify-center items-center gap-2
                            ${isProcessing || !isFormValid
                                    ? 'bg-gray-400 text-white cursor-not-allowed'
                                    : checkoutDTO.serviceFee === 0
                                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                        : 'bg-red-600 text-white hover:bg-red-700 shadow-lg'
                                }`}
                            onClick={handlePayment}
                            disabled={isProcessing || !isFormValid || checkoutDTO.serviceFee === 0}
                        >
                            {isProcessing ? (
                                <>
                                    <svg
                                        className="animate-spin h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                                        ></path>
                                    </svg>
                                    Đang xử lý...
                                </>
                            ) : (
                                'Đặt hàng'
                            )}
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
}
