"use client";
import NiceModal from "@ebay/nice-modal-react";
import { PropsWithChildren } from "react";

const NiceModalProvider = ({ children }: PropsWithChildren) => {
  return <NiceModal.Provider>{children}</NiceModal.Provider>;
};

export default NiceModalProvider;
