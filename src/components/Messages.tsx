import React, { useRef } from "react";

interface MessageProps {}

const Messages = (props: MessageProps) => {
  const scrollDownRef = useRef<HTMLDivElement | null>(null);
  return (
    <div
      id="messages"
      className="scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch flex h-full flex-1 flex-col-reverse gap-4 overflow-y-auto p-3"
    >
      <div ref={scrollDownRef} />
      {}
      <div className="bg-secondaryBackground dark flex max-w-sm flex-wrap rounded-md p-4">
        <div className="text-primaryText text-sm underline">Domagoj</div>

        <div className="flex flex-grow flex-col justify-between">
          <div className="text-testText text-secondaryText pt-2 text-sm">
            message text lets make it big so hopefully it goes to another line
          </div>
          <span className="text-tertiaryText ml-auto text-xs">time</span>{" "}
        </div>
      </div>
    </div>
  );
};

export default Messages;
