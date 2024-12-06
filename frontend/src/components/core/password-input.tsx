import { forwardRef, useState } from "react";
import { Input, InputProps } from "./input";
import { LuEye, LuEyeOff } from "react-icons/lu";

export interface PasswordInputProps extends Omit<InputProps, "type"> {}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, size, ...props }, ref) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const togglePasswordVisibility = () => {
      setIsPasswordVisible((prevState) => !prevState);
    };
    return (
      <div className="relative">
        <Input
          ref={ref}
          size={size}
          className={className}
          type={isPasswordVisible ? "text" : "password"}
          {...props}
        />
        <div className="absolute h-full top-0 right-0 py-1 pr-1 flex justify-end">
          <div
            onClick={togglePasswordVisibility}
            className="h-full aspect-square flex justify-center items-center cursor-pointer hover:bg-gray-200 transition-colors rounded text-lg"
          >
            {isPasswordVisible ? <LuEyeOff /> : <LuEye />}
          </div>
        </div>
      </div>
    );
  }
);
