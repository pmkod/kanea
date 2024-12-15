"use client";
import { Button } from "@/components/core/button";
import { baseFileUrl } from "@/configs";
import { apkName } from "@/constants/app-constants";
import { useLoggedInUser } from "@/hooks/use-logged-in-user";
import Link from "next/link";
import { PropsWithChildren, ReactNode } from "react";
import { PiArrowRightLight, PiDownloadSimple } from "react-icons/pi";

const First = () => {
  const { isSuccess } = useLoggedInUser();

  return (
    <main>
      <section className="h-[92vh] flex flex-col items-center pt-24 px-10 bg-white bg-[linear-gradient(to_right,var(--color-gray-200)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-gray-200)_1px,transparent_1px)] bg-[size:24px_24px]">
        <div className="relative z-30 max-w-4xl leading-tight md:leading-tight text-center text-5xl sm:text-6xl md:text-7xl font-black">
          The best place to share your experiences
        </div>

        <div className="mt-10 flex flex-col gap-y-4">
          <Button size="xl" asChild fullWidth>
            <Link href={isSuccess ? "/home" : "/signup"}>
              <span className="mr-2">
                {isSuccess ? "Go to home" : "Use in browser"}
              </span>
              <PiArrowRightLight />
            </Link>
          </Button>
          <div className="bg-white">
            <Button size="xl" variant="outline" asChild fullWidth>
              <Link href="/#download">
                <span className="mr-2">Download app</span>
                <PiDownloadSimple />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      <PresentationSection background="gray">
        <PresentationSectionImagePart imgSource="/post-like-illustration.png" />
        <PresentationSectionTextPart>
          Create posts to share the best moments of your life.
        </PresentationSectionTextPart>
      </PresentationSection>
      <PresentationSection>
        <PresentationSectionImagePart imgSource="/group-illustration.png" />

        <PresentationSectionTextPart>
          Create discussion groups and manage their
        </PresentationSectionTextPart>
      </PresentationSection>
      <PresentationSection background="gray">
        <PresentationSectionImagePart imgSource="/message-illustration.png" />
        <PresentationSectionTextPart>
          Chat privately with all your friends
        </PresentationSectionTextPart>
      </PresentationSection>
      <div
        id="download"
        className="flex flex-col gap-y-36 pt-12 md:flex-row px-14 min-h-screen"
      >
        <DownloadGroup>
          <DownloadGroupTitle>Android</DownloadGroupTitle>
          <div className="mt-6">
            <Button size="lg" asChild>
              <Link
                target="_blank"
                href={baseFileUrl + apkName}
                rel="noopener noreferrer"
                download="kanea.apk"
              >
                Download apk
                <PiDownloadSimple className="ml-2" />
              </Link>
            </Button>
          </div>
          <img
            src="/android.png"
            className="w-80 mt-16"
            alt="Android illustration"
          />
        </DownloadGroup>

        <DownloadGroup>
          <DownloadGroupTitle>Ios</DownloadGroupTitle>
          <div className="mt-6">
            <Button size="lg" disabled={true}>
              Available soon
            </Button>
          </div>
          <img
            src="/iphone.png"
            className="w-80 mt-10"
            alt="Android illustration"
          />
        </DownloadGroup>
      </div>
      <section className="px-5 md:px-14 lg:px-44 pt-32 pb-20 flex flex-col items-center">
        <div className="text-5xl text-center sm:text-6xl md:text-7xl font-black mb-20">
          Do you want to start the adventure ?
        </div>

        <Button size="xl" asChild>
          <Link href="/signup">
            <span className="mr-2">Signup</span>
            <PiArrowRightLight />
          </Link>
        </Button>
      </section>
    </main>
  );
};

export default First;

interface PresentationSectionProps {
  children: ReactNode;
  background?: "gray" | "white";
}

const PresentationSection = ({
  background = "white",
  children,
}: PresentationSectionProps) => {
  return (
    <section className={background === "gray" ? "bg-gray-100" : "bg-white"}>
      <div
        className={`max-w-5xl px-5 md:px-14 py-20 mx-auto flex items-center flex-col md:flex-row justify-between gap-y-10 gap-x-14 lg:gap-x-40 ${
          background === "gray" ? "bg-gray-100" : "bg-white"
        }`}
      >
        {children}
      </div>
    </section>
  );
};

const PresentationSectionTextPart = ({ children }: PropsWithChildren) => {
  return (
    <div className="flex-1 px-8 sm:px-0">
      <div className="text-4xl text-center md:text-left lg:text-5xl leading-tight font-bold">
        {children}
      </div>
    </div>
  );
};

const PresentationSectionImagePart = ({ imgSource }: { imgSource: string }) => {
  return (
    <div className="flex-1">
      <img
        src={imgSource}
        alt=""
        className="w-full aspect-[1/1] object-cover"
      />
    </div>
  );
};

const DownloadGroup = ({ children }: PropsWithChildren) => {
  return (
    <div className="flex flex-col items-center min-h-[400px] flex-1">
      {children}
    </div>
  );
};

const DownloadGroupTitle = ({ children }: PropsWithChildren) => {
  return <div className="font-black text-2xl text-center">{children}</div>;
};
