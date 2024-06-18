import { Button } from "@/components/core/button";
import MyText from "@/components/core/my-text";
import Space from "@/components/core/space";
import {
  ReportReasonItem,
  ReportReasonItemLoader,
} from "@/components/items/report-reason-item";
import { makeReportScreenName } from "@/constants/screens-names-constants";
import { useReportReason } from "@/hooks/use-report-reasons";
import { makeReportRequest } from "@/services/report-service";
import { Discussion } from "@/types/discussion";
import { Message } from "@/types/message";
import { Post } from "@/types/post";
import { PostComment } from "@/types/post-comment";
import { ReportReason } from "@/types/report-reason";
import { User } from "@/types/user";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import Toast from "react-native-toast-message";

const MakeReportScreen = () => {
  const route = useRoute();
  const {
    post,
    postComment,
    user,
    message,
    discussion,
  }: {
    post?: Post;
    postComment?: PostComment;
    user?: User;
    message?: Message;
    discussion?: Discussion;
  } = route.params as any;

  const navigation = useNavigation();

  const { data, isSuccess, isLoading } = useReportReason();

  const [selectedReportReason, setSelectedReportReason] =
    useState<ReportReason>();

  const selectReportReason = (reportReason: ReportReason) => {
    setSelectedReportReason(reportReason);
  };

  const { mutate: makeReport, isPending } = useMutation({
    mutationFn: () => {
      if (selectedReportReason === undefined) {
        throw Error("Your must select a reason");
      }
      const data = {
        reportReasonId: selectedReportReason.id,
      } as any;
      if (post !== undefined) {
        data.reportedPostId = selectedReportReason.id;
      } else if (postComment !== undefined) {
        data.reportedPostCommentId = selectedReportReason.id;
      } else if (discussion !== undefined) {
        data.reportedDiscussionId = selectedReportReason.id;
      } else if (message !== undefined) {
        data.reportedMessageId = selectedReportReason.id;
      } else if (user !== undefined) {
        data.reportedUserId = selectedReportReason.id;
      }
      return makeReportRequest(data);
    },

    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "Thanks for your report",
      });
      navigation.goBack();
    },
    onError: () => {
      Toast.show({ type: "error", text1: "Error" });
      navigation.goBack();
    },
  });

  return (
    <View style={{ flex: 1 }}>
      <ScrollView keyboardShouldPersistTaps="handled" style={{ flex: 1 }}>
        <MyText
          style={{
            fontSize: 24,
            marginTop: 20,
            marginBottom: 26,
            fontFamily: "NunitoSans_600SemiBold",
            paddingHorizontal: 32,
          }}
        >
          What type of issue are you reporting?
        </MyText>
        {isLoading ? (
          <>
            <ReportReasonItemLoader />
            <ReportReasonItemLoader />
            <ReportReasonItemLoader />
            <ReportReasonItemLoader />
            <ReportReasonItemLoader />
          </>
        ) : (
          isSuccess &&
          data.reportReasons.map((reportReason) => (
            <ReportReasonItem
              key={reportReason.id}
              reportReason={reportReason}
              selectedReportReason={selectedReportReason}
              onPress={() => selectReportReason(reportReason)}
            />
          ))
        )}
        <Space height={40} />
      </ScrollView>
      <View style={{ paddingHorizontal: 32, paddingVertical: 24 }}>
        <Button
          text="Send"
          size="lg"
          onPress={() => makeReport()}
          isLoading={isPending}
          disabled={selectedReportReason === undefined}
        />
      </View>
    </View>
  );
};

export const makeReportScreen = {
  name: makeReportScreenName,
  component: MakeReportScreen,
  options: {
    title: "Make report",
    animation: "ios",
  } as NativeStackNavigationOptions,
};
