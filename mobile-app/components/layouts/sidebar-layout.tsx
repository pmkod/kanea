import React, { PropsWithChildren } from "react";
import { View } from "react-native";

const SidebarLayout = ({ children }: PropsWithChildren) => {
  return <View>{children}</View>;
};

export default SidebarLayout;
