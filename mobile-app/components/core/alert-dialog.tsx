import { ReactNode } from "react";
import { View } from "react-native";
import { Portal, Modal as PaperModal } from "react-native-paper";
import MyText from "./my-text";
import { useTheme } from "@/hooks/use-theme";

//
//
//
//
//
//

export const AlertDialog = ({
  visible,
  hideModal,
  children,
}: {
  visible: boolean;
  hideModal?: () => void;
  children: ReactNode;
}) => {
  const { theme } = useTheme();
  return (
    <Portal>
      <PaperModal
        visible={visible}
        onDismiss={hideModal}
        style={{
          paddingHorizontal: 10,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 70,
        }}
        contentContainerStyle={{
          backgroundColor: theme.white,
          //   minHeight: 300,
          //   maxHeight: 200,
          maxWidth: 400,
          minWidth: 280,
          borderRadius: 10,
          paddingTop: 30,
          paddingBottom: 50,
          paddingHorizontal: 30,
          justifyContent: "flex-start",
        }}
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

interface AlertDialogHeaderProps {
  children: ReactNode;
}
export const AlertDialogHeader = ({ children }: AlertDialogHeaderProps) => {
  return (
    <View
      style={{
        alignItems: "center",
        gap: 6,
        marginBottom: 40,
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

export const AlertDialogTitle = ({ children }: { children: ReactNode }) => {
  return (
    <MyText style={{ fontSize: 20, fontFamily: "NunitoSans_600SemiBold" }}>
      {children}
    </MyText>
  );
};

//
//
//
//
//
//

export const AlertDialogDescription = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { theme } = useTheme();
  return (
    <MyText
      style={{
        fontSize: 16,
        color: theme.gray700,
        fontFamily: "NunitoSans_400Regular",
      }}
    >
      {children}
    </MyText>
  );
};

interface AlertDialogHeaderProps {
  children: ReactNode;
}
export const AlertDialogFooter = ({ children }: AlertDialogHeaderProps) => {
  return (
    <View
      style={{
        alignItems: "stretch",
        gap: 10,
      }}
    >
      {children}
    </View>
  );
};
