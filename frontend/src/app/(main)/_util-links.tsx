import { appName } from "@/constants/app-constants";
import { links } from "@/constants/links";
import Link from "next/link";

export const UtilLinks = () => {
  return (
    <div className="mt-8">
      <div className="px-4 text-gray-400 sticky top-0 flex flex-wrap gap-x-3">
        {links.map(({ path, name }) => (
          <Link key={path} href={path} className="text-sm font-semibold">
            {name}
          </Link>
        ))}
        <div className="text-sm">
          &copy; {new Date().getFullYear()}
          {" " + appName}
        </div>
      </div>
    </div>
  );
};
