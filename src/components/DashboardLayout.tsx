import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { notFound } from "next/navigation";
import React, { useEffect } from "react";
import { FiMoon } from "react-icons/fi";
import { MdOutlineAddBox, MdOutlineConnectedTv } from "react-icons/md";
import { LuPlusCircle } from "react-icons/lu";
import { BsSun } from "react-icons/bs";
import { TbLogout } from "react-icons/tb";
import { api } from "~/utils/api";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { data: sessionData } = useSession();
  const { theme, setTheme } = useTheme();

  const changeUserThemeMutation = api.user.changeUserTheme.useMutation();
  const {
    data: connectedUsers,
    // isLoading,
    // isError,
  } = api.chat.connectedUsers.useQuery();

  //   if (isLoading) {
  //     return <div>Loading chats...</div>;
  //   }

  //   if (isError || !connectedUsers) {
  //     return <div>Failed to load chats</div>;
  //   }

  const changeTheme = () => {
    changeUserThemeMutation.mutate(
      {
        theme: theme === "light" ? "dark" : "light",
      },
      {
        onSettled: (data, error) => {
          if (data) {
            setTheme(data.theme);
          }
          if (error) {
            alert(error.message);
          }
        },
      },
    );
  };

  useEffect(() => {
    if (sessionData?.user) {
      console.log("theme ---", sessionData.user.theme);
      if (sessionData.user.theme !== theme) {
        setTheme(sessionData.user.theme);
      }
    } else {
      if (theme !== "light") {
        setTheme("light");
      }
    }
  }, [sessionData]);

  //   if (!sessionData) notFound();
  return (
    <>
      <div className="flex h-screen w-full">
        <div className="flex h-full w-full max-w-xs grow flex-col gap-y-5 overflow-y-auto border-r border-secondaryBackground bg-secondaryBackground px-6">
          <Link
            href={"/dashboard"}
            className="flex h-16 shrink-0 items-center font-semibold"
          >
            <MdOutlineConnectedTv className="mr-2 h-10 w-10" /> Domagoj Chat App
          </Link>
          <div className="text-xs font-semibold leading-6 text-secondaryText">
            Your chats
          </div>

          <nav className="flex flex-1 flex-col">
            <ul role="list" className="mb-2 flex flex-1 flex-col gap-y-3">
              {connectedUsers?.map((user) => {
                return (
                  <li key={user.id}>
                    <Link
                      href={`/dashboard/chat/${user.conversationId}`}
                      className="flex rounded-md p-1 font-semibold text-primaryText transition hover:cursor-pointer hover:border-primaryHover hover:bg-primaryHover hover:text-secondaryText"
                    >
                      {user.name}
                    </Link>
                  </li>
                );
              })}
              <li>
                <div className="mt-4 text-xs font-semibold leading-6 text-secondaryText">
                  Overview
                </div>

                <ul role="list" className="-mx-2 mt-2 space-y-1">
                  <li>
                    <Link
                      href={"/dashboard/add"}
                      className="group flex gap-3 rounded-md p-2 text-sm font-semibold leading-6 transition hover:bg-primaryHover hover:text-secondaryText"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-primaryText bg-background text-[0.625rem] font-medium text-primaryText group-hover:border-secondaryText group-hover:bg-primaryHover group-hover:text-secondaryText">
                        <MdOutlineAddBox className="h-4 w-4" />
                      </span>
                      Add friend
                    </Link>
                  </li>
                </ul>
              </li>
              <li className="-mx-6 mt-auto flex items-center justify-between px-2">
                <div
                  onClick={changeTheme}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primaryText bg-background text-[0.625rem] font-medium text-primaryText transition hover:cursor-pointer hover:border-secondaryText hover:bg-primaryHover hover:text-secondaryText"
                >
                  <FiMoon className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-700">
                  Username: {sessionData?.user.username}
                </div>

                <Link
                  href={"/api/auth/signout"}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primaryText bg-background text-[0.625rem] font-medium transition hover:border-secondaryText hover:bg-primaryHover hover:text-indigo-600 hover:text-secondaryText"
                >
                  <TbLogout className="h-5 w-5" />
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {children}
      </div>
    </>
  );
};

export default DashboardLayout;
