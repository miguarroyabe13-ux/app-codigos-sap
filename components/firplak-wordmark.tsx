import React from "react";

interface FirplakWordmarkProps {
    className?: string;
    aWidth?: string;
    aHeight?: string;
}

export const FirplakWordmark: React.FC<FirplakWordmarkProps> = ({
    className = "text-inherit",
    aWidth = "w-[0.85em]",
    aHeight = "h-[0.85em]"
}) => {
    return (
        <span className={`${className} inline-flex items-baseline justify-center gap-0 font-brand font-bold uppercase leading-none`}>
            <span>FIRPL</span>
            <span className="inline-flex items-baseline justify-center w-[0.85em] ml-[0.06em] mr-[0.02em]">
                <svg viewBox="0 0 100 100" className="w-full h-[0.8em] select-none pointer-events-none" fill="currentColor">
                    {/* Slightly Thinner Hollow Chevron 'A' - Matching font-bold weight */}
                    <path d="M50 0 L5 100 L30 100 L50 42 L70 100 L95 100 Z" />
                    {/* Small inner triangle at bottom center */}
                    <path d="M42 100 L58 100 L50 82 Z" />
                </svg>
            </span>
            <span>K</span>
        </span>
    );
};
