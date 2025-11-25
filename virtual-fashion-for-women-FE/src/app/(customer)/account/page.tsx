'use client';
import React, { use, useEffect, useRef, useState } from "react";
import { Button, Input } from "antd";
import { UserInformation } from "@/models/UserInformation";
import { api } from "@/api/instance";
import LoadingSpinner from "@/components/Loading/LoadingSpinner";
import { messageToast } from "@/helpers/toastHelper";
import { set } from "lodash";
import { MapPin } from "lucide-react";

export default function AccountPage() {
    const [user, setUser] = useState<UserInformation>({
        userId: 0,
        fullName: "",
        email: "",
        phoneNumber: "",
        address: "",
    });
    const isSelectingRef = useRef(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState<any>({
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        address: user.address,
    });
    const [loading, setLoading] = useState(false);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [addressSuggestions, setAddressSuggestions] = useState<{ placeId: string, description: string }[]>([]);

    const fetchUserInformation = async () => {
        try {
            setLoading(true);
            const response = await api.get("/user-information");
            if (response.status === 200) {
                setUser(response.data);
                setEditedUser(response.data);
            }
        } catch (error) {
            console.error("Error fetching user information:", error);
        } finally {
            setLoading(false);
        }
    }

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

    const handleChange = (field: keyof UserInformation, value: string) => {
        setEditedUser((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const payload = {
                fullName: editedUser.fullName,
                phoneNumber: editedUser.phoneNumber,
                address: editedUser.address,
            };
            const response = await api.put(`/user-information/${user.userId}`, payload);
            if (response.status === 200) {
                setUser(response.data);
                setEditedUser(response.data);
                messageToast.success("Cập nhật thông tin thành công");
            }
        } catch (error: any) {
            setEditedUser(user);
            messageToast.error(error.response?.data);
        } finally {
            setLoading(false);
            setIsEditing(false);

        }
    };

    const handleCancel = () => {
        setEditedUser(user);
        setIsEditing(false);
    };

    useEffect(() => {
        fetchUserInformation();
    }, []);

    useEffect(() => {
        if (isSelectingRef.current) {
            isSelectingRef.current = false;
            return;
        }
        const handler = setTimeout(() => {
            if (editedUser.address.length > 1) fetchAddressSuggestions(editedUser.address);
            else setAddressSuggestions([]);
        }, 500);
        return () => clearTimeout(handler);
    }, [editedUser.address]);

    return (
        <div className="bg-white lg:shadow-lg rounded-2xl lg:p-8 p-4">
            <h1 className="text-xl lg:text-2xl font-semibold mb-4 lg:mb-6 text-gray-800">
                Thông tin tài khoản
            </h1>
            {loading ? <LoadingSpinner size={50} /> : (
                !isEditing ? (
                    <>
                        <div className="space-y-3 lg:space-y-4">
                            <div className="flex flex-col sm:flex-row sm:justify-between border-b pb-3 gap-1 sm:gap-0">
                                <span className="font-medium text-gray-700">Họ và tên:</span>
                                <span className="text-gray-900 sm:text-right">{user.fullName}</span>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:justify-between border-b pb-3 gap-1 sm:gap-0">
                                <span className="font-medium text-gray-700">Email:</span>
                                <span className="text-gray-900 sm:text-right break-all">{user.email}</span>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:justify-between border-b pb-3 gap-1 sm:gap-0">
                                <span className="font-medium text-gray-700">Số điện thoại:</span>
                                <span className="text-gray-900 sm:text-right">{user.phoneNumber}</span>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:justify-between border-b pb-3 gap-1 sm:gap-0">
                                <span className="font-medium text-gray-700">Địa chỉ:</span>
                                <span className="text-gray-900 sm:text-right">{user.address}</span>
                            </div>
                        </div>

                        <div className="mt-6 text-right">
                            <Button
                                type="primary"
                                onClick={() => setIsEditing(true)}
                                className="w-full sm:w-auto"
                            >
                                Chỉnh sửa
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="space-y-4">
                            <div>
                                <label className="block font-medium text-gray-700 mb-1">
                                    Họ và tên
                                </label>
                                <Input
                                    value={editedUser.fullName}
                                    onChange={(e) => handleChange("fullName", e.target.value)}
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label className="block font-medium text-gray-700 mb-1">
                                    Số điện thoại
                                </label>
                                <Input
                                    value={editedUser.phoneNumber}
                                    onChange={(e) => handleChange("phoneNumber", e.target.value)}
                                    className="w-full"
                                />
                            </div>

                            <div className="relative">
                                <label className="block font-medium text-gray-700 mb-1">
                                    Địa chỉ
                                </label>
                                <div className="relative">
                                    <Input
                                        value={editedUser.address}
                                        onChange={(e) => handleChange("address", e.target.value)}
                                        className="!rounded-xl !py-2.5 !px-4 focus:!border-blue-500 focus:!ring-blue-200 w-full"
                                        placeholder="Nhập địa chỉ của bạn..."
                                    />
                                    {isLoadingSuggestions && (
                                        <div className="absolute right-3 top-3 text-gray-400 text-sm animate-pulse">
                                            ...
                                        </div>
                                    )}
                                </div>

                                {addressSuggestions.length > 0 && (
                                    <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-xl mt-2 shadow-xl z-50 overflow-hidden max-h-64 overflow-y-auto">
                                        {addressSuggestions.map((s, idx) => (
                                            <div
                                                key={s.placeId}
                                                onClick={() => {
                                                    isSelectingRef.current = true;
                                                    setEditedUser({ ...editedUser, address: s.description });
                                                    setAddressSuggestions([]);
                                                }}
                                                className="flex items-start gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-all border-b border-gray-100 last:border-0"
                                            >
                                                <MapPin className="w-4 h-4 text-red-500 mt-1 shrink-0" />
                                                <span className="text-gray-700 text-sm leading-snug">
                                                    {s.description}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                        </div>

                        <div className="mt-6 flex flex-col-reverse sm:flex-row justify-end gap-3">
                            <Button
                                onClick={handleCancel}
                                className="w-full sm:w-auto"
                            >
                                Hủy
                            </Button>
                            <Button
                                type="primary"
                                onClick={handleSave}
                                className="w-full sm:w-auto"
                            >
                                Lưu thay đổi
                            </Button>
                        </div>
                    </>
                ))}
        </div>
    );
}