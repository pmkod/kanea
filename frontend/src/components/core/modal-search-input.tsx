import { forwardRef } from "react";
import { PiMagnifyingGlass } from "react-icons/pi";
import { InputProps } from "./input";

export const ModalSearchInput = forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type, size, onChange, placeholder = "Search", ...props },
    ref
  ) => {
    return (
      <div className="w-full border-b border-gray-300 pl-8 flex items-center pt-1 pb-2.5">
        <div className="mr-5 text-gray-400">
          <PiMagnifyingGlass />
        </div>
        <input
          type="text"
          autoFocus
          onChange={onChange}
          placeholder={placeholder}
          autoComplete="off"
          className="flex-1 outline-none bg-transparent"
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
