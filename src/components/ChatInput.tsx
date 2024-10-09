import React, { useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import Button from "./Button";
import { api } from "~/utils/api";

type ChatPartner = {
  id: string;
  username: string | null;
  name: string | null;
  image: string | null;
  nickname: string | null;
} | null;

type ChatInputProps = {
  chatPartner: ChatPartner;
  conversationId: string;
  handleRefetchMessages: () => void;
};

const replaceIcons = {
  smiley: "😊",
  wink: "😉",
};

const ChatInput = ({
  chatPartner,
  conversationId,
  handleRefetchMessages,
}: ChatInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [input, setInput] = useState<string>("");
  const sendMessageMutation = api.chat.sendMessage.useMutation();
  const changeUserNicknameMutation = api.user.changeUserNickname.useMutation();

  const isTyping = api.chat.isTyping.useMutation();

  const sendMessage = () => {
    if (!input.trim()) return;

    const isNicknameCommand = /^\/nickname\b/.test(input.trim());

    if (isNicknameCommand) {
      const parts = input.trim().split(/^\/nickname\s+/);
      const newNickname = parts[1]?.trim();
      if (newNickname) {
        changeUserNicknameMutation.mutate(
          {
            nickname: newNickname,
          },
          {
            onSuccess: () => {
              setInput("");
              textareaRef.current?.focus();
            },
            onError: (error) => {
              console.error("Failed to send message:", error.message);
            },
          },
        );
      }

      return;
    }

    let messagePart = input;

    const isThinkCommand = /^\/think\b/.test(input.trim());

    if (isThinkCommand) {
      const parts = input.trim().split(/^\/think\s+/);
      const crazyMessage = parts[1]?.trim();
      if (crazyMessage) {
        messagePart = crazyMessage;
      }
    }

    sendMessageMutation.mutate(
      {
        conversationId: conversationId,
        messageText: messagePart,
        userId: chatPartner?.id,
        crazy: isThinkCommand,
      },
      {
        onSuccess: () => {
          setInput("");
          textareaRef.current?.focus();
          isTyping.mutate({ typing: false, userId: chatPartner!.id });
          handleRefetchMessages();
        },
        onError: (error) => {
          console.error("Failed to send message:", error.message);
        },
      },
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let value = e.target.value;
    value = value.replace(/(:\))/g, replaceIcons.smiley);
    value = value.replace(/(;\))/g, replaceIcons.wink);
    setInput(value);
    isTyping.mutate({ typing: true, userId: chatPartner!.id });
  };
  return (
    <div className="border-t border-gray-200 p-4 px-2 sm:mb-0">
      <div className="relative flex-1 overflow-hidden rounded-lg shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-indigo-600">
        <TextareaAutosize
          ref={textareaRef}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          rows={1}
          value={input}
          onChange={handleChange}
          onBlur={() =>
            isTyping.mutate({ typing: false, userId: chatPartner!.id })
          }
          placeholder={`Send a message to ${chatPartner?.name}...`}
          className="block w-full resize-none border-0 bg-transparent text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:p-1.5 sm:text-sm sm:leading-6"
        />
      </div>
      <div className="absolute bottom-0 right-0 flex justify-between px-4 py-4">
        <div className="flex-shrink-0">
          <Button onClick={sendMessage} title="Send" />
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
