import { PropsWithChildren, ReactNode } from "react";
import { Portal, Modal as PaperModal } from "react-native-paper";
import { View } from "react-native";
import MyText from "./my-text";

//
//
//
//
//
//

export const Modal = ({
  visible,
  hideModal,
  children,
}: {
  visible: boolean;
  hideModal?: () => void;
  children: ReactNode;
}) => {
  return (
    <Portal>
      <PaperModal
        visible={visible}
        onDismiss={hideModal}
        style={{ paddingHorizontal: 20 }}
        contentContainerStyle={{ backgroundColor: "white", minHeight: 200 }}
      >
        {children}
      </PaperModal>
    </Portal>
  );
};

//
//
//
//
//

interface ModalHeaderProps {
  children: ReactNode;
}
export const ModalHeader = ({ children }: ModalHeaderProps) => {
  return (
    <View
      style={{
        flexDirection: "row",
        alignContent: "center",
        paddingHorizontal: 20,
        position: "relative",
      }}
    >
      {children}
    </View>
  );
};

//
//
//
//
//

export const ModalTitle = ({ text }: { text: string }) => {
  return (
    <View
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <MyText>{text}</MyText>
    </View>
  );
};

//
//
//
//
//
//

export const ModalBody = ({ children }: PropsWithChildren) => {
  return <View>{children}</View>;
};
