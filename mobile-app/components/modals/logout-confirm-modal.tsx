import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { Button } from "../core/button";
import { useLogout } from "@/hooks/use-logout";
import {
  ConfirmModalDescription,
  ConfirmModal,
  ConfirmModalFooter,
  ConfirmModalTitle,
} from "../core/confirm-modal";

export const LogoutConfirmModal = NiceModal.create(() => {
  const modal = useModal();
  const { isLoading, logout } = useLogout();

  // const hideModal = () => modal.hide();

  const handleLogout = async () => {
    // modal.keepMounted = true
    await logout();
    modal.hide();
  };

  return (
    <ConfirmModal visible={modal.visible} hide={modal.hide}>
      <ConfirmModalTitle>Log out of your account</ConfirmModalTitle>

      <ConfirmModalDescription>Are you sure?</ConfirmModalDescription>

      <ConfirmModalFooter>
        <Button
          text="Logout"
          colorScheme="destructive"
          onPress={handleLogout}
          isLoading={isLoading}
        />
        <Button
          text="Cancel"
          variant="outline"
          onPress={modal.hide}
          disabled={isLoading}
        />
      </ConfirmModalFooter>
    </ConfirmModal>
  );
});
