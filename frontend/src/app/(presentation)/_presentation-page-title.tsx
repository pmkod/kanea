import React, { PropsWithChildren } from "react";

const PresentationPageTitle = ({ children }: PropsWithChildren) => {
  return (
    <div className="h-20 sm:h-32 bg-gray-50 flex justify-center items-center">
      <div className="text-3xl md:text-4xl font-bold text-center">
        {children}
      </div>
    </div>
  );
};

export default PresentationPageTitle;
