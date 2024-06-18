"use client";
import { Slot, SlotProps } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import React, {
  createElement,
  PropsWithChildren,
  ReactElement,
  ReactNode,
} from "react";

import { cn } from "@/lib/utils";
import ThreeDotLoader from "./three-dot-loader";

const buttonVariants = cva(
  "inline-flex items-center cursor-pointer justify-center font-semibold rounded whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-white shadow hover:bg-gray-800 fill-white",
        destructive: "bg-destructive text-white shadow-sm hover:bg-red-600",
        outline:
          "border border-gray-300 text-gray-800 bg-transparent shadow-sm hover:bg-gray-100 fill-gray-800",
        ghost: "hover:bg-gray-200 text-gray-800 fill-gray-800",
        link: "text-gray-800 underline-offset-4 hover:underline fill-gray-800",
      },
      size: {
        xs: "h-6 px-2 text-xs",
        sm: "h-[30px] px-3 text-xs",
        default: "h-9 px-5 text-sm",
        lg: "h-10 px-6 text-base",
        xl: "h-11 px-8 text-lg",
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
    Omit<VariantProps<typeof buttonVariants>, "disabled"> {
  asChild?: boolean;
  fullWidth?: boolean;
  loader?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
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
    const Comp:
      | React.ForwardRefExoticComponent<
          SlotProps & React.RefAttributes<HTMLElement>
        >
      | any = asChild ? Slot : "button";
    // const threeDotLoader = )
    if (isLoading) {
      props.children = <ThreeDotLoader className="fill-inherit" />;
    }

    props.disabled = isLoading || props.disabled;
    return (
      <Comp
        className={cn(
          buttonVariants({
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
Button.displayName = "Button";

export { Button, buttonVariants };
