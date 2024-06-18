"use client";
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "",
        soft: "",
        outline: "",
      },
      colorScheme: {
        default: "",
        success: "",
        destructive: "",
        yellow: "",
      },
    },
    compoundVariants: [
      {
        variant: "default",
        colorScheme: "default",
        className: "border-gray-900 bg-gray-900 text-white",
      },
      {
        variant: "default",
        colorScheme: "success",
        className: "border-green-500 bg-green-500 text-white",
      },
      {
        variant: "soft",
        colorScheme: "success",
        className: "border-green-100 bg-green-100 text-green-800",
      },
      {
        variant: "soft",
        colorScheme: "default",
        className: "border-gray-200 bg-gray-200 text-gray-900",
      },
      {
        variant: "soft",
        colorScheme: "destructive",
        className: "border-red-200 bg-red-200 text-red-900",
      },
      {
        variant: "soft",
        colorScheme: "yellow",
        className: "border-yellow-200 bg-yellow-200 text-yellow-900",
      },
    ],
    defaultVariants: {
      variant: "default",
      colorScheme: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, colorScheme, ...props }: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant, colorScheme }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
