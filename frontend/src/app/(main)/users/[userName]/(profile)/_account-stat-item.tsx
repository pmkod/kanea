//
//
//
//

import { formatStatNumber } from "@/utils/number-utils";

type AccountStatItemProps = {
  label: string;
  value?: number;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

export const AccountStatItem = ({
  label,
  value,
  onClick,
}: AccountStatItemProps) => {
  return value !== undefined ? (
    <button
      onClick={onClick}
      className={`flex items-center [&:nth-child(3)]:mr-0 ${
        onClick !== undefined && value > 0 && "cursor-pointer"
      }`}
    >
      <span className="text-gray-900 font-semibold mr-1">
        {formatStatNumber(value)}
      </span>
      <span className="text-gray-400 text-xs sm:text-base">{label}</span>
    </button>
  ) : null;
};
