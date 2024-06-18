import React, { PropsWithChildren } from "react";

const Group = ({ children }: PropsWithChildren) => {
  return <div className="mb-16">{children}</div>;
};

export default Group;
