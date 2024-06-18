import { Button } from "@/components/core/button";

export const BlockedUserButton = ({
  unblockUser,
  isLoading,
}: {
  unblockUser: Function;
  isLoading?: boolean;
}) => {
  return (
    <Button
      variant="outline"
      text="Blocked"
      colorScheme="destructive"
      isLoading={isLoading}
      onPress={() => unblockUser()}
    />
  );
};
