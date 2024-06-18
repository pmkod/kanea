import { ReportReason } from "@/types/report-reason";
import { Pressable, View } from "react-native";
import { Skeleton } from "../core/skeleton";
import MyText from "../core/my-text";
import { useTheme } from "@/hooks/use-theme";

interface ReportReasonItemProps {
  reportReason: ReportReason;
  selectedReportReason?: ReportReason;
  onPress: () => void;
}

export const ReportReasonItem = ({
  reportReason,
  selectedReportReason,
  onPress,
}: ReportReasonItemProps) => {
  const { theme } = useTheme();
  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            gap: 16,
            paddingVertical: 8,
            backgroundColor: pressed ? theme.gray100 : theme.transparent,
            paddingHorizontal: 32,
          }}
        >
          <View
            style={{
              borderRadius: 300,
              width: 20,
              aspectRatio: "1/1",
              padding: 2,
              borderWidth: 2,
              borderColor: theme.gray300,
              marginTop: 4,
            }}
          >
            <View
              style={{
                borderRadius: 300,
                width: "100%",
                aspectRatio: "1/1",
                backgroundColor:
                  reportReason.id === selectedReportReason?.id
                    ? theme.blue
                    : theme.transparent,
              }}
            ></View>
          </View>
          <View style={{ flex: 1 }}>
            <MyText
              style={{
                color: theme.gray800,
                fontFamily: "NunitoSans_600SemiBold",
                fontSize: 16,
              }}
            >
              {reportReason.title}
            </MyText>
            <MyText style={{ color: theme.gray500, fontSize: 16 }}>
              {reportReason.description}
            </MyText>
          </View>
        </View>
      )}
    </Pressable>
  );
};

export const ReportReasonItemLoader = () => {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 16,
        paddingHorizontal: 32,
        paddingVertical: 8,

        marginBottom: 16,
      }}
    >
      <Skeleton style={{ borderRadius: 30, width: 20, aspectRatio: "1/1" }} />

      <View style={{ flex: 1 }}>
        <Skeleton
          style={{
            width: "60%",
            borderRadius: 8,
            height: 10,
            marginBottom: 14,
          }}
        />
        <Skeleton
          style={{
            width: "70%",
            borderRadius: 8,
            height: 10,
            marginBottom: 14,
          }}
        />
        <Skeleton style={{ width: "70%", borderRadius: 8, height: 10 }} />
      </View>
    </View>
  );
};
