'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PaginationDTO } from '@/models/PaginationDTO';
import { messageToast } from '@/helpers/toastHelper';
import { Search, Package, CheckCircle, XCircle, Filter, ListRestart } from 'lucide-react';
import LoadingSpinner from '@/components/Loading/LoadingSpinner';
import { api } from '@/api/instance';
import ProductItem from '@/components/ManageProduct/ProductItem';
import { Category } from '@/types/category';

const statusTabs = [
    { key: 'all', label: 'Tất cả', icon: null },
    { key: 'active', label: 'Đang hoạt động', icon: CheckCircle },
];

export interface Product {
    productId: string;
    productName: string;
    description: string;
    price: number;
    mainImageUrl: string;
    categoryId: number;
    isDeleted: boolean;
}

const sortOptions = [
    { key: 2, label: 'Mới nhất' },
    { key: 0, label: 'Tên: A-Z' },
    { key: 1, label: 'Tên: Z-A' },
    { key: 5, label: 'Giá: Thấp đến Cao' },
    { key: 6, label: 'Giá: Cao đến Thấp' },
];

export default function ProductListPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [submittedSearchTerm, setSubmittedSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('active');

    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>(''); // '' nghĩa là "Tất cả"
    const [sortBy, setSortBy] = useState<number>(2); // Mặc định là 'Mới nhất'

    const [pagination, setPagination] = useState<PaginationDTO>({
        CurrentPage: 1,
        HasNext: false,
        HasPrevious: false,
        PageSize: 6,
        TotalCount: 0,
        TotalPages: 0,
    });

    const fetchCategories = async () => {
        try {
            const response = await api.get('/category');
            if (response.status === 200 && response.data) {
                setCategories(response.data);
            }
        } catch (error: any) {
            console.error("Failed to fetch categories:", error);
            messageToast.error('Không thể tải danh sách danh mục.');
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const payloadPagination = {
                pageSize: pagination.PageSize,
                pageIndex: pagination.CurrentPage,
                searchTerm: submittedSearchTerm,
                status: statusFilter,
                sortBy: sortBy,
                categoryId: selectedCategory /*? parseInt(selectedCategory) : undefined*/,
            }
            const response = await api.get("/product", { params: payloadPagination });
            if (response.status === 200) {
                setProducts(response.data.data);
                setPagination((prev) => ({
                    ...prev,
                    ...response.data.pagination
                }));
            }
        } catch (error: any) {
            messageToast.error(error);
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async (productId: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;

        try {
            const response = await api.delete(`/product/${productId}`); // ✅ gọi trực tiếp backend
            if (response.status === 200) {
                messageToast.success('Xóa sản phẩm thành công!');
                fetchProducts();
            } else {
                messageToast.error(response.data.message || 'Xóa sản phẩm thất bại');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            messageToast.error('Có lỗi xảy ra khi xóa sản phẩm');
        }
    };

    const handleSearch = () => {
        setSubmittedSearchTerm(searchTerm); // <-- 1. "Chốt" tìm kiếm
        setPagination((prev) => ({ ...prev, CurrentPage: 1 })); // <-- 2. Reset trang
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.TotalPages) {
            setPagination((prev) => ({ ...prev, CurrentPage: newPage }));
        }
    };

    function getPageNumbers(totalPages: number, currentPage: number, delta = 2): (number | string)[] {
        const range: (number | string)[] = [];
        const left = Math.max(2, currentPage - delta);
        const right = Math.min(totalPages - 1, currentPage + delta);
        range.push(1);
        if (left > 2) {
            range.push("...");
        }
        for (let i = left; i <= right; i++) {
            range.push(i);
        }
        if (right < totalPages - 1) {
            range.push("...");
        }
        if (totalPages > 1) {
            range.push(totalPages);
        }
        return range;
    }

    // Cập nhật: Thêm fetchCategories khi component mount
    useEffect(() => {
        fetchCategories();
    }, []);

    // Cập nhật: Thêm selectedCategory và sortBy vào dependency array
    useEffect(() => {
        fetchProducts();
    }, [pagination.CurrentPage, pagination.PageSize, statusFilter, submittedSearchTerm, selectedCategory, sortBy]);

    const columnClasses = "px-6 py-3 text-left text-s font-semibold text-gray-600 uppercase tracking-wider";

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-screen-2xl mx-auto">
                {/* Header */}
                <h1 className="text-3xl font-semibold text-gray-800 mb-6">Quản lý sản phẩm</h1>
                <div className="flex justify-between items-center gap-4 mb-4">
                    <div className="flex items-center gap-4 flex-wrap">
                        {/* Search Bar */}
                        <div className="relative" style={{ minWidth: '300px' }}>
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm sản phẩm..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Thêm mới: Bộ lọc Danh mục */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <select
                                value={selectedCategory}
                                onChange={(e) => {
                                    setSelectedCategory(e.target.value);
                                    setPagination((prev) => ({ ...prev, CurrentPage: 1 })); // Reset trang
                                }}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none cursor-pointer"
                                style={{ minWidth: '200px' }}
                            >
                                <option value="">Tất cả danh mục</option>
                                {categories.map((cat) => (
                                    <option key={cat.categoryId} value={cat.categoryId.toString()}>
                                        {cat.categoryName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Thêm mới: Bộ lọc Sắp xếp */}
                        <div className="relative">
                            <ListRestart className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <select
                                value={sortBy}
                                onChange={(e) => {
                                    setSortBy(Number(e.target.value));
                                    setPagination((prev) => ({ ...prev, CurrentPage: 1 })); // Reset trang
                                }}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none cursor-pointer"
                                style={{ minWidth: '200px' }}
                            >
                                {sortOptions.map((opt) => (
                                    <option key={opt.key} value={opt.key}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={() => router.push('/admin/product/create')}
                        className="bg-blue-600 flex gap-2 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-colors cursor-pointer items-center"

                    >
                        <Package className="w-4 h-4" />
                        Thêm sản phẩm mới
                    </button>
                </div>

                {/* Filter Tabs */}
                {/* <div className="flex flex-wrap gap-3 mb-6">
                    {statusTabs.map((tab) => {
                        const Icon = tab.icon;
                        const active = statusFilter === tab.key;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => {
                                    setStatusFilter(tab.key);
                                    setPagination((prev) => ({ ...prev, CurrentPage: 1 }));
                                }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all cursor-pointer ${
                                    active
                                        ? 'bg-blue-600 text-white border-blue-600 shadow'
                                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                                }`}
                            >
                                {Icon && <Icon size={18} />}
                                <span className="text-sm font-medium">{tab.label}</span>
                            </button>
                        );
                    })}
                </div> */}

                {/* Products Table */}
                <div className="flex-1 mb-6">
                    {loading ? (
                        <div className="py-20">
                            <LoadingSpinner size={50} />
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className={columnClasses} style={{ width: '12%' }}>
                                            Hình Ảnh
                                        </th>
                                        <th className={columnClasses}>
                                            Tên Sản Phẩm
                                        </th>
                                        <th className={columnClasses}>
                                            Mô Tả
                                        </th>
                                        <th className={columnClasses}>
                                            Giá
                                        </th>
                                        <th className={columnClasses}>
                                            Trạng Thái
                                        </th>
                                        <th className={columnClasses}>
                                            Thao Tác
                                        </th>
                                    </tr>
                                </thead>
                                
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {products.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center">
                                                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                                <div className="text-gray-500 text-lg">Không tìm thấy sản phẩm nào</div>
                                            </td>
                                        </tr>
                                    ) : (
                                        products.map((product) => (
                                            <ProductItem
                                                key={product.productId}
                                                product={product}
                                                onDelete={handleDelete}
                                            />
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {!loading && products.length > 0 && (
                    <div className="flex justify-center items-center gap-3">
                        <button
                            disabled={pagination.CurrentPage === 1}
                            onClick={() => handlePageChange(pagination.CurrentPage - 1)}
                            className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-100 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-all"
                        >
                            « Trước
                        </button>

                        {getPageNumbers(pagination.TotalPages, pagination.CurrentPage).map((page, idx) => (
                            <button
                                key={idx}
                                onClick={() => typeof page === 'number' && handlePageChange(page)}
                                disabled={page === "..."}
                                className={`px-4 py-2 rounded-lg border transition-all cursor-pointer${
                                    pagination.CurrentPage === page
                                        ? 'bg-blue-600 text-black border-blue-600'
                                        : 'bg-white hover:bg-gray-100'
                                } ${page === "..." ? 'cursor-default opacity-70' : ''}`}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            disabled={pagination.CurrentPage === pagination.TotalPages}
                            onClick={() => handlePageChange(pagination.CurrentPage + 1)}
                            className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-100 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            Sau »
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}