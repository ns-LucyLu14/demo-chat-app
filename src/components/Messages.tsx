import React, { useRef, useState } from "react";
import { api } from "~/utils/api";

interface User {
  username: string | null;
}

interface Message {
  id: string;
  userId: string;
  conversationId: string;
  messageText: string;
  createdAt: Date;
  crazy: boolean | null;
  user: User;
}

interface MessagesProps {
  messages: Message[];
  currentUserId?: string;
}

const Messages = ({ messages, currentUserId }: MessagesProps) => {
  const scrollDownRef = useRef<HTMLDivElement | null>(null);

  const [currentlyTyping, setCurrentlyTyping] = useState<string[]>([]);
  api.chat.whoIsTyping.useSubscription(undefined, {
    onData: (data) => {
      setCurrentlyTyping(data);
    },
  });

  return (
    <div
      id="messages"
      className={`scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch relative flex h-full flex-1 flex-col-reverse gap-4 overflow-y-auto p-3`}
    >
      <div ref={scrollDownRef} />
      {!!currentlyTyping.length && (
        <div className="self-end rounded-lg bg-gray-300/50 px-1.5 py-0.5 text-sm">{`${currentlyTyping} is typing...`}</div>
      )}
      {messages.length ? (
        messages.map((message) => (
          <div
            key={message.id}
            className={`dark flex min-w-56 max-w-sm flex-col flex-wrap rounded-md ${message.crazy ? "bg-crazyBackground" : "bg-secondaryBackground"} p-4 ${message.userId === currentUserId ? "sm:self-end" : "sm:self-start"}`}
          >
            <div
              className={`${message.crazy ? "text-crazySecondaryText" : "text-primaryText"} text-sm font-semibold`}
            >
              {message.user.username}
            </div>

            <div className="flex flex-grow flex-col justify-between">
              <div
                className={`${message.crazy ? "text-crazyPrimaryText" : "text-secondaryText"} text-sm`}
              >
                {message.messageText}
              </div>
              <span
                className={`ml-auto pt-1 text-xs ${message.crazy ? "text-crazySecondaryText" : "text-tertiaryText"}`}
              >
                {new Date(message.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        ))
      ) : (
        <div className="absolute left-0 right-0 top-0 p-10 text-center">
          <p className="text-tertiaryText sm:text-xl md:text-2xl lg:text-4xl">
            📨 Start a conversation by sending a message 📨
          </p>
          <p className="mt-5 text-xl text-tertiaryText opacity-80">
            ...why be shy, be the one who initiates the first contact...
          </p>
        </div>
      )}
    </div>
  );
};

export default Messages;
