import {
    Clock,
    CheckCircle,
    Package,
    Truck,
    Home,
    XCircle,
    ClipboardCheck,
} from 'lucide-react';

const statusMap: Record<
    string,
    { label: string; color: string; bg: string; icon: any }
> = {
    Pending: {
        label: 'Chờ xác nhận',
        color: '#E67E22',
        bg: '#FEF5E7',
        icon: Clock,
    },
    Confirmed: {
        label: 'Đã xác nhận',
        color: '#2980B9',
        bg: '#EBF5FB',
        icon: ClipboardCheck,
    },
    Packed: {
        label: 'Đã đóng gói',
        color: '#8E44AD',
        bg: '#F5EEF8',
        icon: Package,
    },
    Delivering: {
        label: 'Đang giao hàng',
        color: '#F39C12',
        bg: '#FEF9E7',
        icon: Truck,
    },
    Delivered: {
        label: 'Đã giao hàng',
        color: '#27AE60',
        bg: '#E9F7EF',
        icon: Home,
    },
    Completed: {
        label: 'Hoàn tất',
        color: '#1ABC9C',
        bg: '#E8F8F5',
        icon: CheckCircle,
    },
    Failed: {
        label: 'Thất bại',
        color: '#C0392B',
        bg: '#FDEDEC',
        icon: XCircle,
    },
};
export default statusMap;