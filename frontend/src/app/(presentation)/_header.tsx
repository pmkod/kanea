"use client";
import { Button } from "@/components/core/button";
import Logo from "@/components/core/logo";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/core/sheet";
import { useMediaQuery } from "@mantine/hooks";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PiListLight, PiXLight } from "react-icons/pi";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/core/popover";
import { LuChevronDown, LuUser } from "react-icons/lu";
import { links } from "@/constants/links";
import { useLoggedInUser } from "@/hooks/use-logged-in-user";

const Header = () => {
  const handleClickOnSheetLink = () => {
    setSheetOpen(false);
  };

  const [sheetOpen, setSheetOpen] = useState(false);

  const minWidthSmMatches = useMediaQuery("(min-width: 640px)");

  const { isSuccess } = useLoggedInUser();

  return (
    <header className="h-16 flex justify-between items-center pl-[26px] pr-[18px] lg:px-10">
      <Link href="/">
        <Logo />
      </Link>

      <div className="hidden sm:flex items-center">
        {links.map(({ path, name }) => (
          <Link
            key={path + name}
            href={minWidthSmMatches ? path : ""}
            className="text-base py-0.5 px-2.5 border border-transparent hover:border-gray-200 transition-colors hover:bg-gray-100 rounded font-semibold text-gray-800 hover:text-gray-800"
          >
            {name}
          </Link>
        ))}

        {!isSuccess && (
          <div className="ml-3">
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-x-1 hover:bg-gray-100 transition-colors border rounded px-3 py-1.5">
                  <LuUser className="text-lg" />
                  <LuChevronDown className="text-sm" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="max-w-40">
                <div className="flex flex-col gap-y-2">
                  <Button variant="outline" asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/signup">Signup</Link>
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <button className="sm:hidden p-2 rounded text-3xl transition-colors hover:bg-gray-100">
            <PiListLight />
          </button>
        </SheetTrigger>
        <SheetContent className="pt-0 px-0 w-full sm:w-96 flex flex-col">
          {minWidthSmMatches === false && (
            <>
              <div className="h-16 pl-3 pr-5 flex items-center justify-between">
                <Link href="/" onClick={handleClickOnSheetLink}>
                  <Logo />
                </Link>
                <SheetClose asChild>
                  <button className="ml-auto p-2 rounded text-3xl transition-colors hover:bg-gray-100">
                    <PiXLight />
                  </button>
                </SheetClose>
              </div>
              <div className="flex-1 px-5 py-10 flex flex-col justify-between">
                <div>
                  {links.map(({ path, name }) => (
                    <Link
                      key={path + name}
                      href={path}
                      onClick={handleClickOnSheetLink}
                      className="block text-2xl py-3 font-semibold text-gray-600 hover:text-gray-800 border-b"
                    >
                      {name}
                    </Link>
                  ))}
                </div>

                {isSuccess ? (
                  <Button className="w-full" size="xl" asChild>
                    <Link href={minWidthSmMatches ? "" : "/home"}>
                      Go to home
                    </Link>
                  </Button>
                ) : (
                  <div className="flex flex-col gap-y-2">
                    <Button
                      variant="outline"
                      size="xl"
                      fullWidth
                      asChild
                      className="bg-white"
                    >
                      <Link href={minWidthSmMatches ? "" : "/login"}>
                        Login
                      </Link>
                    </Button>

                    <Button className="w-full" size="xl" asChild>
                      <Link href={minWidthSmMatches ? "" : "/signup"}>
                        Signup
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </header>
  );
};

export default Header;
