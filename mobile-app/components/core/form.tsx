import { useTheme } from "@/hooks/use-theme";
import {
  LegacyRef,
  ReactNode,
  createContext,
  forwardRef,
  useContext,
} from "react";
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  useFormContext,
} from "react-hook-form";
import { StyleProp, Text, View, ViewStyle } from "react-native";
import MyText from "./my-text";
import { useDidUpdate } from "@mantine/hooks";

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TName;
};

const FormFieldContext = createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  const { clearErrors, watch } = useFormContext();
  const fieldValue = watch(props.name);
  useDidUpdate(() => {
    clearErrors(props.name);
  }, [fieldValue]);

  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

//
//
//
//

interface FormItemProps {
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

const FormItem = forwardRef(
  ({ children, style }: FormItemProps, ref: LegacyRef<View>) => {
    return (
      <View ref={ref} style={[style]}>
        {children}
      </View>
    );
  }
);

//
//
//
//

interface FormLabelProps {
  children: ReactNode;
}

const FormLabel = forwardRef(
  ({ children }: FormLabelProps, ref: LegacyRef<View>) => {
    const { getFieldState } = useFormContext();
    const fieldContext = useContext(FormFieldContext);
    const { theme } = useTheme();

    return (
      <Text
        ref={ref}
        style={{
          marginBottom: 4,
          color: getFieldState(fieldContext.name).error ? "red" : theme.gray900,
          fontSize: 16,
          fontFamily: "NunitoSans_600SemiBold",
        }}
      >
        {children}
      </Text>
    );
  }
);

//
//
//
//
//

interface FormDescriptionProps {
  children: ReactNode;
}

const FormDescription = forwardRef(
  ({ children }: FormDescriptionProps, ref: LegacyRef<View>) => {
    return (
      <MyText
        ref={ref}
        style={{
          fontSize: 18,
          color: "gray",
        }}
      >
        {children}
      </MyText>
    );
  }
);

//
//
//

interface FormMessageProps {
  children?: ReactNode;
}

const FormMessage = forwardRef(
  ({ children }: FormMessageProps, ref: LegacyRef<View>) => {
    const { getFieldState } = useFormContext();
    const fieldContext = useContext(FormFieldContext);
    const error = getFieldState(fieldContext.name).error;
    const body = error ? error.message?.toString() : children;

    if (!body) {
      return null;
    }

    return (
      <MyText
        ref={ref}
        style={{
          color: "red",
          fontSize: 12,
          fontWeight: "400",
          marginTop: 2,
        }}
      >
        {body}
      </MyText>
    );
  }
);

//
//
//

export { FormDescription, FormField, FormItem, FormLabel, FormMessage };
