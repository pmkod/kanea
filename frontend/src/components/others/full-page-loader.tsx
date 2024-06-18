import React from "react";
import Logo from "../core/logo";

const FullPageLoader = () => {
  return (
    <div className="fixed inset-0 bg-white flex justify-center items-center pb-20 z-[1000]">
      <Logo />
    </div>
  );
};

export default FullPageLoader;
