import { ReportReason } from "@/types/report-reason";
import { httpClient } from "./http-client";

//
//
//
//

export const getReportReasonsRequest = async (): Promise<{
  reportReasons: ReportReason[];
}> => await httpClient.get("report-reasons").json();
