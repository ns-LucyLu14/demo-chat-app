import React, { useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import Button from "./Button";
import { api } from "~/utils/api";
import { useTheme } from "next-themes";
import { FiSend } from "react-icons/fi";

type ChatPartner = {
  id: string;
  username: string | null;
  name: string | null;
  image: string | null;
  nickname: string | null;
} | null;

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

type ChatInputProps = {
  chatPartner: ChatPartner;
  conversationId: string;
  handleRefetchMessages: () => void;
  lastMessage: Message;
};

const replaceIcons = {
  smiley: "😊",
  wink: "😉",
};

const ChatInput = ({
  chatPartner,
  conversationId,
  handleRefetchMessages,
  lastMessage,
}: ChatInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [input, setInput] = useState<string>("");
  const { setTheme } = useTheme();
  const sendMessageMutation = api.chat.sendMessage.useMutation();
  const changeUserNicknameMutation = api.user.changeUserNickname.useMutation();
  const deleteMessageMutation = api.chat.delete.useMutation();
  const updateMessageMutation = api.chat.update.useMutation();

  const changeUserThemeMutation = api.user.changeUserTheme.useMutation();

  const isTyping = api.chat.isTyping.useMutation();

  const sendMessage = () => {
    if (!input.trim()) return;

    const isLightCommand = /^\/light\b/.test(input.trim());

    if (isLightCommand) {
      changeUserThemeMutation.mutate(
        {
          theme: "light",
        },
        {
          onSuccess: () => {
            setInput("");
            textareaRef.current?.focus();
            isTyping.mutate({ typing: false, userId: chatPartner!.id });
            setTheme("light");
          },
        },
      );

      return;
    }

    const isDarkCommand = /^\/dark\b/.test(input.trim());

    if (isDarkCommand) {
      changeUserThemeMutation.mutate(
        {
          theme: "dark",
        },
        {
          onSuccess: () => {
            setInput("");
            textareaRef.current?.focus();
            isTyping.mutate({ typing: false, userId: chatPartner!.id });
            setTheme("dark");
          },
        },
      );

      return;
    }

    const isDeleteCommand = /^\/oops\b/.test(input.trim());

    if (isDeleteCommand) {
      deleteMessageMutation.mutate(
        {
          messageId: lastMessage.id,
          userId: chatPartner!.id,
        },
        {
          onSuccess: () => {
            setInput("");
            textareaRef.current?.focus();
            isTyping.mutate({ typing: false, userId: chatPartner!.id });
            handleRefetchMessages();
          },
        },
      );
      return;
    }

    const isEditCommand = /^\/edit\b/.test(input.trim());

    if (isEditCommand) {
      const parts = input.trim().split(/^\/edit\s+/);
      const newMessageText = parts[1]?.trim();
      if (newMessageText) {
        updateMessageMutation.mutate(
          {
            messageId: lastMessage.id,
            newMessageText: newMessageText,
            userId: chatPartner!.id,
          },
          {
            onSuccess: () => {
              setInput("");
              textareaRef.current?.focus();
              isTyping.mutate({ typing: false, userId: chatPartner!.id });
              handleRefetchMessages();
            },
          },
        );
      }

      return;
    }

    const isNicknameCommand = /^\/nick\b/.test(input.trim());

    if (isNicknameCommand) {
      const parts = input.trim().split(/^\/nick\s+/);
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
              isTyping.mutate({ typing: false, userId: chatPartner!.id });
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
    <div className="border-t border-secondaryBackground p-4 px-2 sm:mb-0">
      <div className="relative flex flex-1 overflow-hidden rounded-lg shadow-sm ring-1 ring-inset ring-secondaryBackground">
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
          className="block w-full resize-none border-0 bg-transparent text-primaryText placeholder:text-gray-400 sm:p-1.5 sm:text-sm sm:leading-6"
        />
      </div>
      <div className="flex justify-between">
        <div className="absolute bottom-0 right-0 mb-2 mr-2 flex-shrink-0">
          <Button onClick={sendMessage} title="Send">
            <FiSend className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
