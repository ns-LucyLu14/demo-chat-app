import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { notFound } from "next/navigation";
import React, { useEffect } from "react";
import { FiMoon } from "react-icons/fi";
import { MdOutlineAddBox, MdOutlineConnectedTv } from "react-icons/md";
import { TbLogout } from "react-icons/tb";
import { api } from "~/utils/api";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { data: sessionData } = useSession();
  const { theme, setTheme } = useTheme();
  const changeUserThemeMutation = api.user.changeUserTheme.useMutation();
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

  const chats = [
    {
      userId: "user_1",
      conversationId: "conv_2",
      name: "Charlie Brown",
      username: "charlieb",
      conversation: {
        id: "conv_2",
        lastMessageId: "msg_4",
        createdAt: "2024-10-07T11:00:00Z",
        messages: [
          {
            id: "msg_3",
            messageText: "Charlie, did you finish the report?",
            userId: "user_1",
            conversationId: "conv_2",
            createdAt: "2024-10-07T11:01:00Z",
          },
          {
            id: "msg_4",
            messageText: "Yeah, I sent it earlier today.",
            userId: "user_3",
            conversationId: "conv_2",
            createdAt: "2024-10-07T11:02:00Z",
          },
        ],
        lastMessage: {
          id: "msg_4",
          messageText: "Yeah, I sent it earlier today.",
          userId: "user_3",
          conversationId: "conv_2",
          createdAt: "2024-10-07T11:02:00Z",
        },
      },
    },
  ];

  //   if (!sessionData) notFound();
  return (
    <div className="flex h-screen w-full">
      <div className="border-secondaryBackground bg-secondaryBackground flex h-full w-full max-w-xs grow flex-col gap-y-5 overflow-y-auto border-r px-6">
        <Link
          href={"/dashboard"}
          className="flex h-16 shrink-0 items-center font-semibold"
        >
          <MdOutlineConnectedTv className="mr-2 h-10 w-10" /> Domagoj Chat App
        </Link>
        <div className="text-secondaryText text-xs font-semibold leading-6">
          Your chats
        </div>

        <nav className="flex flex-1 flex-col">
          <ul role="list" className="mb-2 flex flex-1 flex-col gap-y-3">
            {chats.map((chat, index) => {
              return (
                <li key={index}>
                  <Link
                    href={`/dashboard/chat/${chat.conversationId}`}
                    className="text-primaryText hover:border-primaryHover hover:bg-primaryHover hover:text-secondaryText flex rounded-md p-1 font-semibold transition hover:cursor-pointer"
                  >
                    {chat.name}
                  </Link>
                </li>
              );
            })}
            <li>
              <div className="text-secondaryText mt-4 text-xs font-semibold leading-6">
                Overview
              </div>

              <ul role="list" className="-mx-2 mt-2 space-y-1">
                <li>
                  <Link
                    href={"/dashboard/add"}
                    className="hover:bg-primaryHover hover:text-secondaryText group flex gap-3 rounded-md p-2 text-sm font-semibold leading-6 transition"
                  >
                    <span className="border-primaryText bg-background text-primaryText group-hover:border-secondaryText group-hover:bg-primaryHover group-hover:text-secondaryText flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium">
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
                className="border-primaryText bg-background text-primaryText hover:border-secondaryText hover:bg-primaryHover hover:text-secondaryText flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium transition hover:cursor-pointer"
              >
                <FiMoon className="h-5 w-5" />
              </div>
              <div className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-700">
                Username: {sessionData?.user.username}
              </div>

              <Link
                href={"/api/auth/signout"}
                className="border-primaryText bg-background hover:border-secondaryText hover:bg-primaryHover hover:text-secondaryText flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium transition hover:text-indigo-600"
              >
                <TbLogout className="h-5 w-5" />
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {children}
    </div>
  );
};

export default DashboardLayout;
