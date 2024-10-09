import React, { useRef } from "react";

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

  return (
    <div
      id="messages"
      className={`scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch relative flex h-full flex-1 flex-col-reverse gap-4 overflow-y-auto p-3`}
    >
      <div ref={scrollDownRef} />
      {messages.length ? (
        messages.map((message) => (
          <div
            key={message.id}
            className={`dark flex min-w-56 max-w-sm flex-col flex-wrap rounded-md bg-secondaryBackground p-4 ${message.userId === currentUserId ? "sm:self-end" : "sm:self-start"}`}
          >
            <div className="text-sm text-primaryText underline">
              {message.user.username}
            </div>

            <div className="flex flex-grow flex-col justify-between">
              <div className="text-testText pt-2 text-sm text-secondaryText">
                {message.messageText}
              </div>
              <span className="ml-auto text-xs text-tertiaryText">
                {new Date(message.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>{" "}
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
