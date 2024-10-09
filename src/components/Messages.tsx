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
      className={`scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch flex h-full flex-1 flex-col-reverse gap-4 overflow-y-auto p-3`}
    >
      <div ref={scrollDownRef} />
      {messages ? (
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
        <div>
          <p>Start a conversation by sending a message</p>
          <p>{"Don't be shy, be the one who initiates contact"}</p>
        </div>
      )}
    </div>
  );
};

export default Messages;
