import { PropsWithChildren } from "react";

const ExploreImagesGaleryWrapper = ({ children }: PropsWithChildren) => {
  return (
    <div className="grid gap-0.5 md:pr-2 lg:pr-4 sm:gap-2 grid-cols-3 lg:grid-cols-4">
      {children}
    </div>
  );
};

export default ExploreImagesGaleryWrapper;
