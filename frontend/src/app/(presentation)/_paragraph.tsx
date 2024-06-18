import React, { PropsWithChildren } from "react";

const Paragraph = ({ children }: PropsWithChildren) => {
  return <p className="mt-4">{children}</p>;
};

export default Paragraph;
