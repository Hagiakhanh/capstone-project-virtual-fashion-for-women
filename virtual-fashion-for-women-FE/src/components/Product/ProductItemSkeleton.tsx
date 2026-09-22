import React from "react";

const ProductItemSkeleton = () => {
    return (
        <div className="p-4 bg-[#f3f3f3] rounded-2xl animate-pulse">
            
            {/* Image skeleton */}
            <div className="relative aspect-[3/4] rounded-2xl bg-gray-300" />

            {/* Title */}
            <div className="mt-3 h-4 bg-gray-300 rounded w-3/4" />

            {/* Color dots */}
            <div className="flex gap-2 mt-3">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div
                        key={i}
                        className="w-5 h-5 rounded-full bg-gray-300"
                    />
                ))}
            </div>

            {/* Price */}
            <div className="mt-3 flex gap-2 items-center">
                <div className="h-4 w-20 bg-gray-300 rounded" />
                <div className="h-4 w-14 bg-gray-200 rounded" />
            </div>
        </div>
    );
};

export default ProductItemSkeleton;
