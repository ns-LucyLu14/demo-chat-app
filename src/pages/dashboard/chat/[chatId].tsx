import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React from "react";
import ChatInput from "~/components/ChatInput";
import Messages from "~/components/Messages";
import { createTRPCContext } from "~/server/api/trpc";
import { api } from "~/utils/api";

interface PageProps {
  params: {
    chatId: string;
  };
}

const Chat = ({ params }: PageProps) => {
  const { data: sessionData } = useSession();
  const router = useRouter();
  const utils = api.useUtils();

  const conversationId = router.query.chatId as string;
  const {
    data: messages,
    // isLoading: loadingMessages,
    error: errorFetchingMessages,
    refetch: refetchMessages,
  } = api.chat.messages.useQuery(
    { conversationId },
    {
      enabled: !!conversationId,
    },
  );

  const {
    data: chatPartner,
    // isLoading: loadingChatPartner,
    error: errorFetchingChatPartner,
    refetch: refetchChatPartner,
  } = api.chat.getChatPartner.useQuery(
    { conversationId },
    { enabled: !!conversationId },
  );

  //   if (loadingConversationId || loadingMessages) {
  //     return <div>Loading...</div>;
  //   }

  api.chat.onSendMessage.useSubscription(undefined, {
    onData: () => {
      refetchMessages();
    },
  });

  api.user.onChangeUserNickname.useSubscription(undefined, {
    onData: () => {
      refetchChatPartner();
    },
  });

  if (
    errorFetchingChatPartner ||
    errorFetchingMessages ||
    !conversationId ||
    !messages
  ) {
    return <div>Error loading conversation</div>;
  }
  return (
    <>
      {chatPartner && conversationId && (
        <div className="flex h-full max-h-[calc(100vh-4rem)] flex-1 flex-col justify-between">
          <div className="flex justify-between border-b-2 border-gray-200 py-3 sm:items-center">
            <div className="relative flex items-center space-x-4">
              <div className="relative"></div>
              <div className="flex flex-col leading-tight">
                <div className="flex items-center text-xl">
                  <span className="mr-3 font-semibold text-gray-700">
                    {chatPartner.name}
                  </span>
                </div>
                <span className="text-sm text-gray-600">
                  {chatPartner.nickname}
                </span>
              </div>
            </div>
          </div>

          <Messages messages={messages} currentUserId={sessionData?.user.id} />
          <ChatInput
            chatPartner={chatPartner}
            conversationId={conversationId}
            handleRefetchMessages={refetchMessages}
          />
        </div>
      )}
    </>
  );
};

export default Chat;
