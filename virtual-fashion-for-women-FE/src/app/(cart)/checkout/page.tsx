'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronRight, ShoppingBag, MapPin, Wallet, Star, Home, Store, Truck } from 'lucide-react';
import { CheckoutDTO } from '@/models/CheckoutDTO';
import { RequestCheckout } from '@/models/RequestCheckout';
import { api } from '@/api/instance';
import CartItems from '@/components/CartItem/CartItem';
import MomoPng from '../../../assets/payment/momo.png';
import VnpayPng from '../../../assets/payment/vnpay.png';
import GhnPng from '../../../assets/payment/ghnImage.png';
import { useRouter } from 'next/navigation';
import { messageToast } from '@/helpers/toastHelper';
import LoadingOverlay from '@/components/Loading/LoadingOverlay';
import { WalletDTO } from '@/models/WalletDTO';
import formatPrice from '@/utils/formatPrice';
import { ResponseDeliveryTypeFee } from '@/models/ResponseDeliveryTypeFee';
import { set } from 'lodash';
import { ShippingRegionFee } from '@/models/ShippingRegionFee';

export default function CheckoutForm() {
    const router = useRouter();
    const isSelectingRef = useRef(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [checkoutDTO, setCheckoutDTO] = useState<CheckoutDTO>({
        items: [],
        totalProductPrice: 0,
        deliveryTypeFees: [],
        totalWeight: 0
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
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [showSavedList, setShowSavedList] = useState(true);
    const [shippingMethod, setShippingMethod] = useState('GHN');
    const [selectedDelivery, setSelectedDelivery] = useState<ResponseDeliveryTypeFee>({
        deliveryType: 'GHN',
        serviceFee: 0,
        insuranceFee: 0,
        totalPrice: 0
    });
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

    const [wallet, setWallet] = useState<WalletDTO>();
    const [showShippingFeeModal, setShowShippingFeeModal] = useState(false);
    const [shippingFeeData, setShippingFeeData] = useState<ShippingRegionFee[]>([]);
    const canSelectWallet = useMemo(() => {
        return isFormValid && selectedDelivery.serviceFee > 0;
    }, [isFormValid, selectedDelivery.serviceFee]);

    const hasEnoughBalance = useMemo(() => {
        return wallet && wallet.balance >= selectedDelivery.totalPrice;
    }, [wallet, selectedDelivery.totalPrice]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (e.target.name === 'address') {
            if (e.target.value == '') {
                setShowSavedList(true);
            }
        }
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (formData.address !== '' && e.target.name === 'address') {
            setAddressInformation({
                provinceName: '',
                districtName: '',
                wardName: ''
            });
        }
        if (selectedPayment === 'Wallet') {
            setSelectedPayment('Momo');
        }
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
            note: formData.note,
            deliveringType: shippingMethod
        };

        try {
            if (selectedPayment === 'Wallet') {
                const response = await api.post('/wallet/payment', payload);
                if (response.status === 200) {
                    router.push('/');
                    messageToast.success("Thanh toán thành công đơn hàng qua ví!");
                } else {
                    messageToast.error("Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại sau.");
                    setIsProcessing(false);
                }
            } else {
                const response = await api.post('/payment', payload);
                if (response.status === 200) {
                    const paymentUrl = response.data;
                    router.push(paymentUrl);
                } else {
                    messageToast.error("Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại sau.");
                    setIsProcessing(false);
                }
            }
        } catch (error: any) {
            console.error("Payment error:", error.response.data);
            messageToast.error(error.response.data);
            setIsProcessing(false);
        }
    };
    console.log("method", shippingMethod);
    const handleCitySelect = async (provinceId: string, provinceName: string) => {
        if (addressInformation.provinceName !== provinceName) {
            setAddressInformation({
                provinceName,
                districtName: '',
                wardName: ''
            });
            clearAddressSelection();
            if (selectedPayment === 'Wallet') {
                setSelectedPayment('Momo');
            }
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
            if (selectedPayment === 'Wallet') {
                setSelectedPayment('Momo');
            }
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
            if (selectedPayment === 'Wallet') {
                setSelectedPayment('Momo');
            }
        }
        setShowAddressDropdown(false);
        setCurrentAddressTab('city');
    };

    const handleSelectShippingMethod = (method: string) => {
        setShippingMethod(method);
        const selectedDeliveryData: ResponseDeliveryTypeFee = checkoutDTO.deliveryTypeFees.find((fee: ResponseDeliveryTypeFee) => {
            return fee.deliveryType === method;
        });
        setSelectedDelivery((prev) => ({
            ...prev,
            deliveryType: method,
            serviceFee: selectedDeliveryData.serviceFee,
            insuranceFee: selectedDeliveryData.insuranceFee,
            totalPrice: selectedDeliveryData.totalPrice
        }));
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
            if (response.status === 200) {
                setCheckoutDTO((prev) => ({
                    ...prev,
                    deliveryTypeFees: response.data.deliveryTypeFees,
                    totalWeight: response.data.totalWeight,
                    totalProductPrice: response.data.totalProductPrice,
                }));
                const selectedDeliveryData = response.data.deliveryTypeFees.find((fee: ResponseDeliveryTypeFee) => {
                    return fee.deliveryType === shippingMethod;
                });
                setSelectedDelivery((prev) => ({
                    ...prev,
                    deliveryType: selectedDeliveryData.deliveryType,
                    serviceFee: selectedDeliveryData.serviceFee,
                    insuranceFee: selectedDeliveryData.insuranceFee,
                    totalPrice: selectedDeliveryData.totalPrice,
                    error: selectedDeliveryData.error
                }));
            }
        } catch (error: any) {
            console.error("Fetch checkout data error:", error);
            messageToast.error("Giao hàng nhanh chưa hỗ trợ khu vực này. Vui lòng chọn địa chỉ khác.");
        }
    };

    const fetchSelectedItems = async (payload: number[]) => {
        try {
            const response = await api.post('/selected-item', payload);
            if (response.status === 200) {
                setCheckoutDTO((prev) => ({
                    ...prev,
                    items: response.data
                }));
            }
        } catch (error: any) {
            messageToast.error(error.response?.data.message);
            router.push('/cart');
            return [];
        }
    }
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

            const response = await api.get(`/location/googleMap?address=${encodeURIComponent(query)}`);

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

    const fetchAddressDetails = async (placeName: string) => {
        try {
            console.log("Fetching address details:", placeName);
            const parts = placeName.split(',').map(part => part.trim());

            const lastThree = parts.slice(-4, -1);

            const data = {
                provinceName: lastThree[2],
                districtName: lastThree[1],
                wardName: lastThree[0]
            }
            console.log("Extracted address parts:", data);
            if (!provinces || !districts || !wards) {
                messageToast.error("Giao hàng nhanh chưa hỗ trợ khu vực này. Vui lòng chọn địa chỉ khác.");
                return;
            }
            if (data.provinceName === "TP Hồ Chí Minh" || data.provinceName === "Thành phố Hồ Chí Minh") {
                data.provinceName = "Hồ Chí Minh";
            }
            setAddressInformation({ provinceName: data.provinceName, districtName: data.districtName, wardName: data.wardName });
        } catch (error) {
            console.error(error);
        }
    };

    const fetchWallet = async () => {
        try {
            const response = await api.get("/wallet");
            if (response.status === 200) {
                setWallet(response.data);
            }
        } catch (error: any) {
            console.error('Lỗi khi lấy thông tin ví:', error);
            messageToast.error(error.response?.data?.message);
        }
    }

    const fetchShippingFeeData = async () => {
        try {
            const response = await api.get('/shipping/fees'); // Adjust endpoint as needed
            if (response.status === 200) {
                setShippingFeeData(response.data);
            }
        } catch (error: any) {
            console.error("Fetch shipping fee error:", error);
            messageToast.error("Lỗi khi tải bảng giá vận chuyển");
        }
    };

    const fetchUserSavedAddresses = async () => {
        try {
            const response = await api.get('/user-information/user-address');
            if (response.status === 200) {
                setSavedAddresses(response.data);
            } else {
                setSavedAddresses([]);
            }
        } catch (error) {
            console.log('Lỗi khi lấy địa chỉ đã lưu của người dùng:', error);
            setSavedAddresses([]);
        }
    }

    const handleSelectSavedAddress = (item: any) => {
        // Cập nhật text hiển thị
        setFormData({
            ...formData,
            address: item.address
        });

        // fetchAddressDetails(item.address);

        // Ẩn dropdown
        setShowSavedList(false);
        setAddressSuggestions([]);
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

    useEffect(() => {
        fetchShippingFeeData();
        const idsStr = sessionStorage.getItem("checkoutCartIds");
        if (idsStr) {
            const ids: number[] = JSON.parse(idsStr);
            if (ids.length > 0) {
                fetchSelectedItems(ids);
                const payload = {
                    cartIds: ids,
                    provinceName: addressInformation.provinceName,
                    districtName: addressInformation.districtName,
                    wardName: addressInformation.wardName
                };
                fetchCheckoutData(payload);
            } else {
                messageToast.error("Không có sản phẩm để thanh toán. Vui lòng chọn sản phẩm trong giỏ hàng.");
                router.push('/cart');
                return;
            }
        } else {
            messageToast.error("Không có sản phẩm để thanh toán. Vui lòng chọn sản phẩm trong giỏ hàng.");
            router.push('/cart');
            return;
        }
        fetchProvinceData();
        fetchWallet();
        fetchUserSavedAddresses();
    }, []);

    useEffect(() => {
        if (addressInformation.provinceName && addressInformation.districtName && addressInformation.wardName) {
            const payload = {
                cartIds: checkoutDTO.items.map(item => item.cartId),
                provinceName: addressInformation.provinceName,
                districtName: addressInformation.districtName,
                wardName: addressInformation.wardName
            };
            setCheckoutDTO((prev) => ({
                ...prev,
                totalPrice: prev.totalProductPrice
            }));
            setSelectedDelivery((prev) => ({
                ...prev,
                serviceFee: 0,
                insuranceFee: 0,
            }));
            fetchCheckoutData(payload);

        }
    }, [addressInformation]);

    useEffect(() => {
        if (checkoutDTO.deliveryTypeFees.length > 0) {
            // Nếu GHN có error
            if (isDeliveryMethodDisabled('GHN') && shippingMethod === 'GHN') {
                // Tự động chuyển sang External
                setShippingMethod('External');
                const selectedDeliveryData = checkoutDTO.deliveryTypeFees.find((fee: ResponseDeliveryTypeFee) => {
                    return fee.deliveryType === 'External';
                });
                if (selectedDeliveryData) {
                    setSelectedDelivery((prev) => ({
                        ...prev,
                        deliveryType: 'External',
                        serviceFee: selectedDeliveryData.serviceFee,
                        insuranceFee: selectedDeliveryData.insuranceFee,
                        totalPrice: selectedDeliveryData.totalPrice,
                        error: selectedDeliveryData.error
                    }));
                }
            }
        }
    }, [checkoutDTO.deliveryTypeFees]);

    const isDeliveryMethodDisabled = (method: string): boolean => {
        const deliveryFee = checkoutDTO.deliveryTypeFees.find(
            (fee: ResponseDeliveryTypeFee) => fee.deliveryType === method
        );
        return deliveryFee?.error ? true : false;
    };

    const getDeliveryErrorMessage = (method: string): string => {
        const deliveryFee = checkoutDTO.deliveryTypeFees.find(
            (fee: ResponseDeliveryTypeFee) => fee.deliveryType === method
        );

        if (deliveryFee?.error) {
            return deliveryFee.error;
        }

        // Return description mặc định nếu không có error
        if (method === 'GHN') {
            return 'Đơn vị vận chuyển giao hàng nhanh.';
        } else if (method === 'External') {
            return 'Nhân viên cửa hàng sẽ làm việc với đơn vị bên ngoài.';
        }
        return '';
    };

    // ================= UI ==================
    return (
        <div className="max-w-7xl mx-auto p-3 md:p-6 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
            {isProcessing && <LoadingOverlay size={60} />}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
                {/* Left Column - Responsive */}
                <div className="lg:col-span-2 space-y-4 md:space-y-6">
                    {/* Shipping Info - Responsive */}
                    <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-md border border-gray-100">
                        <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-5 text-gray-800 border-b pb-2">
                            Thông tin giao hàng
                        </h2>
                        <div className="space-y-3 md:space-y-4">
                            <input
                                type="text"
                                name="fullName"
                                placeholder="Họ và tên"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                className="w-full p-2.5 md:p-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all"
                            />
                            <input
                                type="tel"
                                name="phone"
                                placeholder="Số điện thoại"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="w-full p-2.5 md:p-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all"
                            />

                            {/* Address input - Responsive */}
                            <div className="relative">
                                <input
                                    type="text"
                                    name="address"
                                    placeholder="Địa chỉ"
                                    value={formData.address}
                                    onChange={(e) => {
                                        handleInputChange(e);
                                        // setShowSavedList(false);
                                    }}
                                    onFocus={() => {
                                        // Khi focus, nếu ô input đang trống thì hiện địa chỉ đã lưu
                                        if (!formData.address.trim() && savedAddresses.length > 0) {
                                            setShowSavedList(true);
                                        }
                                    }}
                                    // onBlur={() => setTimeout(() => setShowSavedList(false), 200)}
                                    className="w-full p-2.5 md:p-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all"
                                />
                                {isLoadingSuggestions && (
                                    <div className="absolute right-3 top-2.5 md:top-3 text-gray-400 text-xs md:text-sm animate-pulse">
                                        ...
                                    </div>
                                )}
                                {showSavedList && formData.address == '' && addressSuggestions.length == 0 && savedAddresses.length > 0 && (
                                    <div className="border-b-2 border-gray-100 pb-1">
                                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50 flex items-center gap-1">
                                            ĐỊA CHỈ CỦA BẠN
                                        </div>
                                        {savedAddresses.map((addr, index) => (
                                            <div
                                                key={index}
                                                onClick={() => handleSelectSavedAddress(addr)}
                                                className="flex flex-col p-2.5 md:p-3 hover:bg-red-50 cursor-pointer border-b last:border-0 border-gray-100 transition-colors group/item"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Home className="w-4 h-4 text-red-500 flex-shrink-0" />
                                                    <span className="text-sm font-medium text-gray-800 group-hover/item:text-red-700">
                                                        {addr.address}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {addressSuggestions.length > 0 && (
                                    <div className="absolute z-20 w-full bg-white border rounded-lg mt-1 shadow-lg max-h-48 md:max-h-60 overflow-y-auto">
                                        {addressSuggestions.map((s) => (
                                            <div
                                                key={s.placeId}
                                                onClick={() => {
                                                    isSelectingRef.current = true;
                                                    setFormData({ ...formData, address: s.description });
                                                    fetchAddressDetails(s.description);
                                                    setAddressSuggestions([]);
                                                }}
                                                className="flex items-center gap-2 p-2.5 md:p-3 hover:bg-gray-50 cursor-pointer border-b last:border-0 border-gray-100"
                                            >
                                                <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 text-red-500 flex-shrink-0" />
                                                <span className="text-xs md:text-sm">{s.description}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Dropdown - Responsive */}
                            <div className="relative">
                                <div className="w-full p-2.5 md:p-3 border border-gray-300 rounded-lg cursor-pointer bg-white flex justify-between items-center hover:border-gray-400 transition-all">
                                    <span className={`text-xs md:text-sm ${addressInformation.provinceName ? 'text-gray-800' : 'text-gray-500'}`}>
                                        {getAddressDisplayValue()}
                                    </span>
                                </div>

                                {false && showAddressDropdown && (
                                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                                        {/* Tabs - Responsive */}
                                        <div className="flex border-b">
                                            {['city', 'district', 'ward'].map((tab) => {
                                                const isDisabled =
                                                    (tab === 'district' && !addressInformation.provinceName) ||
                                                    (tab === 'ward' && !addressInformation.districtName);

                                                return (
                                                    <button
                                                        key={tab}
                                                        onClick={() => !isDisabled && handleAddressTabClick(tab)}
                                                        disabled={isDisabled}
                                                        className={`flex-1 py-2 text-xs md:text-sm font-medium transition-colors relative
                                                        ${currentAddressTab === tab
                                                                ? 'text-red-600 font-semibold after:content-[""] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-red-600'
                                                                : isDisabled
                                                                    ? 'text-gray-300 cursor-not-allowed'
                                                                    : 'text-gray-500 hover:text-gray-700'
                                                            }`}
                                                    >
                                                        {tab === 'city' ? 'Tỉnh / TP' : tab === 'district' ? 'Quận / Huyện' : 'Phường / Xã'}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Options - Responsive */}
                                        <div className="max-h-48 md:max-h-60 overflow-y-auto">
                                            {currentAddressTab === 'city' &&
                                                Object.entries(provinces).map(([id, name]) => (
                                                    <div
                                                        key={id}
                                                        onClick={() => handleCitySelect(id, name)}
                                                        className={`p-2.5 md:p-3 text-xs md:text-sm cursor-pointer border-b last:border-0 transition-all
                                                        ${addressInformation.provinceName === name
                                                                ? 'bg-red-50 text-red-600 font-medium'
                                                                : 'hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        {name}
                                                    </div>
                                                ))}
                                            {/* Similar for district and ward... */}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-md border border-gray-100">
                        <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-5 text-gray-800 border-b pb-2">
                            Phương thức vận chuyển
                        </h2>
                        <div className="space-y-3">
                            {/* Giao hàng nhanh (GHN) */}
                            <label
                                className={`flex items-center p-2.5 md:p-3 border rounded-lg cursor-pointer transition-all ${isDeliveryMethodDisabled('GHN')
                                    ? 'opacity-60 bg-gray-100 cursor-not-allowed'
                                    : shippingMethod === 'GHN' ? '' : 'hover:bg-gray-50'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="shipping"
                                    value="GHN"
                                    checked={shippingMethod === 'GHN'}
                                    onChange={(e) => handleSelectShippingMethod(e.target.value)}
                                    disabled={isDeliveryMethodDisabled('GHN')}
                                    className="mr-2 md:mr-3 accent-red-500 mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                <img src={GhnPng.src} alt="GHN" className={`w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3 flex-shrink-0 ${isDeliveryMethodDisabled('GHN') ? 'text-gray-400' : 'text-blue-600'
                                    }`} />
                                <div className="flex flex-col flex-1">
                                    <span className={`text-sm md:text-base font-medium ${isDeliveryMethodDisabled('GHN') ? 'text-gray-500' : 'text-gray-800'
                                        }`}>
                                        Giao hàng nhanh
                                    </span>
                                    <span className={`text-xs ${isDeliveryMethodDisabled('GHN') ? 'text-red-500 font-medium' : 'text-gray-500'
                                        }`}>
                                        {getDeliveryErrorMessage('GHN')}
                                    </span>
                                </div>
                            </label>

                            {/* Cửa hàng tự giao */}
                            <label
                                className={`flex items-center p-2.5 md:p-3 border rounded-lg cursor-pointer transition-all ${isDeliveryMethodDisabled('External')
                                    ? 'opacity-60 bg-gray-100 cursor-not-allowed'
                                    : shippingMethod === 'External'
                                        ? ''
                                        : 'hover:bg-gray-50'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="shipping"
                                    value="External"
                                    checked={shippingMethod === 'External'}
                                    onChange={(e) => handleSelectShippingMethod(e.target.value)}
                                    disabled={isDeliveryMethodDisabled('External')}
                                    className="mr-2 md:mr-3 accent-red-500 mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                <Store
                                    className={`w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3 flex-shrink-0 ${isDeliveryMethodDisabled('External') ? 'text-gray-400' : 'text-green-600'
                                        }`}
                                />
                                <div className="flex flex-col flex-1">
                                    <span
                                        className={`text-sm md:text-base font-medium ${isDeliveryMethodDisabled('External') ? 'text-gray-500' : 'text-gray-800'
                                            }`}
                                    >
                                        Cửa hàng giao
                                    </span>
                                    {!isDeliveryMethodDisabled('External') && checkoutDTO.totalWeight && (
                                        <span className="text-xs text-gray-600 font-medium">
                                            Khối lượng sản phẩm tạm tính: {checkoutDTO.totalWeight} kg
                                        </span>
                                    )}
                                    <div className="flex items-center gap-2 mt-1">
                                        <span
                                            className={`text-xs ${isDeliveryMethodDisabled('External')
                                                ? 'text-red-500 font-medium'
                                                : 'text-gray-500'
                                                }`}
                                        >
                                            {getDeliveryErrorMessage('External')}
                                        </span>

                                    </div>
                                </div>
                                {!isDeliveryMethodDisabled('External') && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setShowShippingFeeModal(true);
                                        }}
                                        className="ml-2 md:ml-3 px-3 py-1 text-xs md:text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors whitespace-nowrap flex-shrink-0"
                                    >
                                        Xem bảng giá
                                    </button>
                                )}
                            </label>
                        </div>
                    </div>

                    {/* Payment Methods - Responsive */}
                    <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-md border border-gray-100">
                        <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-5 text-gray-800 border-b pb-2">
                            Phương thức thanh toán
                        </h2>
                        <div className="space-y-3">
                            <label className="flex items-center p-2.5 md:p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-all">
                                <input
                                    type="radio"
                                    name="payment"
                                    value="Momo"
                                    checked={selectedPayment === 'Momo'}
                                    onChange={(e) => setSelectedPayment(e.target.value)}
                                    className="mr-2 md:mr-3 accent-red-500"
                                />
                                <img src={MomoPng.src} alt="MoMo" className="w-6 h-6 md:w-8 md:h-8 mr-2 md:mr-3" />
                                <span className="text-xs md:text-sm text-gray-700">Thanh toán qua ví MoMo</span>
                            </label>

                            <label className="flex items-center p-2.5 md:p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-all">
                                <input
                                    type="radio"
                                    name="payment"
                                    value="VnPay"
                                    checked={selectedPayment === 'VnPay'}
                                    onChange={(e) => setSelectedPayment(e.target.value)}
                                    className="mr-2 md:mr-3 accent-red-500"
                                />
                                <img src={VnpayPng.src} alt="VNPay" className="w-6 h-6 md:w-8 md:h-8 mr-2 md:mr-3" />
                                <span className="text-xs md:text-sm text-gray-700">
                                    Thanh toán qua cổng VNPay (ATM / Visa / MasterCard / QR Pay)
                                </span>
                            </label>

                            <label
                                className={`flex items-start p-2.5 md:p-3 border rounded-lg transition-all cursor-pointer
                                ${!canSelectWallet || !hasEnoughBalance
                                        ? 'opacity-60 cursor-not-allowed bg-gray-100 hover:bg-gray-100'
                                        : 'hover:bg-gray-50'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    disabled={!canSelectWallet || !hasEnoughBalance}
                                    name="payment"
                                    value="Wallet"
                                    checked={selectedPayment === 'Wallet'}
                                    onChange={(e) => setSelectedPayment(e.target.value)}
                                    className="mr-2 md:mr-3 accent-red-500 mt-1"
                                />
                                <Wallet className="w-6 h-6 md:w-8 md:h-8 mr-2 md:mr-3 flex-shrink-0" />
                                <div className="flex flex-col">
                                    <span className="text-xs md:text-sm text-gray-700 font-medium">Thanh toán qua ví</span>
                                    <span className="text-[10px] md:text-xs text-gray-500">
                                        Số dư khả dụng: {formatPrice(wallet?.balance ?? 0)} đ
                                    </span>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Note - Responsive */}
                    <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-md border border-gray-100">
                        <textarea
                            name="note"
                            placeholder="Ghi chú đơn hàng"
                            rows={3}
                            value={formData.note}
                            onChange={handleInputChange}
                            className="w-full p-2.5 md:p-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none resize-none transition-all"
                        />
                    </div>
                </div>

                {/* Right Column - Responsive */}
                <div className="space-y-4 md:space-y-6">
                    {/* Cart Items - Responsive */}
                    <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-md border border-gray-100">
                        <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-gray-800 border-b pb-2">
                            Giỏ hàng
                        </h2>
                        <div className="space-y-3 md:space-y-4">
                            {checkoutDTO.items.length === 0 ? (
                                <div className="text-center py-6 md:py-8">
                                    <ShoppingBag className="w-10 h-10 md:w-12 md:h-12 text-gray-400 mx-auto mb-3 md:mb-4" />
                                    <p className="text-sm md:text-base text-gray-500">Giỏ hàng của bạn đang trống</p>
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

                    {/* Summary - Responsive */}
                    <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-md border border-gray-100">
                        <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-gray-800 border-b pb-2">
                            Tóm tắt đơn hàng
                        </h3>
                        <div className="space-y-2 md:space-y-3 text-xs md:text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Tổng tiền hàng</span>
                                <span className="font-semibold">
                                    {checkoutDTO.totalProductPrice.toLocaleString('vi-VN')}đ
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Phí vận chuyển</span>
                                <span className="font-semibold">
                                    {selectedDelivery.serviceFee === 0 ? '' : `${selectedDelivery.serviceFee.toLocaleString('vi-VN')}đ`}
                                </span>
                            </div>
                            {selectedDelivery.insuranceFee > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Phí bảo hiểm</span>
                                    <span className="font-semibold">
                                        {selectedDelivery.insuranceFee.toLocaleString('vi-VN')}đ
                                    </span>
                                </div>
                            )}
                            <div className="border-t pt-2 md:pt-3 flex justify-between text-base md:text-lg font-bold">
                                <span>Tổng thanh toán</span>
                                <span className="text-red-600">
                                    {selectedDelivery.totalPrice.toLocaleString('vi-VN')}đ
                                </span>
                            </div>
                        </div>

                        <button
                            className={`w-full py-3 md:py-4 mt-4 md:mt-6 text-base md:text-lg font-semibold rounded-xl transition-all duration-300 flex justify-center items-center gap-2
                            ${isProcessing || !isFormValid
                                    ? 'bg-gray-400 text-white cursor-not-allowed'
                                    : selectedDelivery.serviceFee === 0
                                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                        : 'bg-red-600 text-white hover:bg-red-700 shadow-lg'
                                }`}
                            onClick={handlePayment}
                            disabled={isProcessing || !isFormValid || selectedDelivery.serviceFee === 0}
                        >
                            {isProcessing ? (
                                <>
                                    <svg
                                        className="animate-spin h-4 w-4 md:h-5 md:w-5 text-white"
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
                                    <span className="text-sm md:text-base">Đang xử lý...</span>
                                </>
                            ) : (
                                'Đặt hàng'
                            )}
                        </button>
                    </div>
                </div>
                {showShippingFeeModal && (
                    <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-auto">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 md:p-6 flex justify-between items-center sticky top-0">
                                <h3 className="text-lg md:text-xl font-bold">Bảng Giá Vận Chuyển Cửa Hàng</h3>
                                <button
                                    onClick={() => setShowShippingFeeModal(false)}
                                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-1 transition-all"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-4 md:p-6">
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="bg-gray-100 border-b-2 border-gray-300">
                                                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-semibold text-gray-700">
                                                    Tuyến
                                                </th>
                                                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-semibold text-gray-700">
                                                    Khối Lượng
                                                </th>
                                                <th className="px-3 md:px-4 py-2 md:py-3 text-right text-xs md:text-sm font-semibold text-gray-700">
                                                    Phí Cơ Bảng
                                                </th>
                                                <th className="px-3 md:px-4 py-2 md:py-3 text-right text-xs md:text-sm font-semibold text-gray-700">
                                                    Thêm 0.5 kg
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {shippingFeeData.length > 0 ? (
                                                shippingFeeData.map((deliveringFee, index) => (
                                                    <tr
                                                        key={index}
                                                        className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                                            }`}
                                                    >
                                                        <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-800">
                                                            {deliveringFee.regionType === 'NS tinh' && 'Nội Tỉnh'}
                                                            {deliveringFee.regionType === 'Ngoai tinh' && 'Ngoài Tỉnh'}
                                                            {deliveringFee.regionType !== 'NS tinh' && deliveringFee.regionType !== 'Ngoai tinh' && deliveringFee.regionType}
                                                        </td>
                                                        <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-800">
                                                            0 - 0.5 kg
                                                        </td>
                                                        <td className="px-3 md:px-4 py-2 md:py-3 text-right text-xs md:text-sm font-semibold text-green-600">
                                                            {deliveringFee.basePrice.toLocaleString('vi-VN')} đ
                                                        </td>
                                                        <td className="px-3 md:px-4 py-2 md:py-3 text-right text-xs md:text-sm font-semibold text-green-600">
                                                            {deliveringFee.additionalWeightFee.toLocaleString('vi-VN')} đ
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={4} className="px-3 md:px-4 py-6 text-center text-sm text-gray-500">
                                                        Không có dữ liệu
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="bg-gray-50 p-4 md:p-6 border-t flex justify-end">
                                <button
                                    onClick={() => setShowShippingFeeModal(false)}
                                    className="px-4 md:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm md:text-base font-medium"
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
