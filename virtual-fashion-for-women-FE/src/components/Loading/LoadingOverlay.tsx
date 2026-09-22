'use client';

import React from 'react';
import LoadingSpinner from './LoadingSpinner';

export default function LoadingOverlay({ size }: { size?: number }) {
    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
            <LoadingSpinner size={size} />
        </div>
    );
}
