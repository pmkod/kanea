import { useTheme } from "@/hooks/use-theme";
import { ReactNode } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import MyText from "./my-text";
import { themes } from "@/styles/themes";
import Toast from "react-native-toast-message";
import { toastConfig } from "@/configs/toast-config";

interface ConfirmModalProps {
  visible: boolean;
  onShow?: () => void;
  onDismiss?: () => void;
  children: ReactNode;
  hide: () => void;
}

export const ConfirmModal = ({
  children,
  visible,
  onShow,
  onDismiss,
  hide,
}: ConfirmModalProps) => {
  const { theme } = useTheme();
  //   const handleShow = async () => {
  //     //   NavigationBar.setBackgroundColorAsync(theme.gray500 + "8C");
  //     await NavigationBar.setVisibilityAsync("hidden");
  //   };
  //   const handleDismiss = () => {
  //     NavigationBar.setBackgroundColorAsync(theme.white);
  //   };
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onShow={onShow}
      onDismiss={onDismiss}
      hardwareAccelerated={true}
      onRequestClose={() => {
        //   Alert.alert('Modal has been closed.');
        //   setModalVisible(!modalVisible);
      }}
      presentationStyle="overFullScreen"
      statusBarTranslucent={true}
      style={{ zIndex: 400 }}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingBottom: 100,
          paddingHorizontal: 30,
        }}
      >
        <Pressable
          onPress={hide}
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: themes.light.gray900,
              opacity: 0.7,
            },
          ]}
        ></Pressable>
        <View
          style={{
            paddingHorizontal: 30,
            paddingTop: 20,
            paddingBottom: 26,
            width: "100%",
            maxWidth: 360,
            backgroundColor: theme.gray100,
            elevation: 2,
            marginTop: 22,
            borderRadius: 10,
          }}
        >
          {children}
        </View>
        <Toast config={toastConfig} />
      </View>
    </Modal>
  );
};

export const ConfirmModalTitle = ({
  children,
}: {
  children: string | string[];
}) => {
  return (
    <MyText
      style={{
        fontSize: 22,
        textAlign: "center",
        fontFamily: "NunitoSans_700Bold",
        marginBottom: 12,
      }}
    >
      {children}
    </MyText>
  );
};

export const ConfirmModalDescription = ({
  children,
}: {
  children: string | string[];
}) => {
  const { theme } = useTheme();
  return (
    <MyText
      style={{
        fontSize: 16,
        textAlign: "center",
        color: theme.gray600,
        marginBottom: 30,
      }}
    >
      {children}
    </MyText>
  );
};

export const ConfirmModalFooter = ({ children }: { children: ReactNode }) => {
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
