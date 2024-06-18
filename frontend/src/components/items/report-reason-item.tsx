import { ReportReason } from "@/types/report-reason";

interface ReportReasonItemProps {
  reportReason: ReportReason;
  selectedReportReason?: ReportReason;
  onClick: React.MouseEventHandler<HTMLDivElement>;
}

export const ReportReasonItem = ({
  reportReason,
  selectedReportReason,
  onClick,
}: ReportReasonItemProps) => {
  return (
    <div
      onClick={onClick}
      className="group flex items-start justify-between gap-x-4 mb-4 cursor-pointer"
    >
      <div className="rounded-full mt-1 w-5 h-5 p-0.5 border-2 border-gray-300">
        <div
          className={`rounded-full w-full h-full transition-colors ${
            reportReason.id === selectedReportReason?.id
              ? "bg-blue-500"
              : "group-hover:bg-blue-100"
          }`}
        ></div>
      </div>
      <div className="flex-1">
        <div className="font-medium text-gray-800">{reportReason.title}</div>
        <div className="leading-none text-gray-500">
          {reportReason.description}
        </div>
      </div>
    </div>
  );
};
