"use client";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import ThreeDotLoader from "./three-dot-loader";

const iconButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-gray-800 shadow hover:bg-gray-100",
        destructive:
          "bg-destructive text-white shadow-sm hover:bg-destructive/90",
        outline:
          "border border-gray-300 bg-transparent shadow-sm hover:bg-gray-200",
        ghost: "hover:bg-gray-100",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 w-8 text-lg",
        default: "h-9 w-9 text-xl",
        lg: "h-10 w-10 text-2xl",
        xl: "h-12 w-12 text-3xl font-semibold",
      },

      fullWidth: {
        true: "w-full",
      },
      isLoading: {
        true: "opacity-60",
        false: "",
      },
      disabled: {
        true: "opacity-60",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    Omit<VariantProps<typeof iconButtonVariants>, "disabled"> {
  asChild?: boolean;
  fullWidth?: boolean;
  loader?: React.ReactNode;
}

const IconButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,

      fullWidth = false,
      isLoading,
      loader,
      ...props
    },
    ref
  ) => {
    const Comp: any = asChild ? Slot : "button";
    if (isLoading) {
      props.children = loader || <ThreeDotLoader />;
    }
    props.disabled = isLoading || props.disabled;
    return (
      <Comp
        className={cn(
          iconButtonVariants({
            variant,
            size,
            className,
            fullWidth,
            isLoading,
          })
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
IconButton.displayName = "IconButton";

export { IconButton, iconButtonVariants };
