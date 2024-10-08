import { useRouter } from "next/router";
import React from "react";

type ChatPageProps = {};

const ChatPage = (props: ChatPageProps) => {
  const router = useRouter();
  const { chatId } = router.query;
  return <div>Chat room {chatId}</div>;
};

export default ChatPage;
