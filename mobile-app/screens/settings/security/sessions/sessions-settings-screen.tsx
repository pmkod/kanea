import { Button } from "@/components/core/button";
import MyText from "@/components/core/my-text";
import Space from "@/components/core/space";
import {
  SessionItem,
  SessionItemLoader,
} from "@/components/items/session-item";
import { sessionsQueryKey } from "@/constants/query-keys";
import { useRefreshOnScreenFocus } from "@/hooks/use-refresh-on-screen-focus";
import { useSessions } from "@/hooks/use-sessions";
import { useTheme } from "@/hooks/use-theme";
import { logoutOfOthersSessionRequest } from "@/services/session-service";
import { useIsFocused } from "@react-navigation/native";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { atom, useAtom } from "jotai";
import React, { PropsWithChildren, useEffect } from "react";
import { FlatList, View } from "react-native";
import Toast from "react-native-toast-message";

const firstPageRequestedAtAtom = atom<Date | undefined>(undefined);

const SessionsSettingsScreen = () => {
  const [firstPageRequestedAt, setFirstPageRequestedAt] = useAtom(
    firstPageRequestedAtAtom
  );
  const { theme } = useTheme();

  const queryClient = useQueryClient();

  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      setFirstPageRequestedAt(new Date());
    } else {
      setFirstPageRequestedAt(undefined);
    }
  }, [isFocused]);

  const {
    data,
    isLoading,
    isSuccess,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isError,
  } = useSessions({ firstPageRequestedAt });

  useRefreshOnScreenFocus(refetch);

  //
  //
  //
  //
  //

  const { mutate, isPending } = useMutation({
    mutationFn: logoutOfOthersSessionRequest,
    onSuccess: () => {
      queryClient.setQueryData([sessionsQueryKey], (qData: any) => {
        return {
          ...qData,
          pages: [
            {
              currentSession: qData.pages[0].currentSession,
              otherSessions: [],
            },
          ],
        };
      });
      Toast.show({ type: "info", text1: "Success" });
    },
    onError: () => {
      Toast.show({ type: "error", text1: "Success" });
    },
  });

  //
  //
  //
  //
  //

  const logoutOfOthersSession = () => {
    mutate();
  };

  const loadMoreOtherSessions = () => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
    // }
  };

  const sessions = isSuccess
    ? data.pages.map((page) => page.otherSessions).flat()
    : [];

  return (
    <View style={{ flex: 1 }}>
      {!isError && (
        <FlatList
          data={sessions}
          onEndReachedThreshold={0.3}
          onEndReached={loadMoreOtherSessions}
          ListHeaderComponent={
            <View>
              <Space height={20} />
              <View style={{ paddingHorizontal: 20 }}>
                <Title>Current active session</Title>
                <SubTitle>Your current session</SubTitle>
              </View>
              <Space height={10} />
              {isLoading ? (
                <SessionItemLoader />
              ) : isSuccess ? (
                <SessionItem
                  session={data.pages[0].currentSession}
                  isCurrentSession={true}
                />
              ) : null}

              <View
                style={{
                  marginVertical: 20,
                  height: 1,
                  backgroundColor: theme.gray300,
                }}
              ></View>

              <View style={{ paddingHorizontal: 20 }}>
                <Title>Others active sessions</Title>
                <SubTitle>Your others sessions</SubTitle>

                <Space height={16} />
                {isSuccess &&
                  data.pages.length > 0 &&
                  data.pages[0].otherSessions.length > 0 && (
                    <Button
                      variant="outline"
                      onPress={logoutOfOthersSession}
                      text="Log out of all others sessions"
                      isLoading={isPending}
                      colorScheme="destructive"
                    />
                  )}
              </View>
              <Space height={20} />
            </View>
          }
          ListEmptyComponent={
            isLoading ? null : (
              <View style={{ paddingTop: 20 }}>
                <MyText style={{ color: theme.gray500, textAlign: "center" }}>
                  No other sessions
                </MyText>
              </View>
            )
          }
          ListFooterComponent={
            isFetchingNextPage || isLoading ? (
              <>
                <SessionItemLoader />
                <SessionItemLoader />
                <SessionItemLoader />
                <SessionItemLoader />
              </>
            ) : null
          }
          renderItem={({ item }) => (
            <SessionItem
              key={item.id}
              session={item}
              isCurrentSession={false}
            />
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      )}
      <Space height={40} />
    </View>
  );
};

const Title = ({ children }: PropsWithChildren) => {
  return (
    <MyText
      style={{
        fontSize: 18,
        fontFamily: "NunitoSans_600SemiBold",
        marginBottom: 4,
      }}
    >
      {children}
    </MyText>
  );
};

const SubTitle = ({ children }: PropsWithChildren) => {
  return (
    <MyText
      style={{
        fontSize: 15,
        color: "#9ca3af",
        fontFamily: "NunitoSans_400Regular",
      }}
    >
      {children}
    </MyText>
  );
};

export const sessionsSettingsScreen = {
  name: "SessionsSettings",
  component: SessionsSettingsScreen,
  options: {
    title: "Sessions",
    animation: "ios",
  } as NativeStackNavigationOptions,
};
