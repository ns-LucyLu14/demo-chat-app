import React, { useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import Button from "./Button";

type ChatInputProps = {
  chatPartner: string;
};

const replaceIcons = {
  smiley: "😊",
  wink: "😉",
};

const ChatInput = ({ chatPartner }: ChatInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [input, setInput] = useState<string>("");
  const sendMessage = () => {};

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let value = e.target.value;
    value = value.replace(/(:\))/g, replaceIcons.smiley);
    value = value.replace(/(;\))/g, replaceIcons.wink);
    setInput(value);
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
          placeholder={`Send a message to ${chatPartner}...`}
          className="block w-full resize-none border-0 bg-transparent text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:p-1.5 sm:text-sm sm:leading-6"
        />
      </div>
      <div className="absolute bottom-0 right-0 flex justify-between px-4 py-4">
        <div className="flex-shrink-0">
          <Button title="Send" />
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
