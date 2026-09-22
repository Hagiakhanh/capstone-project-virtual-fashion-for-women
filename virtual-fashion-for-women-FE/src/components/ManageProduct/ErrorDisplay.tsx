import { AlertCircle } from "lucide-react";

interface ErrorDisplayProps {
    errors: string[];
}

export default function ErrorDisplay({ errors }: ErrorDisplayProps) {
    if (errors.length === 0) return null;

    return (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
                <AlertCircle className="text-red-600 mt-0.5" size={20} />
                <div>
                    <h3 className="font-semibold text-red-800 mb-2">
                        Vui lòng sửa các lỗi sau:
                    </h3>
                    <ul className="list-disc list-inside space-y-1">
                        {errors.map((error, index) => (
                            <li key={index} className="text-sm text-red-700">
                                {error}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}