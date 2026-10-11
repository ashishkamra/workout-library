import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-[transform,opacity,background-color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98] select-none",
  {
    variants: {
      variant: {
        default: "bg-accent text-accent-fg",
        secondary:
          "bg-raised text-fg shadow-[var(--shadow-border)]",
        ghost: "bg-transparent text-fg hover:bg-raised",
        outline: "bg-transparent text-fg shadow-[var(--shadow-border)]",
        danger: "bg-danger text-fg",
      },
      size: {
        default: "h-12 px-5 rounded-md text-sm",
        lg: "h-14 px-6 rounded-lg text-base",
        xl: "h-16 px-6 rounded-xl text-base tracking-wide",
        sm: "h-10 px-3 rounded-sm text-sm",
        icon: "size-12 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
