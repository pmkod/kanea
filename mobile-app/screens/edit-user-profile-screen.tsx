import { Button } from "@/components/core/button";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/core/form";
import { Input } from "@/components/core/input";
import { useLoggedInUser } from "@/hooks/use-logged-in-user";
import { editUserProfileSchema } from "@/validation-schema/user-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import React from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { Image, ScrollView, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { buildPublicFileUrl } from "@/utils/url-utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserProfileRequest } from "@/services/user-service";
import { loggedInUserQueryKey, usersQueryKey } from "@/constants/query-keys";
import { useNavigation } from "@react-navigation/native";
import Space from "@/components/core/space";
import { editUserProfileScreenName } from "@/constants/screens-names-constants";
import Toast from "react-native-toast-message";
import { Feather } from "@expo/vector-icons";
import { z } from "zod";
import { useTheme } from "@/hooks/use-theme";

const EditUserProfileScreen = () => {
  const queryClient = useQueryClient();
  const { data } = useLoggedInUser({ enabled: false });
  const navigation = useNavigation();
  const { theme } = useTheme();
  const form = useForm<z.infer<typeof editUserProfileSchema>>({
    resolver: zodResolver(editUserProfileSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",

    defaultValues: {
      displayName: data?.user.displayName,
      userName: data?.user.userName,
      bio: data?.user.bio,
    },
  });

  const selectedImageUrl = form.watch("profilePicture.url");
  const chooseProfilePicture = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
      selectionLimit: 1,
      base64: true,
      presentationStyle: ImagePicker.UIImagePickerPresentationStyle.AUTOMATIC,
    });

    if (!result.canceled) {
      form.setValue("profilePicture.url", result.assets[0].uri);
      form.setValue("profilePicture.file", result.assets[0].base64);
    }
  };

  const { mutate, status, isPending } = useMutation({
    mutationFn: (data: FormData) => updateUserProfileRequest(data),
    onSuccess: (data: any, variables, context) => {
      queryClient.setQueryData([loggedInUserQueryKey], (qData: any) => ({
        ...qData,
        user: {
          ...qData.user,
          displayName: data.user.displayName,
          userName: data.user.userName,
          bio: data.user.bio,
          profilePicture: data.user.profilePicture,
        },
      }));
      queryClient.setQueryData(
        [usersQueryKey, data.user.userName],
        (qData: any) => ({
          ...qData,
          user: {
            ...qData.user,
            displayName: data.user.displayName,
            userName: data.user.userName,
            bio: data.user.bio,
            profilePicture: data.user.profilePicture,
          },
        })
      );
      navigation.goBack();

      Toast.show({
        type: "success",
        text2: "Profil modifié avec succès",
      });
    },
    onError: (error: any, variables, context) => {

      Toast.show({
        type: "error",
        text2: error.errors[0].message,
      });
    },
  });

  const save: SubmitHandler<z.infer<typeof editUserProfileSchema>> = (data) => {
    const formData = new FormData();
    formData.append("displayName", data.displayName);
    formData.append("userName", data.userName);
    if (data.bio) {
      formData.append("bio", data.bio);
    }
    if (data.profilePicture !== undefined) {
      formData.append("profilePicture", data.profilePicture.file);
    }

    mutate(formData);
  };

  return (
    <FormProvider {...form}>
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
              paddingBottom: 24,
            }}
          >
            <View
              style={{
                borderRadius: 60,
                width: 80,
                aspectRatio: "1/1",
                backgroundColor: "#e5e7eb",
                marginRight: 16,
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {selectedImageUrl ? (
                <Image
                  src={selectedImageUrl}
                  style={{ width: "100%", height: "100%" }}
                />
              ) : data?.user.profilePicture ? (
                <Image
                  style={{ width: "100%", height: "100%" }}
                  src={buildPublicFileUrl({
                    fileName: data.user.profilePicture.lowQualityFileName,
                  })}
                />
              ) : (
                <Feather name="user" size={38} color={theme.gray400} />
              )}
            </View>
            <Button
              size="sm"
              variant="outline"
              text="Edit profile picture"
              onPress={chooseProfilePicture}
            />
          </View>
          <View style={{ gap: 20 }}>
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <Input placeholder="Choose your name" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="userName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <Input placeholder="Choose an username" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <Input
                    placeholder="Enter a bio"
                    multiline={true}
                    numberOfLines={5}
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </View>
          <Space height={60} />
        </ScrollView>

        <View
          style={{
            padding: 20,
          }}
        >
          <Button
            text="Save"
            isLoading={form.formState.isSubmitting}
            onPress={form.handleSubmit(save)}
          />
        </View>
      </View>
    </FormProvider>
  );
};

//
//
//
//
//

export const editUserProfileScreen = {
  name: editUserProfileScreenName,
  component: EditUserProfileScreen,
  options: {
    title: "Edit profile",
    animation: "fade_from_bottom",
  } as NativeStackNavigationOptions,
};
