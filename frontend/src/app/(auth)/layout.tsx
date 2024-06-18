"use client";
import Logo from "@/components/core/logo";
import FullPageLoader from "@/components/others/full-page-loader";
import { ScrollToTop } from "@/components/others/scroll-to-top";
import { useLoggedInUser } from "@/hooks/use-logged-in-user";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PropsWithChildren } from "react";
import Footer from "../(presentation)/_footer";
import { useQueryClient } from "@tanstack/react-query";

const AuthLayout = ({ children }: PropsWithChildren) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { isSuccess, isPending } = useLoggedInUser();

  if (isSuccess) {
    queryClient.clear();
    router.replace("/home");
    return <FullPageLoader />;
  }

  return (
    <>
      {isPending && <FullPageLoader />}
      <ScrollToTop />
      <div className="min-h-screen mb-10 flex flex-col">
        <div className="h-16 flex items-center justify-between pl-[26px] lg:px-10">
          <Link href="/">
            <Logo />
          </Link>
        </div>
        <div className="pt-8 flex-1">
          <div className="w-full sm:w-[440px] shadow-sm bg-white z-50 rounded px-[26px] sm:px-9 sm:pt-8 sm:pb-10 sm:border border-gray-300 mx-auto">
            {children}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AuthLayout;
