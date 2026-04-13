import { Sparkles } from "lucide-react";

interface AnimatedLogoProps {
    size?: "sm" | "md" | "lg";
    showSparkles?: boolean;
}

import { FirplakWordmark } from "./firplak-wordmark";

export function AnimatedLogo({ size = "md", showSparkles = true }: AnimatedLogoProps) {
    const sizes = {
        sm: {
            circle: "w-16 h-16",
            text: "text-[0.7rem]",
            subtext: "text-[0.45rem]",
            aWidth: "w-2",
            aHeight: "h-2.5",
        },
        md: {
            circle: "w-24 h-24",
            text: "text-[1.1rem]",
            subtext: "text-[0.6rem]",
            aWidth: "w-3",
            aHeight: "h-3.5",
        },
        lg: {
            circle: "w-32 h-32",
            text: "text-[1.5rem]",
            subtext: "text-[0.8rem]",
            aWidth: "w-4",
            aHeight: "h-4.5",
        },
    };

    const currentSize = sizes[size];

    return (
        <div className="flex justify-center items-center animate-in fade-in duration-1000">
            <div className="relative group animate-float">
                {/* Firplak Image-Style Shield */}
                <div className={`${currentSize.circle} rounded-full bg-[#083344] flex items-center justify-center shadow-lg relative overflow-hidden transition-all duration-700`}>
                    <div className="text-center z-10 px-4 flex flex-col items-center justify-center">
                        {/* Refined Proportional Wordmark */}
                        <FirplakWordmark
                            className={`${currentSize.text} text-white drop-shadow-sm`}
                        />
                        {/* Elegant Proportional Tagline - Thinner and Airier */}
                        <div className={`${currentSize.subtext} text-white/70 font-light tracking-[0.2em] leading-none uppercase mt-1.5 font-brand`}>
                            inspirando hogares
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
