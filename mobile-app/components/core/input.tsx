import { useTheme } from "@/hooks/use-theme";
import React, { LegacyRef, forwardRef } from "react";
import {
  ColorValue,
  KeyboardTypeOptions,
  NativeSyntheticEvent,
  StyleProp,
  TextInput,
  TextInputChangeEventData,
  TextInputContentSizeChangeEventData,
  TextInputKeyPressEventData,
  TextStyle,
} from "react-native";

export interface InputProps {
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  value?: string;
  multiline?: boolean;
  numberOfLines?: number;
  autoFocus?: boolean;
  // onChangeText?: ((text: string) => void) | undefined;
  // onChange?: (e: NativeSyntheticEvent<TextInputChangeEventData>) => void;
  onKeyPress?:
    | ((e: NativeSyntheticEvent<TextInputKeyPressEventData>) => void)
    | undefined;
  onChange?: ((text: string) => void) | undefined;
  onBlur?:
    | ((e: NativeSyntheticEvent<TextInputChangeEventData>) => void)
    | undefined;

  onFocus?:
    | ((e: NativeSyntheticEvent<TextInputChangeEventData>) => void)
    | undefined;
  style?: StyleProp<TextStyle>;
  placeholderTextColor?: ColorValue;
  maxLength?: number;
  defaultValue?: string;
  onContentSizeChange?: (
    event: NativeSyntheticEvent<TextInputContentSizeChangeEventData>
  ) => void;
}

export const Input = forwardRef(
  (
    {
      keyboardType,
      placeholder,
      secureTextEntry,
      value,
      style,
      multiline,
      numberOfLines,
      autoFocus = false,
      onChange,
      onFocus,
      onBlur,
      placeholderTextColor,
      onKeyPress,
      defaultValue,
      maxLength,
      onContentSizeChange,
    }: InputProps,
    ref: LegacyRef<TextInput>
  ) => {
    const { theme } = useTheme();
    return (
      <TextInput
        ref={ref}
        value={value}
        onChangeText={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        defaultValue={defaultValue}
        maxLength={maxLength}
        style={[
          {
            borderWidth: 1,
            paddingHorizontal: 16,
            borderRadius: 4,
            fontFamily: "NunitoSans_400Regular",
            color: theme.gray700,
            borderColor: theme.gray600,
            paddingVertical: 6,
            textAlignVertical: multiline ? "top" : "center",
            paddingTop: multiline ? 10 : undefined,
            fontSize: 15,
          },
          style,
        ]}
        onKeyPress={onKeyPress}
        returnKeyType="send"
        autoFocus={autoFocus}
        multiline={multiline}
        numberOfLines={numberOfLines}
        placeholderTextColor={placeholderTextColor || theme.gray500}
        placeholder={placeholder}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        onContentSizeChange={onContentSizeChange}
        // textContentType="emailAddress"
      />
    );
  }
);
