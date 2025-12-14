import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Package, Eye, Calendar, RefreshCw } from 'lucide-react';
import {api} from '@/api/instance';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

// Định nghĩa các loại dữ liệu từ API dựa trên cấu trúc backend
interface RevenueResult {
    label: string; // "2025-01" hoặc "01/01/2025"
    totalRevenue: number;
}

interface CategorySalesPieDto {
    categoryName: string;
    totalSold: number;
    percentage: number;
}

interface TopTryOnProductDto {
    productId: string;
    productName: string;
    mainImageUrl: string;
    totalTryOn: number;
}

interface TryOnChartPointDto {
    time: string;
    count: number;
}

const ProductsTab = () => {
    // --- Trạng thái cho Doanh Thu (Revenue) ---
    const [timeFilter, setTimeFilter] = useState('Year');
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1); // 1-12
    const [startDateRange, setStartDateRange] = useState<Date | null>(null);
    const [endDateRange, setEndDateRange] = useState<Date | null>(null);
    const [revenueData, setRevenueData] = useState<RevenueResult[]>([]);
    const [isRevenueLoading, setIsRevenueLoading] = useState(false);

    // --- Trạng thái cho Tỉ Lệ Danh Mục (Category Sales) ---
    const [categoryFilter, setCategoryFilter] = useState('Year');
    const [categoryData, setCategoryData] = useState<CategorySalesPieDto[]>([]);
    const [isCategoryLoading, setIsCategoryLoading] = useState(false);

    // --- Trạng thái cho Lượt Try-On (Try-On) ---
    //const [tryOnDays, setTryOnDays] = useState(7);
    const [tryOnFilter, setTryOnFilter] = useState('7Days'); // 'Day', '7Days', 'Range'
    const [tryOnStartDate, setTryOnStartDate] = useState<Date | null>(null);
    const [tryOnEndDate, setTryOnEndDate] = useState<Date | null>(null);

    const [topTryOnProducts, setTopTryOnProducts] = useState<TopTryOnProductDto[]>([]);
    const [isTopTryOnLoading, setIsTopTryOnLoading] = useState(false);
    // selectedProduct lưu trữ toàn bộ object để dễ dàng hiển thị tên sản phẩm
    const [selectedProduct, setSelectedProduct] = useState<TopTryOnProductDto | null>(null);
    const [tryOnTimeline, setTryOnTimeline] = useState<TryOnChartPointDto[]>([]);
    const [isTimelineLoading, setIsTimelineLoading] = useState(false);

    const [tryOnError, setTryOnError] = useState("");
    const [timeRangeError, setTimeRangeError] = useState("");


    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];  

    const formatDateLocal = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    // Thêm hàm này vào component ProductsTab
    const formatDateWithTime = (date: Date, type: 'start' | 'end') => {
        // Luôn bắt đầu từ đối tượng Date của ngày được chọn
        const d = new Date(date); 

        if (type === 'start') {
            // Thiết lập 00:00:00.000 (Đầu ngày)
            d.setHours(0, 0, 0, 0); 
        } else { // type === 'end'
            // Thiết lập 23:59:59.999 (Cuối ngày)
            d.setHours(23, 59, 59, 999); 
        }
        
        // Sử dụng hàm formatDateLocal đã có để định dạng chuỗi
        return formatDateLocal(d); 
    };

    const getTryOnDateRange = () => {
        const end = new Date();
        let start = new Date();
        
        if (tryOnFilter === 'Day') {
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
        } else if (tryOnFilter === '7Days') {
            start.setDate(end.getDate() - 7);
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
        } else if (tryOnFilter === '14Days') {
            start.setDate(end.getDate() - 14);
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
        } else if (tryOnFilter === 'Range') {
            // Nếu chưa chọn ngày, fallback về 7 ngày
            if (tryOnStartDate && tryOnEndDate) {
                return {
                    //start: tryOnStartDate, end: tryOnEndDate 
                    start: new Date(tryOnStartDate.setHours(0, 0, 0, 0)), 
                    end: new Date(tryOnEndDate.setHours(23, 59, 59, 999))
                };
            } else {
                start.setDate(end.getDate() - 7);
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);
            }
        } else {
            // Default
            start.setDate(end.getDate() - 7);
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
        }
        
        return { start, end };
    };

    // 1. Lấy Doanh Thu
    const fetchRevenue = useCallback(async () => {
        setIsRevenueLoading(true);
        let params: any = {};
        if (timeFilter === 'Year' && year) {
            params = { year: year };
        } else if (timeFilter === 'Month' && year && month) {
            params = { year: year, month: month };
        } else if (timeFilter === 'Range' && startDateRange && endDateRange) {
            params = { 
                // startDate: formatDateLocal(startDateRange), 
                // endDate: formatDateLocal(endDateRange) 
                startDate: formatDateWithTime(startDateRange, 'start'), 
                endDate: formatDateWithTime(endDateRange, 'end')
            };
        } else {
            // Mặc định cho năm hiện tại
            params = { year: new Date().getFullYear() };
        }

        try {
            const response = await api.get('/dashboard/revenue', { params });
            //const response = await api.get('/dashboard/revenue-v2', { params });

            const data: RevenueResult[] = response.data.map((item: any) => ({
                label: item.label,
                totalRevenue: item.totalRevenue // Đã đổi sang camelCase
            }));

            setRevenueData(data);
        } catch (error) {
            console.error('Error fetching revenue:', error);
            setRevenueData([]);
        } finally {
            setIsRevenueLoading(false);
        }
    }, [timeFilter, year, month, startDateRange, endDateRange]);

    // 2. Lấy Tỉ Lệ Danh Mục
    const fetchCategorySales = useCallback(async () => {
        setIsCategoryLoading(true);
        try {
            const response = await api.get('/dashboard/category-pie', { 
                params: { timeFilterType: categoryFilter } 
            });
            setCategoryData(response.data);
        } catch (error) {
            console.error('Error fetching category sales:', error);
            setCategoryData([]);
        } finally {
            setIsCategoryLoading(false);
        }
    }, [categoryFilter]);

    // 3. Lấy Top Sản Phẩm Try-On
    const fetchTopTryOnProducts = useCallback(async () => {
        setIsTopTryOnLoading(true);
        try {
            const { start, end } = getTryOnDateRange();

            const response = await api.get('/dashboard/top-try-on-product', {
                params: {
                    start: formatDateLocal(start),
                    end: formatDateLocal(end),
                    limit: 5,
                },
            });
            const data: TopTryOnProductDto[] = response.data;
            setTopTryOnProducts(data);
            
            // Thiết lập sản phẩm được chọn mặc định là sản phẩm đầu tiên
            if (data.length > 0) {
                // Nếu sản phẩm đang chọn không còn trong top nữa, hoặc chưa chọn, thì chọn sản phẩm đầu tiên
                if (!selectedProduct || !data.some(p => p.productId === selectedProduct.productId)) {
                    setSelectedProduct(data[0]);
                }
            } else {
                setSelectedProduct(null);
            }
        } catch (error) {
            console.error('Error fetching top try-on products:', error);
            setTopTryOnProducts([]);
            setSelectedProduct(null);
        } finally {
            setIsTopTryOnLoading(false);
        }
    }, [tryOnFilter, tryOnStartDate, tryOnEndDate, selectedProduct]);

    // 4. Lấy Timeline Try-On
    const fetchTryOnTimeline = useCallback(async () => {
        if (!selectedProduct) {
            setTryOnTimeline([]);
            return;
        }

        setIsTimelineLoading(true);
        try {
            const { start, end } = getTryOnDateRange();
            
            const response = await api.get('/dashboard/get-try-on-timeline', {
                params: {
                    productId: selectedProduct.productId,
                    start: formatDateLocal(start),
                    end: formatDateLocal(end),
                },
            });
            setTryOnTimeline(response.data);
        } catch (error) {
            console.error('Error fetching try-on timeline:', error);
            setTryOnTimeline([]);
        } finally {
            setIsTimelineLoading(false);
        }
    }, [selectedProduct, tryOnFilter, tryOnStartDate, tryOnEndDate]);
    
    useEffect(() => {
        fetchRevenue();
    }, [fetchRevenue]);

    useEffect(() => {
        fetchCategorySales();
    }, [fetchCategorySales]);

    useEffect(() => {
        fetchTopTryOnProducts();
    }, [fetchTopTryOnProducts]);
    
    useEffect(() => {
        fetchTryOnTimeline();
    }, [fetchTryOnTimeline, selectedProduct]);

    const handleSelectProduct = (product: TopTryOnProductDto) => {
        setSelectedProduct(product);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const formatDateLabel = (label: string) => {
        // Format cho Revenue (Label: "YYYY-MM" hoặc "dd/MM/yyyy")
        if (label.includes('-')) {
            const [y, m] = label.split('-');
            return `${parseInt(m)}/${y}`;
        }
        return label; // Giữ nguyên "dd/MM/yyyy"
    };

    const formatDateTimeline = (dateStr: string) => {
        if (!tryOnTimeline || tryOnTimeline.length === 0) return dateStr;

        const date = new Date(dateStr);
        const firstTime = new Date(tryOnTimeline[0].time).getTime();
        const lastTime = new Date(tryOnTimeline[tryOnTimeline.length - 1].time).getTime();
        const totalHours = (lastTime - firstTime) / (1000 * 60 * 60);

        // Nếu KHÔNG phải chế độ Day,
        // nhưng RANGE nhỏ hơn hoặc bằng 24h → vẫn hiển thị giờ
        if (tryOnFilter !== 'Day') {
            if (totalHours <= 24.5) {
                return (
                    date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) +
                    ' - ' +
                    date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
                );
            }
            return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
        }

        // Nếu là Day → tiếp tục logic cũ
        if (totalHours <= 24.5) {
            return (
                date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) +
                ' - ' +
                date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
            );
        }

        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    };

    const getNowUTC7 = () =>
        new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));

    return (
        <div className="w-full bg-gray-50 p-4 overflow-auto">
            <div className="mx-auto">
                {/* Header */}
                <div className="mb-4">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Package className="w-7 h-7" />
                        Sản Phẩm
                    </h1>
                </div>

                {/* Main Grid Layout */}
                <div className="grid grid-cols-12 gap-4">
                
                    {/* Revenue Chart - 7 cols */}
                    <div className="col-span-12 lg:col-span-8 bg-white rounded-lg shadow p-4">
                        <div className="flex flex-wrap justify-between items-center mb-3 gap-2">
                            <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-blue-500" />
                                Doanh Thu Thuần Theo Thời Gian
                            </h2>
                            <div className="flex gap-2 items-center">
                                <select 
                                    className="text-sm border rounded px-2 py-1 cursor-pointer"
                                    value={timeFilter}
                                    onChange={(e) => setTimeFilter(e.target.value)}
                                >
                                    <option value="Year">Theo Năm</option>
                                    <option value="Month">Theo Tháng</option>
                                    <option value="Range">Khoảng Ngày</option>
                                </select>
                                {timeFilter === 'Year' && (
                                    <input 
                                        type="number" 
                                        value={year}
                                        onChange={(e) => setYear(parseInt(e.target.value))}
                                        className="text-sm border rounded px-2 py-1 w-20"
                                    />
                                )}
                                {timeFilter === 'Month' && (
                                <>
                                    <input 
                                        type="number" 
                                        value={year}
                                        onChange={(e) => setYear(parseInt(e.target.value))}
                                        className="text-sm border rounded px-2 py-1 w-20"
                                    />
                                    <input 
                                        type="number" 
                                        value={month || ''}
                                        onChange={(e) => setMonth(parseInt(e.target.value))}
                                        className="text-sm border rounded px-2 py-1 w-20"
                                        min="1" max="12"
                                    />
                                </>
                                )}
                                {timeFilter === 'Range' && (
                                <>
                                    <DatePicker 
                                        selected={startDateRange}
                                        onChange={(date) => {
                                            if (!date) return;

                                            // Lấy giờ hiện tại theo UTC+7
                                            const nowUTC7 = getNowUTC7();
                                            setTimeRangeError("");

                                            if (date > nowUTC7) {
                                                setTimeRangeError("Không được chọn ngày trong tương lai.");
                                                return;
                                            }

                                            if (endDateRange && date > endDateRange) {
                                                setTimeRangeError("Ngày bắt đầu không được sau ngày kết thúc.");
                                                return;
                                            }

                                            setStartDateRange(date);
                                            //setStartDateRange
                                        }}
                                        dateFormat="dd/MM/yyyy"
                                        placeholderText="Ngày bắt đầu"
                                        className="text-sm border rounded px-2 py-1 w-28 text-center"
                                    />
                                    <span className="text-sm">-</span>
                                    <DatePicker 
                                        selected={endDateRange} 
                                        onChange={(date) => {
                                            if (!date) return;

                                            const nowUTC7 = getNowUTC7();
                                            setTimeRangeError("");

                                            if (date > nowUTC7) {
                                                setTimeRangeError("Không được chọn ngày trong tương lai.");
                                                return;
                                            }

                                            if (startDateRange && date < startDateRange) {
                                                setTimeRangeError("Ngày kết thúc không được trước ngày bắt đầu!");
                                                return;
                                            }

                                            setEndDateRange(date);
                                            //setEndDateRange
                                        }}
                                        dateFormat="dd/MM/yyyy"
                                        placeholderText="Ngày kết thúc"
                                        className="text-sm border rounded px-2 py-1 w-28 text-center"
                                    />
                                </>
                                )}
                            </div>
                        </div>
                        {timeRangeError && (<p className="text-red-500 text-xs mt-1">{timeRangeError}</p>)}
                        <ResponsiveContainer width="100%" height={240}>
                            {isRevenueLoading ? (
                                <div className="h-full flex items-center justify-center text-gray-400">
                                    <RefreshCw className="w-8 h-8 animate-spin" />
                                </div>
                            ) : (
                                <LineChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="label" tick={{fontSize: 11}} tickFormatter={formatDateLabel} />
                                <YAxis tick={{fontSize: 11}} tickFormatter={(value: number) => `${value/1000000} Triệu`} />
                                <Tooltip 
                                    formatter={(value: number) => formatCurrency(value)}
                                    labelFormatter={formatDateLabel}
                                />
                                <Line type="monotone" name='Doanh thu thuần' dataKey="totalRevenue" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                                </LineChart>
                            )}
                        </ResponsiveContainer>
                    </div>

                    {/* Category Pie Chart - 5 cols */}
                    <div className="col-span-12 lg:col-span-4 bg-white rounded-lg shadow p-4">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-lg font-semibold text-gray-700">Tỉ Lệ Danh Mục</h2>
                            <select 
                                className="text-sm border rounded px-2 py-1"
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                            >
                                <option value="Year">Năm Nay</option>
                                <option value="Month">Tháng Này</option>
                                <option value="Day">Hôm Nay</option>
                            </select>
                        </div>
                        <ResponsiveContainer width="100%" height={220}>
                        {isCategoryLoading ? (
                            <div className="h-full flex items-center justify-center text-gray-400">
                                <RefreshCw className="w-8 h-8 animate-spin" />
                            </div>
                        ) : (
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    // Fix lỗi Type: Truy cập Percentage qua payload
                                    label={(props: any) => {
                                        const payload = props.payload as CategorySalesPieDto;
                                        return `${Math.round(payload.percentage)}%`;
                                    }}
                                    outerRadius={70}
                                    fill="#8884d8"
                                    dataKey="totalSold"
                                >
                                    {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number, name: string, props: any) => [`${value} sản phẩm`, props.payload.CategoryName]} />
                            </PieChart>
                        )}
                        </ResponsiveContainer>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            {categoryData.map((cat, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-xs">
                                <div className="w-3 h-3 rounded" style={{backgroundColor: COLORS[idx % COLORS.length]}}></div>
                                <span className="truncate">{cat.categoryName} ({cat.totalSold})</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Try-On Products Table - 5 cols */}
                    <div className="col-span-12 lg:col-span-6 bg-white rounded-lg shadow p-4">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                                <Eye className="w-5 h-5 text-green-500" />
                                Top Sản Phẩm Try-On
                            </h2>
                            <div className="flex items-center gap-2 mb-3">
                                <select 
                                    className="text-sm border rounded px-2 py-1 cursor-pointer"
                                    value={tryOnFilter}
                                    onChange={(e) => setTryOnFilter(e.target.value)}
                                >
                                    <option value="Day">Hôm Nay</option>
                                    <option value="7Days">7 Ngày Gần Nhất</option>
                                    <option value="14Days">14 Ngày Gần Nhất</option>
                                    <option value="Range">Khoảng Ngày</option>
                                </select>

                                {tryOnFilter === 'Range' && (
                                    <div className="flex items-center gap-1">
                                    <DatePicker 
                                        selected={tryOnStartDate} 
                                        onChange={(date) => {
                                            if (!date) return;

                                            const nowUTC7 = getNowUTC7();

                                            // Reset lỗi trước
                                            setTryOnError("");

                                            if (date > nowUTC7) {
                                                setTryOnError("Không được chọn ngày trong tương lai.");
                                                return;
                                            }

                                            if (tryOnEndDate && date > tryOnEndDate) {
                                                setTryOnError("Ngày bắt đầu không được sau ngày kết thúc.");
                                                return;
                                            }

                                            setTryOnStartDate(date);
                                            //setTryOnStartDate
                                        }} 
                                        dateFormat="dd/MM/yyyy"
                                        placeholderText="Ngày bắt đầu"
                                        className="text-sm border rounded px-2 py-1 w-28 text-center"
                                    />
                                    <span className="text-sm">_</span>
                                    <DatePicker 
                                        selected={tryOnEndDate} 
                                        onChange={(date) => {
                                            if (!date) return;

                                            const nowUTC7 = getNowUTC7();

                                            setTryOnError("");

                                            if (date > nowUTC7) {
                                                setTryOnError("Không được chọn ngày trong tương lai.");
                                                return;
                                            }

                                            if (tryOnStartDate && date < tryOnStartDate) {
                                                setTryOnError("Ngày kết thúc không được trước ngày bắt đầu.");
                                                return;
                                            }

                                            setTryOnEndDate(date);
                                            //setTryOnEndDate
                                        } }
                                        dateFormat="dd/MM/yyyy"
                                        placeholderText="Ngày kết thúc"
                                        className="text-sm border rounded px-2 py-1 w-28 text-center"
                                    />
                                    </div>
                                )}
                            </div>
                        </div>
                        {tryOnError && ( <p className="text-red-500 text-xs mt-1">{tryOnError}</p>)}

                        <div className="space-y-2 h-[280px] overflow-y-auto">
                            {isTopTryOnLoading ? (
                                <div className="h-full flex items-center justify-center text-gray-400">
                                    <RefreshCw className="w-8 h-8 animate-spin" />
                                </div>
                            ) : topTryOnProducts.length > 0 ? (
                                topTryOnProducts.map((product, idx) => (
                                <div 
                                    key={product.productId}
                                    onClick={() => handleSelectProduct(product)}
                                    className={`flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer transition max-h-[280px] ${
                                        selectedProduct?.productId === product.productId ? 'bg-blue-50 border-2 border-blue-300' : 'border border-gray-200'
                                    }`}
                                >
                                    <div
                                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                                        idx === 0
                                            ? 'bg-yellow-100 text-yellow-700'
                                            : idx === 1
                                            ? 'bg-gray-100 text-gray-700'
                                            : idx === 2
                                            ? 'bg-orange-100 text-orange-700'
                                            : 'bg-blue-50 text-blue-700'
                                        }`}
                                    >
                                        {idx + 1}
                                    </div>
                                    <img src={product.mainImageUrl || 'https://via.placeholder.com/60'} alt={product.productName} className="w-12 h-12 object-cover rounded" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-800 truncate">{product.productName}</p>
                                        <p className="text-xs text-gray-500">{product.productId}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-blue-600">{product.totalTryOn}</p>
                                        <p className="text-xs text-gray-500">lượt</p>
                                    </div>
                                </div>
                                ))
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-400">Không có dữ liệu Try-On trong {tryOnFilter} ngày gần nhất.</div>
                            )}
                        </div>
                    </div>

                    {/* Try-On Timeline Chart - 7 cols */}
                    <div className="col-span-12 lg:col-span-6 bg-white rounded-lg shadow p-4">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-purple-500" />
                                Lượt Try-On Theo Thời Gian
                            </h2>
                            <span className="text-sm text-gray-500">
                                {selectedProduct ? `Sản phẩm: ${selectedProduct.productName}` : 'Chọn sản phẩm bên trái'}
                            </span>
                        </div>
                        {selectedProduct ? (
                            <ResponsiveContainer width="100%" height={290}>
                                {isTimelineLoading ? (
                                <div className="h-full flex items-center justify-center text-gray-400">
                                    <RefreshCw className="w-8 h-8 animate-spin" />
                                </div>
                                ) : (
                                <LineChart data={tryOnTimeline}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="time" tick={{fontSize: 10}} tickFormatter={formatDateTimeline} />
                                    <YAxis domain={[0, 'dataMax + 1']} tickCount={5} allowDecimals={false} tick={{fontSize: 11}} />
                                    <Tooltip labelFormatter={formatDateTimeline} />
                                    <Line type="monotone" dataKey="count" name="Lượt Try-On" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                                </LineChart>
                                )}
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[220px] flex items-center justify-center text-gray-400">
                                <div className="text-center">
                                    <Eye className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                    <p>Nhấn vào sản phẩm bên trái để xem biểu đồ</p>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProductsTab;