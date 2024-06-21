import {
  newDiscussionGroupStepOneScreenName,
  newDiscussionGroupStepTwoScreenName,
} from "@/constants/screens-names-constants";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { ScrollView, View } from "react-native";
import { Buffer } from "buffer";
import * as ImagePicker from "expo-image-picker";
import { Button } from "@/components/core/button";
import { DiscussionItemAvatar } from "@/components/items/discussion-item";
import { FormItem } from "@/components/core/form";
import { Input } from "@/components/core/input";
import { useEffect } from "react";
import Toast from "react-native-toast-message";
import MyText from "@/components/core/my-text";
import Space from "@/components/core/space";
import { atom, useAtom, useSetAtom } from "jotai";
import { User } from "@/types/user";
import { discussionNameSchema } from "@/validation-schema/discussion-schema";
import { ZodError } from "zod";

export const newGroupDiscussionAtom = atom<{
  name?: string;
  picture?: {
    file: Buffer;
    url: string;
  };
  members: User[];
}>({ name: undefined, picture: undefined, members: [] });

const NewDiscussionGroupStepOneScreen = () => {
  const navigation = useNavigation();
  const [newGroupDiscussion, setNewGroupDiscussion] = useAtom(
    newGroupDiscussionAtom
  );

  const handleNameChange = (text: string) => {
    setNewGroupDiscussion((prevNewGroupDiscussion) => ({
      ...prevNewGroupDiscussion,
      name: text,
    }));
  };

  const selectGroupPicture = async () => {
    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      aspect: [1, 1],
      quality: 1,
      selectionLimit: 1,
      allowsEditing: true,
      presentationStyle: ImagePicker.UIImagePickerPresentationStyle.AUTOMATIC,
    };

    let result = await ImagePicker.launchImageLibraryAsync(options);
    if (!result.canceled) {
      const media = result.assets[0];
      const mediaFetchResponse = await fetch(media.uri);
      const mediaBufferArr = await mediaFetchResponse.arrayBuffer();
      const mediaBuffer = Buffer.from(mediaBufferArr);
      setNewGroupDiscussion((prevNewGroupDiscussion) => ({
        ...prevNewGroupDiscussion,
        picture: { url: media.uri, file: mediaBuffer },
      }));
    }
  };

  const next = async () => {
    try {
      discussionNameSchema.parse(newGroupDiscussion.name);
      navigation.navigate(newDiscussionGroupStepTwoScreenName);
    } catch (error) {
      if (error instanceof ZodError) {
        Toast.show({ type: "error", text2: error.message });
      }
    }
  };
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return <Button size="md" text="Next" onPress={next} />;
      },
    });
  }, [navigation, next]);

  useEffect(() => {
    return () => {
      setNewGroupDiscussion({
        name: undefined,
        picture: undefined,
        members: [],
      });
    };
  }, []);

  return (
    <>
      <View style={{ flex: 1 }}>
        <ScrollView
          style={{
            paddingHorizontal: 24,
            paddingTop: 10,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingTop: 6,
              gap: 14,
            }}
          >
            <DiscussionItemAvatar
              chatType="group"
              width={68}
              discussionPictureUrl={newGroupDiscussion.picture?.url}
            />
            <Button
              size="sm"
              variant="outline"
              text="Choose group picture"
              onPress={selectGroupPicture}
            />
          </View>
          <View style={{ marginTop: 20 }}>
            <FormItem>
              <MyText>Name</MyText>
              <Space height={8} />
              <Input
                placeholder="Choose a name for your group"
                onChange={handleNameChange}
                value={newGroupDiscussion.name}
              />
            </FormItem>
          </View>
        </ScrollView>
      </View>
    </>
  );
};

export const newDiscussionGroupStepOneScreen = {
  name: newDiscussionGroupStepOneScreenName,
  component: NewDiscussionGroupStepOneScreen,
  options: {
    title: "New group",
    animation: "fade_from_bottom",
  } as NativeStackNavigationOptions,
};
