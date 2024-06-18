"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "@mantine/hooks";

const SettingsPage = () => {
  const router = useRouter();
  const matches = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    if (matches) {
      router.push("/settings/account");
    }
    return () => {};
  }, [matches]);

  return null;
};

export default SettingsPage;
