"use client";
import Logo from "@/components/core/logo";
import { appName, icons8WebsiteLink } from "@/constants/app-constants";
import { links } from "@/constants/links";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="border-t border-gray-200 mt-auto bg-gray-100">
      <div className="mx-auto max-w-screen-xl px-5 pb-6 pt-10 sm:px-6">
        <div className="mx-auto w-max mb-5">
          <Link href="/">
            <Logo />
          </Link>
        </div>
        <div className="mx-auto w-max flex flex-col sm:flex-row items-center gap-y-1 sm:gap-x-5">
          {links.map(({ path, name }) => (
            <Link
              key={path + name}
              href={path}
              className="text-base font-semibold text-gray-500 hover:text-gray-800"
            >
              {name}
            </Link>
          ))}
        </div>

        <div className="mt-12 border-t border-gray-200 pt-6">
          <div className="text-center sm:flex sm:justify-between sm:text-left">
            <p className="text-sm text-gray-500">All rights reserved</p>

            <p className="mt-4 text-sm text-gray-500 sm:order-first sm:mt-0">
              &copy; {new Date().getFullYear()} {appName}, Icons by{" "}
              <Link
                href={icons8WebsiteLink}
                rel="noopener noreferrer"
                className="font-medium border-b border-gray-300"
              >
                Icons8
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
