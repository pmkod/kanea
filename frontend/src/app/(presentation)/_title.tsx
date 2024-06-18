import React, { PropsWithChildren } from "react";

const Title = ({ children }: PropsWithChildren) => {
  return <div className="text-2xl font-bold mb-2">{children}</div>;
};

export default Title;
