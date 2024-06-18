import { PropsWithChildren } from "react";

const ImagesGaleryWrapper = ({ children }: PropsWithChildren) => {
  return (
    <div className="grid gap-0.5 sm:gap-2 grid-cols-3 xl:grid-cols-4">
      {children}
    </div>
  );
};

export default ImagesGaleryWrapper;
