"use client";
import { cn } from "@/lib/utils";
import { VariantProps, cva } from "class-variance-authority";
import { forwardRef } from "react";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {}

export const inputVariants = cva(
  "flex w-full border border-gray-400 rounded bg-transparent px-3 py-2 outline-none text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus:border-gray-600  disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        xs: "h-7",
        sm: "h-8",
        md: "h-9",
        lg: "h-10",
        xl: "h-11",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, size, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ size }), className)}
        autoComplete="off"
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
