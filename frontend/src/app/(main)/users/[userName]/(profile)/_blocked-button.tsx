"use client";
import { Button } from "@/components/core/button";
import { useHover } from "@mantine/hooks";

export const BlockedButton = ({
  unblockUser,
  isLoading,
}: {
  unblockUser: Function;
  isLoading?: boolean;
}) => {
  const { hovered, ref } = useHover<HTMLButtonElement>();
  return (
    <Button
      ref={ref as any}
      variant={hovered ? "outline" : "default"}
      isLoading={isLoading}
      onClick={() => unblockUser()}
    >
      {hovered ? "Unblock" : "Blocked"}
    </Button>
  );
};
