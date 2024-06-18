import { NativeScrollEvent, NativeSyntheticEvent } from "react-native";

export const isCloseToBottom = (
  event: NativeSyntheticEvent<NativeScrollEvent>,
  options?: {
    paddingToBottom: number;
  }
) => {
  const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
  // const paddingToBottom = 400;

  return (
    layoutMeasurement.height + contentOffset.y >=
    contentSize.height - (options !== undefined ? options.paddingToBottom : 400)
  );
};

export const isCloseToBottomInInvertedComponent = (
  event: NativeSyntheticEvent<NativeScrollEvent>
) => {
  const { contentOffset } = event.nativeEvent;
  // const paddingToBottom = 400;

  return contentOffset.y - 40 <= 0;
};
