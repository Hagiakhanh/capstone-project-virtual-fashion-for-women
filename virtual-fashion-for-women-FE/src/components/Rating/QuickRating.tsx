'use client';

import { Star } from 'lucide-react';
import React, { useState } from 'react';

interface QuickRatingProps {
    onRate: (rating: number) => void;
}

export default function QuickRating({ onRate }: QuickRatingProps) {
    const [hoverRating, setHoverRating] = useState(0);

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
        onRate(rating);
    };

    return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="text-sm font-medium text-gray-700 whitespace-nowrap">Đánh giá nhanh:</div>
            <div 
                className="flex items-center gap-1"
                onMouseLeave={handleMouseLeave}
            >
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={22}
                        className={`cursor-pointer transition-all ${
                            hoverRating >= star
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                        }`}
                        onMouseEnter={() => handleMouseEnter(star)}
                        onClick={() => handleClick(star)}
                    />
                ))}
            </div>
            {hoverLabel && <div className="text-sm text-gray-500 hidden sm:block">{hoverLabel}</div>}
        </div>
    );
}