import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { MessageSquare, Sparkles, Users, Calendar, TrendingUp, RefreshCw } from 'lucide-react';
import {api} from '@/api/instance';

// Types (Giữ nguyên)
interface AiOverviewStats {
    totalConversations: number;
    totalSuggestedItems: number;
    totalUsersUsedAI: number;
}

interface ConversationChartData {
    label: string;
    count: number;
}

interface TopProduct {
    productId: string;
    productName: string;
    mainImageUrl: string;
    categoryName: string;
    suggestCount: number;
}

// Hàm khởi tạo ngày mặc định 7 ngày trước
const getDefaultDateRange = () => {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return { startDate, endDate };
};

const AIDashboard = () => {
    // Stat loading vẫn cần chạy lần đầu để lấy overview
    const [stats, setStats] = useState<AiOverviewStats | null>(null);
    const [initialLoading, setInitialLoading] = useState(true);

    // --- Bộ lọc độc lập và Loading cho Conversation Chart ---
    const [conversationDateRange, setConversationDateRange] = useState(getDefaultDateRange());
    const [chartData, setChartData] = useState<ConversationChartData[]>([]);
    const [isChartLoading, setIsChartLoading] = useState(false);

    // --- Bộ lọc độc lập và Loading cho Top Products ---
    const [topProductDateRange, setTopProductDateRange] = useState(getDefaultDateRange());
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
    // Thay đổi mặc định TopLimit thành 5 (thường dùng hơn 3)
    const [topLimit, setTopLimit] = useState(5); 
    const [isTopProductLoading, setIsTopProductLoading] = useState(false);

    // --- Logic Fetch Data ---

    const fetchOverviewStats = useCallback(async () => {
        try {
            const response = await api.get('/dashboard/ai-overview');
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching overview stats:', error);
        }
    }, []);

    const fetchConversationChart = useCallback(async () => {
        setIsChartLoading(true);
        try {
            const params = new URLSearchParams({
                startDate: conversationDateRange.startDate,
                endDate: conversationDateRange.endDate
            });
            const response = await api.get(`/dashboard/conversation-chart?${params}`);
            setChartData(response.data);
        } catch (error) {
            console.error('Error fetching chart data:', error);
            setChartData([]);
        } finally {
            setIsChartLoading(false);
        }
    }, [conversationDateRange]); // Chỉ chạy khi conversationDateRange thay đổi

    const fetchTopProducts = useCallback(async () => {
        setIsTopProductLoading(true);
        try {
            const params = new URLSearchParams({
                start: topProductDateRange.startDate,
                end: topProductDateRange.endDate,
                top: topLimit.toString()
            });
            const response = await api.get(`/dashboard/top-suggest-product?${params}`);
            setTopProducts(response.data);
        } catch (error) {
            console.error('Error fetching top products:', error);
            setTopProducts([]);
        } finally {
            setIsTopProductLoading(false);
        }
    }, [topProductDateRange, topLimit]); // Chỉ chạy khi topProductDateRange hoặc topLimit thay đổi

    // --- Effects riêng biệt ---

    // 1. Fetch Overview Stats (Chỉ chạy lần đầu)
    useEffect(() => {
        const initialFetch = async () => {
            setInitialLoading(true);
            await fetchOverviewStats();
            // Lần chạy đầu tiên, fetch luôn chart và top product với default range
            await fetchConversationChart();
            await fetchTopProducts();
            setInitialLoading(false);
        };
        initialFetch();
    }, [fetchOverviewStats]); // Đã loại bỏ dependencies fetchChart/fetchTopProduct để tránh re-render vô tận

    // 2. Fetch Chart khi Date Range thay đổi
    useEffect(() => {
        // Tránh chạy khi đang trong quá trình load ban đầu
        if (!initialLoading) { 
            fetchConversationChart();
        }
    }, [conversationDateRange]);
    
    // 3. Fetch Top Products khi Date Range hoặc Limit thay đổi
    useEffect(() => {
        // Tránh chạy khi đang trong quá trình load ban đầu
         if (!initialLoading) { 
            fetchTopProducts();
        }
    }, [topProductDateRange, topLimit]);


    // --- Helper Components & Constants (Giữ nguyên hoặc cải tiến nhẹ) ---

    const StatCard = ({ icon: Icon, title, value, color, bgColor }: any) => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-gray-900">{value?.toLocaleString() || 0}</p>
                </div>
                <div className={`${bgColor} p-4 rounded-lg`}>
                    <Icon className={`w-8 h-8 ${color}`} />
                </div>
            </div>
        </div>
    );

    const DateRangeSelector = ({ dateRange, setDateRange, label = "Khoảng thời gian" }: any) => (
        <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 hidden sm:inline">{label}:</span>
            </div>
            <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm w-34 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-gray-500 text-xs">-</span>
            <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm w-34 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
        </div>
    );

    const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

    // --- Render ---

    return (
        <div className="bg-gray-50 p-6">
            <div className="mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">AI</h1>
                    <p className="text-gray-600">Tổng quan về hệ thống AI và các cuộc trò chuyện.</p>
                </div>

                {/* Stats Cards */}
                {initialLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-xl h-32 animate-pulse shadow-sm" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <StatCard
                            icon={MessageSquare}
                            title="Tổng số cuộc hội thoại"
                            value={stats?.totalConversations}
                            color="text-blue-600"
                            bgColor="bg-blue-50"
                        />
                        <StatCard
                            icon={Sparkles}
                            title="Sản phẩm được gợi ý"
                            value={stats?.totalSuggestedItems}
                            color="text-purple-600"
                            bgColor="bg-purple-50"
                        />
                        <StatCard
                            icon={Users}
                            title="Người dùng sử dụng AI"
                            value={stats?.totalUsersUsedAI}
                            color="text-pink-600"
                            bgColor="bg-pink-50"
                        />
                    </div>
                )}

                {/* Charts and Tables - Ngang hàng */}
                <div className="grid grid-cols-12 gap-6">
                    {/* Conversation Chart - 7 cols */}
                    <div className="col-span-12 lg:col-span-7 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex flex-wrap items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-blue-600" />
                                <h2 className="text-xl font-bold text-gray-900">Tổng cuộc hội thoại</h2>
                            </div>
                            {/* Bộ lọc riêng cho Chart */}
                            <DateRangeSelector 
                                dateRange={conversationDateRange} 
                                setDateRange={setConversationDateRange} 
                                label="Thời gian"
                            />
                        </div>

                        {isChartLoading ? (
                            <div className="h-80 flex items-center justify-center text-gray-400">
                                <RefreshCw className="w-8 h-8 animate-spin" />
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={380}>
                                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 5}}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis 
                                        dataKey="label" 
                                        tick={{ fill: '#6b7280', fontSize: 12 }}
                                        textAnchor="end"
                                        height={80}
                                    />
                                    <YAxis allowDecimals={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: 'white', 
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                        }}
                                        labelStyle={{ fontWeight: 'bold', color: '#111827' }}
                                    />
                                    <Bar dataKey="count" radius={[8, 8, 0, 0]} name="Số lượng">
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {/* Top Products Table - 5 cols */}
                    <div className="col-span-12 lg:col-span-5 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex flex-wrap items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-purple-600" />
                                <h2 className="text-xl font-bold text-gray-900">Top Sản phẩm gợi ý</h2>
                            </div>
                             {/* Bộ lọc riêng cho Top Products */}
                            <div className="flex flex-wrap items-center gap-2">
                                <DateRangeSelector 
                                    dateRange={topProductDateRange} 
                                    setDateRange={setTopProductDateRange} 
                                    label="Thời gian"
                                />
                                <select
                                    value={topLimit}
                                    onChange={(e) => setTopLimit(Number(e.target.value))}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-xs w-22 focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer"
                                >
                                    <option value={3}>Top 3</option>
                                    <option value={5}>Top 5</option>
                                    <option value={7}>Top 7</option>
                                    <option value={10}>Top 10</option>
                                </select>
                            </div>
                        </div>
                        
                        {isTopProductLoading ? (
                            <div className="space-y-4 h-[360px] flex items-center justify-center">
                                <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
                            </div>
                        ) : topProducts.length === 0 ? (
                            <div className="text-center py-12 text-gray-500 h-[360px]">
                                <Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                                <p>Không có dữ liệu trong khoảng thời gian này</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto max-h-[360px] overflow-y-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200 sticky top-0 bg-white shadow-sm">
                                            <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700 w-16">#</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Sản phẩm</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 hidden sm:table-cell">Danh mục</th>
                                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Gợi ý</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {topProducts.map((product, index) => (
                                            <tr key={product.productId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                <td className="py-3 px-2">
                                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                                                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                                        index === 1 ? 'bg-gray-100 text-gray-700' :
                                                        index === 2 ? 'bg-orange-100 text-orange-700' :
                                                        'bg-blue-50 text-blue-700'
                                                    }`}>
                                                        {index + 1}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <img 
                                                            src={product.mainImageUrl || '/placeholder.png'} 
                                                            alt={product.productName}
                                                            className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"%3E%3Crect width="40" height="40" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="10"%3EN/A%3C/text%3E%3C/svg%3E';
                                                            }}
                                                        />
                                                        <div className="truncate max-w-[150px]">
                                                            <p className="font-medium text-gray-900 text-sm truncate">{product.productName}</p>
                                                            <p className="text-xs text-gray-500">{product.productId}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 hidden sm:table-cell">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                                        {product.categoryName || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <span className="font-bold text-lg text-gray-900">{product.suggestCount}</span>
                                                    <span className="text-sm text-gray-500 ml-1 hidden lg:inline">lần</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIDashboard;