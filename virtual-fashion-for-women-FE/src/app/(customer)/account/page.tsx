export default function AccountPage() {
    return (
        <div>
            <h1 className="text-2xl font-semibold mb-4 text-gray-800">
                Thông tin tài khoản
            </h1>

            <p className="text-gray-600 mb-6">
                Hiển thị thông tin người dùng tại đây.
            </p>

            <div className="space-y-4">
                <div className="flex justify-between border-b pb-3">
                    <span className="font-medium text-gray-700">Họ và tên:</span>
                    <span className="text-gray-900">Nguyễn Văn A</span>
                </div>

                <div className="flex justify-between border-b pb-3">
                    <span className="font-medium text-gray-700">Email:</span>
                    <span className="text-gray-900">example@gmail.com</span>
                </div>

                <div className="flex justify-between border-b pb-3">
                    <span className="font-medium text-gray-700">Số điện thoại:</span>
                    <span className="text-gray-900">0123 456 789</span>
                </div>

                <div className="flex justify-between border-b pb-3">
                    <span className="font-medium text-gray-700">Địa chỉ:</span>
                    <span className="text-gray-900">TP. Hồ Chí Minh</span>
                </div>
            </div>
        </div>
    );
}
