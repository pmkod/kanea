import { appName, githubLink, portfolioLink } from "@/constants/app-constants";
import { Metadata } from "next";
import Link from "next/link";
import { ReactNode } from "react";
import { PiArrowRightThin, PiGithubLogo, PiLink } from "react-icons/pi";
import PresentationPageTitle from "../_presentation-page-title";
import { ScrollToTop } from "@/components/others/scroll-to-top";

export const metadata: Metadata = {
  title: "Developer",
  description: `I am Kodossou Kouassi, the developer of ${appName}`,
};

const DeveloperPage = () => {
  return (
    <div>
      <ScrollToTop />
      <PresentationPageTitle>The developer</PresentationPageTitle>
      <div className="pt-7 px-5">
        <div className="flex flex-col items-center">
          <img
            src={"/profile_pic.jpeg"}
            alt="Kodossou Kouassi"
            className="w-40 aspect-square object-contain mb-4 rounded-full"
          />
          <div className="text-xl text-gray-600 font-semibold">
            Kouassi Kodossou
          </div>
          <div className="mt-8 space-y-3.5">
            <DeveloperInfoRow link={portfolioLink}>
              <div className="flex items-center gap-x-2">
                <div>See my portfolio</div>
                <PiLink />
              </div>
            </DeveloperInfoRow>
            <DeveloperInfoRow link={githubLink}>
              <div className="flex items-center gap-x-2">
                <div>See my github</div>
                <PiGithubLogo />
              </div>
            </DeveloperInfoRow>
            <DeveloperInfoRow link="/contact">
              <div className="flex items-center gap-x-2">
                <div>Contact me</div>
                <PiArrowRightThin />
              </div>
            </DeveloperInfoRow>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperPage;

const DeveloperInfoRow = ({
  children,
  link,
}: {
  children?: ReactNode;
  link: string;
}) => {
  const isOtherWebsiteLink = link.startsWith("https");
  return (
    <Link
      href={link}
      target={isOtherWebsiteLink ? "_blank" : undefined}
      rel={isOtherWebsiteLink ? `noopener noreferrer` : undefined}
      className="px-8 flex justify-center items-center text-gray-600 hover:text-gray-800 transition-colors font-medium border border-gray-400 hover:border-gray-500 rounded-md py-3"
    >
      {children}
    </Link>
  );
};
