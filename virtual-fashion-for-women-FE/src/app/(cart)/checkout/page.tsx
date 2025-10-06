'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronRight, Plus, Minus, Copy, ShoppingBag, MapPin } from 'lucide-react';
import { CartItemDTO } from '@/models/CartItemDTO';
import { CheckoutDTO } from '@/models/CheckoutDTO';
import { RequestCheckout } from '@/models/RequestCheckout';
import { api } from '@/api/instance';
import CartItems from '@/components/CartItem/CartItem';
import MomoPng from '../../../assets/payment/momo.png';
import VnpayPng from '../../../assets/payment/vnpay.png';
import { useRouter } from 'next/navigation';

export default function CheckoutForm() {
    const router = useRouter();
    const isSelectingRef = useRef(false);
    const [checkoutDTO, setCheckoutDTO] = useState<CheckoutDTO>({
        items: [],
        totalProductPrice: 0,
        serviceFree: 0,
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
    const [currentAddressTab, setCurrentAddressTab] = useState('city'); // city, district, ward

    const [addressSuggestions, setAddressSuggestions] = useState<{ placeId: string, description: string }[]>([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

    const [selectedPayment, setSelectedPayment] = useState('Momo');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handlePayment = async () => {
        if (!formData.fullName || !formData.phone || !formData.address) {
            alert("Vui lòng nhập đầy đủ họ tên, số điện thoại và địa chỉ trước khi đặt hàng!");
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
        }

        try {
            const response = await api.post('/payment', payload);
            if (response.status === 200) {
                const paymentUrl = response.data;
                router.push(paymentUrl);
            }
        } catch (error) {
            console.error("Payment error:", error);
            alert("Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại sau.");
        }
    }

    const handleCitySelect = async (provinceId: string, provinceName: string) => {
        if (addressInformation.provinceName !== provinceName) {
            setAddressInformation({
                provinceName,
                districtName: '',
                wardName: ''
            });
            clearAddressSelection();
            await fetchDistrictData(provinceId).then(
                () => {
                    setCurrentAddressTab('district');
                }
            );

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

    const handleAddressTabClick = (tab: string) => {
        setCurrentAddressTab(tab);
    };

    const clearAddressSelection = () => {
        setFormData({ ...formData, address: '' });
    };

    const fetchCheckoutData = async (payload: RequestCheckout) => {
        try {
            const response = await api.post('/checkout', payload);
            if (response.status === 200) {
                const data: CheckoutDTO = response.data;
                setCheckoutDTO(data);
            }
        } catch (error) {
            console.error("Fetch checkout data error:", error);
            router.push('/cart');
        }
    };

    const fetchProvinceData = async () => {
        try {
            const response = await api.get('/location/provinces');
            if (response.status === 200) {
                const data: Record<string, string> = response.data;
                setProvince(data);
            }
        } catch (error) {
            console.error("Fetch province data error:", error);
        }
    }

    const fetchDistrictData = async (provinceId: string): Promise<Record<string, string>> => {
        try {
            const response = await api.get(`/location/districts/${provinceId}`);
            if (response.status === 200) {
                const data: Record<string, string> = response.data;
                setDistrict(data);
                return data;
            }
        } catch (error) {
            console.error("Fetch district data error:", error);
            return {};
        }
        return {};
    };

    const fetchWardData = async (districtId: string): Promise<Record<string, string>> => {
        try {
            const response = await api.get(`/location/wards/${districtId}`);
            if (response.status === 200) {
                const data: Record<string, string> = response.data;
                setWard(data);
                return data; // ✅ Trả về dữ liệu
            }
        } catch (error) {
            console.error("Fetch ward data error:", error);
            return {};
        }
        return {};
    };

    const fetchAddressSuggestions = async (query: string) => {
        if (!query) {
            setAddressSuggestions([]);
            return;
        }
        try {
            setIsLoadingSuggestions(true);
            const response = await api.get(`/location/googleMap/${encodeURIComponent(query)}`);
            if (response.status === 200) {
                // giả sử BE trả về object: { placeId: description }
                const data: Record<string, string> = response.data;

                // convert sang array
                const arr = Object.entries(data).map(([placeId, description]) => ({
                    placeId,
                    description
                }));

                setAddressSuggestions(arr);
            }
        } catch (error) {
            console.error("Error fetching address suggestions:", error);
        } finally {
            setIsLoadingSuggestions(false);
        }
    };

    const fetchAddressDetails = async (placeId: string) => {
        try {
            const response = await api.post(`/location/googleMap/place/${placeId}`);
            if (response.status === 200) {
                const data = response.data;

                const matchedProvinceEntry = Object.entries(provinces).find(
                    ([, name]) => name.toLowerCase().includes(data.provinceName.toLowerCase())
                );


                if (matchedProvinceEntry) {
                    const [provinceId, provinceName] = matchedProvinceEntry;

                    const districtsData = await fetchDistrictData(provinceId);

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
                            const [wardId, wardName] = matchedWardEntry;
                            setAddressInformation({
                                provinceName: provinceName,
                                districtName: districtName,
                                wardName: wardName
                            });
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching address details:", error);
        }
    };

    useEffect(() => {
        if (isSelectingRef.current) {
            // ✅ bỏ qua debounce khi là chọn địa chỉ
            isSelectingRef.current = false;
            return;
        }
        const handler = setTimeout(() => {
            if (formData.address.length > 1) { // chỉ gọi khi có >1 ký tự
                fetchAddressSuggestions(formData.address);
            } else {
                setAddressSuggestions([]);
            }
        }, 500); // 500ms

        return () => {
            clearTimeout(handler); // clear nếu user vẫn đang gõ
        };
    }, [formData.address]);


    useEffect(() => {
        fetchProvinceData();
    }, [])
    useEffect(() => {

        const idsStr = localStorage.getItem("checkoutCartIds");
        if (idsStr) {
            const ids: number[] = JSON.parse(idsStr);
            const payload = {
                cartIds: ids,
                provinceName: addressInformation.provinceName,
                districtName: addressInformation.districtName,
                wardName: addressInformation.wardName
            }
            fetchCheckoutData(payload);
        }
    }, [addressInformation]);

    return (
        <div className="max-w-7xl mx-auto p-4 bg-gray-50 min-h-screen">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Form */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Shipping Information */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h2 className="text-lg font-semibold mb-4 text-gray-800">Thông tin giao hàng</h2>
                        <div className="space-y-4">
                            <input
                                type="text"
                                name="fullName"
                                placeholder="Nhập họ và tên"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                            <div className="relative">
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="Nhập số điện thoại"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent pr-12"
                                />
                            </div>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="address"
                                    placeholder="Địa chỉ"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                />
                                {isLoadingSuggestions && (
                                    <div className="absolute right-3 top-3 text-gray-400 text-sm">...</div>
                                )}

                                {addressSuggestions.length > 0 && (
                                    <div className="absolute z-20 w-full bg-white border rounded-md mt-1 shadow-md max-h-60 overflow-y-auto">
                                        {addressSuggestions.map((s, idx) => (
                                            <div
                                                key={s.placeId}
                                                onClick={() => {
                                                    isSelectingRef.current = true;
                                                    setFormData({ ...formData, address: s.description });
                                                    fetchAddressDetails(s.placeId);
                                                    setAddressSuggestions([]);
                                                }}
                                                className={`flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer ${idx !== addressSuggestions.length - 1 ? "border-b border-gray-300" : ""
                                                    }`}
                                            >
                                                <MapPin className="w-4 h-4 text-red-500" />
                                                <span>{s.description}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>




                            {/* Combined Address Dropdown */}
                            <div className="relative">
                                <div
                                    onClick={() => setShowAddressDropdown(!showAddressDropdown)}
                                    className="w-full p-3 border border-gray-300 rounded-md cursor-pointer bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent flex justify-between items-center"
                                >
                                    <span className={addressInformation.provinceName || addressInformation.districtName || addressInformation.wardName ? 'text-gray-900' : 'text-gray-500'}>
                                        {getAddressDisplayValue()}
                                    </span>
                                    <ChevronRight className={`w-5 h-5 transition-transform ${showAddressDropdown ? 'rotate-90' : ''}`} />
                                </div>

                                {showAddressDropdown && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                                        {/* Tabs */}
                                        <div className="flex border-b border-gray-200">
                                            <button
                                                type="button"
                                                onClick={() => handleAddressTabClick('city')}
                                                className={`flex-1 px-4 py-2 text-sm font-medium border-b-2 ${currentAddressTab === 'city'
                                                    ? 'text-black border-black'
                                                    : 'text-gray-500 border-transparent hover:text-gray-700'
                                                    }`}
                                            >
                                                Tỉnh / TP
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleAddressTabClick('district')}
                                                disabled={!addressInformation.provinceName}
                                                className={`flex-1 px-4 py-2 text-sm font-medium border-b-2 ${currentAddressTab === 'district'
                                                    ? 'text-black border-black'
                                                    : !addressInformation.provinceName
                                                        ? 'text-gray-300 border-transparent cursor-not-allowed'
                                                        : 'text-gray-700 border-transparent hover:text-gray-900'
                                                    }`}
                                            >
                                                Quận / Huyện
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleAddressTabClick('ward')}
                                                disabled={!addressInformation.districtName}
                                                className={`flex-1 px-4 py-2 text-sm font-medium border-b-2 ${currentAddressTab === 'ward'
                                                    ? 'text-black border-black'
                                                    : !addressInformation.districtName
                                                        ? 'text-gray-300 border-transparent cursor-not-allowed'
                                                        : 'text-gray-700 border-transparent hover:text-gray-900'
                                                    }`}
                                            >
                                                Phường / Xã
                                            </button>
                                        </div>

                                        {/* Content */}
                                        <div className="max-h-60 overflow-y-auto">
                                            {currentAddressTab === 'city' && (
                                                Object.entries(provinces).map(([id, provinceName]) => (
                                                    <div
                                                        key={id}
                                                        onClick={() => handleCitySelect(id, provinceName)}
                                                        className={`p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${addressInformation.provinceName === provinceName ? 'bg-red-50 text-red-600' : ''
                                                            }`}
                                                    >
                                                        {provinceName}
                                                    </div>
                                                ))
                                            )}

                                            {currentAddressTab === 'district' && (
                                                addressInformation.provinceName
                                                    ? Object.entries(districts).map(([id, districtName]) => (
                                                        <div
                                                            key={id}
                                                            onClick={() => handleDistrictSelect(id, districtName)}
                                                            className={`p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${addressInformation.districtName === districtName ? 'bg-red-50 text-red-600' : ''
                                                                }`}
                                                        >
                                                            {districtName}
                                                        </div>
                                                    ))
                                                    : <div className="p-3 text-gray-500 text-center">Vui lòng chọn Tỉnh/TP trước</div>
                                            )}

                                            {currentAddressTab === 'ward' && (
                                                addressInformation.districtName
                                                    ? Object.entries(wards).map(([id, wardName]) => (
                                                        <div
                                                            key={id}
                                                            onClick={() => handleWardSelect(wardName)}
                                                            className={`p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${addressInformation.wardName === wardName ? 'bg-red-50 text-red-600' : ''
                                                                }`}
                                                        >
                                                            {wardName}
                                                        </div>
                                                    ))
                                                    : <div className="p-3 text-gray-500 text-center">Vui lòng chọn Quận/Huyện trước</div>
                                            )}
                                        </div>

                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h2 className="text-lg font-semibold mb-4 text-gray-800">Phương thức thanh toán</h2>
                        <div className="space-y-3">
                            {/* MoMo */}
                            <label className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                                <input
                                    type="radio"
                                    name="payment"
                                    value="Momo"
                                    checked={selectedPayment === 'Momo'}
                                    onChange={(e) => setSelectedPayment(e.target.value)}
                                    className="mr-3"
                                />
                                <img
                                    src={MomoPng.src}  // Đường dẫn logo momo
                                    alt="MoMo"
                                    className="w-8 h-8 object-contain mr-3"
                                />
                                <span>Thanh toán online qua ví MoMo</span>
                            </label>

                            {/* VNPay */}
                            <label className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                                <input
                                    type="radio"
                                    name="payment"
                                    value="VnPay"
                                    checked={selectedPayment === 'VnPay'}
                                    onChange={(e) => setSelectedPayment(e.target.value)}
                                    className="mr-3"
                                />
                                <img
                                    src={VnpayPng.src}   // Đường dẫn logo vnpay
                                    alt="VNPay"
                                    className="w-8 h-8 object-contain mr-3"
                                />
                                <span>Thanh toán online qua cổng VNPay (ATM/Visa/MasterCard/JCB/QR Pay bằng Mobile Banking)</span>
                            </label>
                        </div>
                    </div>


                    {/* Order Note */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <textarea
                            name="note"
                            placeholder="Ghi chú đơn hàng"
                            rows={3}
                            value={formData.note}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                        />
                    </div>
                </div>

                {/* Right Column - Cart */}
                <div className="space-y-6">
                    {/* Cart Items */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h2 className="text-lg font-semibold mb-4 text-gray-800">Giỏ hàng</h2>
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

                    {/* Order Summary */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">Tóm tắt đơn hàng</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Tổng tiền hàng</span>
                                <span className="font-semibold">{checkoutDTO.totalProductPrice.toLocaleString('vi-VN')}đ</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Phí vận chuyển</span>
                                <span className="font-semibold">
                                    {checkoutDTO.serviceFree === 0 ? "" : `${checkoutDTO.serviceFree.toLocaleString('vi-VN')}đ`}
                                </span>
                            </div>
                            {checkoutDTO.insuranceFee > 0 && (<div className="flex justify-between">
                                <span className="text-gray-600">Phí bảo hiểm vận chuyển</span>
                                <span className="font-semibold">
                                    {checkoutDTO.insuranceFee === 0 ? "" : `${checkoutDTO.insuranceFee.toLocaleString('vi-VN')}đ`}
                                </span>
                            </div>
                            )}
                            <div className="border-t pt-3 flex justify-between text-lg font-semibold">
                                <span>Tổng thanh toán</span>
                                <span className="text-red-600">{checkoutDTO.totalPrice.toLocaleString('vi-VN')}đ</span>
                            </div>
                        </div>

                        <button className={`w-full py-4 rounded-md mt-6 font-semibold text-lg transition-colors
                                ${checkoutDTO.serviceFree === 0
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-black text-white hover:bg-gray-800"
                            }`}
                            onClick={handlePayment}
                            disabled={checkoutDTO.serviceFree === 0}
                        >
                            Đặt hàng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}