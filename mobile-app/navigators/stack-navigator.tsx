import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTheme } from "@/hooks/use-theme";
import { bottomTabNavigator } from "./bottom-tab-navigator";
import { loginScreen } from "@/screens/auth/login-screen";
import { signupScreen } from "@/screens/auth/signup-screen";
import { postScreen } from "@/screens/post-screen";
import { discussionScreen } from "@/screens/discussions/discussion-screen";
import { discussionInfosScreen } from "@/screens/discussions/discussion-infos-screen";
import { settingsScreen } from "@/screens/settings/settings-screen";
import { emailVerificationScreen } from "@/screens/auth/email-verification-screen";
import { completeSignupScreen } from "@/screens/auth/complete-signup-screen";
import { passwordResetScreen } from "@/screens/auth/password-reset-screen";
import { newPasswordScreen } from "@/screens/auth/new-password-screen";
import { editUserProfileScreen } from "@/screens/edit-user-profile-screen";
import { accountSettingsScreen } from "@/screens/settings/account/account-settings-screen";
import { securitySettingsScreen } from "@/screens/settings/security/security-settings-screen";
import { themeSettingsScreen } from "@/screens/settings/theme-settings-screen";
import { onlineStatusSettingsScreen } from "@/screens/settings/online-status-settings-screen";
import { sessionsSettingsScreen } from "@/screens/settings/security/sessions/sessions-settings-screen";
import { changeEmailSettingsScreen } from "@/screens/settings/account/change-email-settings-screen";
import { changeUsernameSettingsScreen } from "@/screens/settings/account/change-username-settings-screen";
import { changePasswordSettingsScreen } from "@/screens/settings/account/change-password-settings-screen";
import { blockedUsersSettingsScreen } from "@/screens/settings/blocked-users-screen";
import { searchUserScreen } from "@/screens/search-user-screen";
import { publishPostScreen } from "@/screens/publish-post-screen";
import { userScreen } from "@/screens/user/user-screen";
import { firstScreen } from "@/screens/first-screen";
import { userFollowersScreen } from "@/screens/user/user-followers-screen";
import { userFollowingScreen } from "@/screens/user/user-following-screen";
import { postLikesScreen } from "@/screens/post-likes-screen";
import { sessionSettingsScreen } from "@/screens/settings/security/sessions/session-settings-screen";
import { makeReportScreen } from "@/screens/report/make-report-screen";
import { selectedMediaScreen } from "@/screens/selected-media-screen";
import { discussionMediasAndDocsScreen } from "@/screens/discussions/discussion-medias-and-docs-screen";
import { postCommentsBottomSheetScreen } from "@/screens/post-comments-bottom-sheet-screen";
import { searchDiscussionScreen } from "@/screens/discussions/search-discussion-screen";
import { newMessageScreen } from "@/screens/discussions/new-message-screen";
import { newDiscussionGroupStepOneScreen } from "@/screens/discussions/new-discussion-group-step-one-screen";
import { newDiscussionGroupStepTwoScreen } from "@/screens/discussions/new-discussion-group-step-two-screen";
import { addNewMembersToDiscussionGroupScreen } from "@/screens/discussions/add-new-members-to-discussion-group-screen";
import { editDiscussionGroupSceen } from "@/screens/discussions/edit-discussion-group-screen";
import { messagesMediasScreen } from "@/screens/discussions/messages-medias-screen";
import { pictureScreen } from "@/screens/picture-screen";
import { messageMediasScreen } from "@/screens/discussions/message-medias-screen";

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  const { theme } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShadowVisible: false,

        headerTitleStyle: {
          fontFamily: "NunitoSans_700Bold",
        },
        headerStyle: {
          backgroundColor: theme.white,
        },

        headerTintColor: theme.gray900,
      }}
    >
      <Stack.Screen {...firstScreen} />
      <Stack.Screen {...loginScreen} />
      <Stack.Screen {...signupScreen} />
      <Stack.Screen {...emailVerificationScreen} />
      <Stack.Screen {...completeSignupScreen} />
      <Stack.Screen {...passwordResetScreen} />
      <Stack.Screen {...newPasswordScreen} />
      <Stack.Screen {...bottomTabNavigator} />
      <Stack.Screen {...postScreen} />
      <Stack.Screen {...postCommentsBottomSheetScreen} />
      <Stack.Screen {...postLikesScreen} />
      <Stack.Screen {...editUserProfileScreen} />
      <Stack.Screen {...discussionScreen} />
      <Stack.Screen {...searchDiscussionScreen} />
      <Stack.Screen {...discussionInfosScreen} />
      <Stack.Screen {...discussionMediasAndDocsScreen} />
      <Stack.Screen {...settingsScreen} />
      <Stack.Screen {...accountSettingsScreen} />
      <Stack.Screen {...securitySettingsScreen} />
      <Stack.Screen {...themeSettingsScreen} />
      <Stack.Screen {...onlineStatusSettingsScreen} />
      <Stack.Screen {...blockedUsersSettingsScreen} />
      <Stack.Screen {...sessionsSettingsScreen} />
      <Stack.Screen {...sessionSettingsScreen} />
      <Stack.Screen {...changeEmailSettingsScreen} />
      <Stack.Screen {...changeUsernameSettingsScreen} />
      <Stack.Screen {...changePasswordSettingsScreen} />
      <Stack.Screen {...searchUserScreen} />
      <Stack.Screen {...publishPostScreen} />
      <Stack.Screen {...userScreen} />
      <Stack.Screen {...userFollowersScreen} />
      <Stack.Screen {...userFollowingScreen} />
      <Stack.Screen {...makeReportScreen} />
      <Stack.Screen {...selectedMediaScreen} />
      <Stack.Screen {...newMessageScreen} />
      <Stack.Screen {...newDiscussionGroupStepOneScreen} />
      <Stack.Screen {...newDiscussionGroupStepTwoScreen} />
      <Stack.Screen {...addNewMembersToDiscussionGroupScreen} />
      <Stack.Screen {...editDiscussionGroupSceen} />
      <Stack.Screen {...messagesMediasScreen} />
      <Stack.Screen {...pictureScreen} />
      <Stack.Screen {...messageMediasScreen} />
    </Stack.Navigator>
  );
};

export default StackNavigator;
