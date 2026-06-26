"use client";

import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

interface CenterFillButtonProps
    extends Omit<
        React.ComponentPropsWithoutRef<typeof motion.button>,
        "children"
    > {
    children?: React.ReactNode;
    icon?: React.ReactNode;
    showIcon?: boolean;
}

const CenterFillButton = React.forwardRef<
    HTMLButtonElement,
    CenterFillButtonProps
>(
    (
        {
            children = "About Us",
            icon = <ArrowRight size={18} />,
            showIcon = true,
            className,
            ...props
        },
        ref,
    ) => {
        return (
            <motion.button
                ref={ref}
                className={cn(
                    "relative cursor-pointer overflow-hidden rounded-full bg-blue-700 px-5 py-2 font-medium text-white shadow",
                    className,
                )}
                initial="initial"
                whileHover="hovered"
                transition={{ duration: 0.3 }}
                variants={{
                    hovered: { scale: 1.05 },
                }}
                {...props}
            >
                <motion.span
                    className="absolute inset-0 block rounded-full bg-white"
                    variants={{
                        initial: { scale: 0, opacity: 0 },
                        hovered: { scale: 1.5, opacity: 1 },
                    }}
                    transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
                />
                <div className="relative z-10 flex items-center justify-center gap-2">
                    <motion.span
                        variants={{
                            initial: { color: "#ffffff" },
                            hovered: { color: "#000000" },
                        }}
                        transition={{ duration: 0.2 }}
                    >
                        {children}
                    </motion.span>
                    {showIcon && (
                        <motion.span
                            variants={{
                                initial: { x: 0, color: "#ffffff" },
                                hovered: { x: 5, color: "#000000" },
                            }}
                            transition={{ duration: 0.3 }}
                        >
                            {icon}
                        </motion.span>
                    )}
                </div>
            </motion.button>
        );
    },
);

CenterFillButton.displayName = "CenterFillButton";

export { CenterFillButton };
