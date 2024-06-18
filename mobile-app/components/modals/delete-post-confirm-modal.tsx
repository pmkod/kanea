import { Post } from "@/types/post";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePostRequest } from "@/services/post-service";
import {
  followingTimelineQueryKey,
  postsQueryKey,
  usersQueryKey,
} from "@/constants/query-keys";
import { Button } from "../core/button";
import {
  homeScreenName,
  postScreenName,
} from "@/constants/screens-names-constants";
import {
  CommonActions,
  useNavigation,
  useNavigationState,
} from "@react-navigation/native";
import { bottomTabNavigatorName } from "@/constants/navigators-names-constants";
import Toast from "react-native-toast-message";
import {
  ConfirmModal,
  ConfirmModalDescription,
  ConfirmModalFooter,
  ConfirmModalTitle,
} from "../core/confirm-modal";

export const DeletePostConfirmModal = NiceModal.create(
  ({ post }: { post: Post }) => {
    const modal = useModal();
    const hideModal = () => modal.hide();
    const navigation = useNavigation();
    const queryClient = useQueryClient();

    const screenName = useNavigationState(
      (state) => state.routes[state.index].name
    );

    const { mutate, isPending } = useMutation({
      mutationFn: (postId: string) => deletePostRequest(postId),
      onSuccess: (data, postId, context) => {
        modal.hide();

        if (screenName === postScreenName) {
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            CommonActions.reset({
              index: 0,
              routes: [{ name: bottomTabNavigatorName }],
            });
          }
        } else if (screenName === homeScreenName) {
          queryClient.setQueryData(
            [followingTimelineQueryKey],
            (qData: any) => {
              return {
                ...qData,
                pages: qData.pages.map((pageData: any) => ({
                  ...pageData,
                  posts: pageData.posts.filter(
                    (postInData: Post) => postInData.id !== postId
                  ),
                })),
              };
            }
          );
        }

        const userQueryState = queryClient.getQueryState([
          usersQueryKey,
          data?.post.publisher.userName,
        ]);
        if (userQueryState?.status === "success") {
          queryClient.setQueryData(
            [usersQueryKey, data?.post.publisher.userName],
            (qData: any) => ({
              ...qData,
              user: {
                ...qData.user,
                postsCount: qData.postsCount - 1,
              },
            })
          );
        }

        queryClient.setQueryData(
          [usersQueryKey, post.publisher.id, postsQueryKey],
          (qData: any) => {
            return {
              ...qData,
              pages: qData.pages.map((pageData: any) => ({
                ...pageData,
                posts: pageData.posts.filter(
                  (postInData: Post) => postInData.id !== postId
                ),
              })),
            };
          }
        );

        Toast.show({
          type: "info",
          text2: "Post deleted",
        });
      },
    });

    const confirm = () => {
      mutate(post.id);
    };

    return (
      <ConfirmModal visible={modal.visible} hide={modal.hide}>
        <ConfirmModalTitle>Delete post</ConfirmModalTitle>
        <ConfirmModalDescription>Are you sure ?</ConfirmModalDescription>

        <ConfirmModalFooter>
          <Button
            text="Confirm"
            colorScheme="destructive"
            onPress={confirm}
            isLoading={isPending}
          />
          <Button
            variant="outline"
            onPress={hideModal}
            text="Cancel"
            disabled={isPending}
          />
        </ConfirmModalFooter>
      </ConfirmModal>
    );
  }
);
