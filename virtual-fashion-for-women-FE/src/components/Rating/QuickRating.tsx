'use client';

import { Star } from 'lucide-react';
import React, { useState } from 'react';

interface QuickRatingProps {
    onRate: (rating: number) => void;
}

export default function QuickRating({ onRate }: QuickRatingProps) {
    const [hoverRating, setHoverRating] = useState(0);

    const [selectedRating, setSelectedRating] = useState(0);

    const labels = ["Rất tệ", "Tệ", "Ổn", "Tốt", "Rất tốt"];
    const [hoverLabel, setHoverLabel] = useState('');

    const handleMouseEnter = (rating: number) => {
        setHoverRating(rating);
        setHoverLabel(labels[rating - 1]);
    };

    const handleMouseLeave = () => {
        setHoverRating(0);
        setHoverLabel('');
    };

    const handleClick = (rating: number) => {
        setSelectedRating(rating);
        onRate(rating);
    };

    const displayLabel = hoverLabel || (selectedRating ? labels[selectedRating - 1] : '');

    return (
        <div className="flex flex-col gap-2">
            {/* Header và Stars */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="text-sm sm:text-base font-medium text-gray-700 whitespace-nowrap">
                    Đánh giá nhanh:
                </div>
                
                <div 
                    className="flex items-center gap-1 sm:gap-1.5"
                    onMouseLeave={handleMouseLeave}
                >
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            size={window.innerWidth < 640 ? 28 : 22}
                            className={`cursor-pointer transition-all touch-manipulation ${
                                (hoverRating >= star || (hoverRating === 0 && selectedRating >= star))
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-gray-300'
                            } active:scale-125 sm:active:scale-110`}
                            onMouseEnter={() => handleMouseEnter(star)}
                            onClick={() => handleClick(star)}
                        />
                    ))}
                </div>

                {/* Label cho desktop - hiện bên cạnh stars */}
                {displayLabel && (
                    <div className="text-sm text-gray-500 hidden sm:block ml-1">
                        {displayLabel}
                    </div>
                )}
            </div>

            {/* Label cho mobile - hiện dưới stars */}
            {displayLabel && (
                <div className="text-sm text-gray-500 sm:hidden pl-0.5">
                    {displayLabel}
                </div>
            )}
        </div>
    );
}