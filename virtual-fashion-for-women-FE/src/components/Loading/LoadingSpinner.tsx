export default function LoadingSpinner({ size = 40 }: { size?: number }) {
    return (
        <div className="flex justify-center items-center w-full h-full">
            <div
                className="animate-spin rounded-full border-4 border-gray-300 border-t-black"
                style={{ width: size, height: size }}
            ></div>
        </div>
    );
}
