import { reportReasonsQueryKey } from "@/constants/query-keys";
import { getReportReasonsRequest } from "@/services/report-reason-service";
import { useQuery } from "@tanstack/react-query";

export const useReportReason = () =>
  useQuery({
    queryKey: [reportReasonsQueryKey],
    queryFn: getReportReasonsRequest,
  });
