import React from "react";
import ChatInput from "~/components/ChatInput";
import Messages from "~/components/Messages";

interface PageProps {
  params: {
    chatId: string;
  };
}

const messages = [
  {
    id: "msg_1",
    messageText: "Hey Bob, how’s it going?",
    userId: "user_1",
    conversationId: "conv_1",
    createdAt: "2024-10-07T10:01:00Z",
    user: {
      id: "user_1",
      name: "Alice Johnson",
      username: "alicej",
    },
  },
  {
    id: "msg_2",
    messageText: "Doing well, Alice! How about you?",
    userId: "user_2",
    conversationId: "conv_1",
    createdAt: "2024-10-07T10:02:00Z",
    user: {
      id: "user_2",
      name: "Bob Smith",
      username: "bobsmith",
    },
  },
];

const Chat = ({ params }: PageProps) => {
  return (
    <div className="flex h-full max-h-[calc(100vh-4rem)] flex-1 flex-col justify-between">
      <div className="flex justify-between border-b-2 border-gray-200 py-3 sm:items-center">
        <div className="relative flex items-center space-x-4">
          <div className="relative"></div>
          <div className="flex flex-col leading-tight">
            <div className="flex items-center text-xl">
              <span className="mr-3 font-semibold text-gray-700">
                Chat partner name
              </span>
            </div>
            <span className="text-sm text-gray-600">Chat partner email</span>
          </div>
        </div>
      </div>

      <Messages />
      <ChatInput chatPartner="Miljenko" />
    </div>
  );
};

export default Chat;
