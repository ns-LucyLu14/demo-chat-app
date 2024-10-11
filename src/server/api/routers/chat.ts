import { observable } from "@trpc/server/observable";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

const currentlyTyping: Record<string, { lastTyped: Date; userId: string }> =
  Object.create(null);

export const chatRouter = createTRPCRouter({
  // delete if not needed
  conversations: protectedProcedure.query(({ ctx }) => {
    return ctx.db.conversationUser.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      include: {
        conversation: {
          include: {
            conversationUsers: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                    username: true,
                  },
                },
              },
            },
            lastMessage: true,
          },
        },
      },
      orderBy: {
        conversation: {
          lastMessageId: "desc",
        },
      },
    });
  }),
  findConversation: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input: { userId }, ctx }) => {
      const conversationUsers = await ctx.db.conversationUser.groupBy({
        by: ["conversationId"],
        where: {
          userId: {
            in: [userId, ctx.session.user.id],
          },
        },
        having: {
          userId: {
            _count: {
              equals: 2,
            },
          },
        },
      });

      return conversationUsers.length
        ? conversationUsers[0]?.conversationId
        : null;
    }),
  getChatPartner: protectedProcedure
    .input(z.object({ conversationId: z.string() }))
    .query(async ({ input: { conversationId }, ctx }) => {
      // Ensure the current user is part of the conversation
      await ctx.db.conversationUser.findUniqueOrThrow({
        where: {
          userId_conversationId: {
            userId: ctx.session.user.id,
            conversationId,
          },
        },
      });

      const chatPartner = await ctx.db.conversationUser.findFirst({
        where: {
          conversationId,
          userId: {
            not: {
              equals: ctx.session.user.id,
            },
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
              nickname: true,
            },
          },
        },
      });

      return chatPartner?.user ?? null;
    }),

  messages: protectedProcedure
    .input(z.object({ conversationId: z.string() }))
    .query(async ({ input: { conversationId }, ctx }) => {
      await ctx.db.conversationUser.findUniqueOrThrow({
        where: {
          userId_conversationId: {
            userId: ctx.session.user.id,
            conversationId,
          },
        },
      });
      return ctx.db.message.findMany({
        where: {
          conversationId,
        },
        orderBy: {
          id: "desc",
        },
        include: {
          user: {
            select: {
              username: true,
            },
          },
        },
      });
    }),

  sendMessage: protectedProcedure
    .input(
      z.object({
        conversationId: z.string().nullish(),
        messageText: z.string(),
        userId: z.string().nullish(),
        crazy: z.boolean(),
      }),
    )
    .mutation(
      async ({
        input: { messageText, conversationId, userId, crazy },
        ctx,
      }) => {
        // countdown logic
        const countdownRegex = /^\/countdown\s+(\d+)\s+(https?:\/\/[^\s]+)/;
        const countdownMatch = messageText.match(countdownRegex);

        if (countdownMatch) {
          const countdownTime = parseInt(countdownMatch[1] as string, 10); // countdown time in seconds
          const countdownUrl = countdownMatch[2] as string; // url to open

          ctx.ee.emit("countdown", {
            conversationId: conversationId as string,
            userId: userId as string, // recipient user
            countdownTime,
            countdownUrl,
          });

          return;
        }
        if (!conversationId) {
          if (!userId) {
            throw new Error("No recipient passed");
          }

          return ctx.db.$transaction(async (trx) => {
            const conversation = await trx.conversation.create({
              data: {
                messages: {
                  create: {
                    messageText,
                    userId: ctx.session.user.id,
                    crazy,
                  },
                },
                conversationUsers: {
                  createMany: {
                    data: [{ userId }, { userId: ctx.session.user.id }],
                  },
                },
              },
              include: {
                messages: true,
              },
            });

            await trx.conversation.update({
              data: {
                lastMessageId: conversation.messages[0]!.id,
              },
              where: {
                id: conversation.id,
              },
            });

            ctx.ee.emit("sendMessage", {
              conversationId: conversation.id,
              userId,
            });

            return conversation;
          });
        }

        await ctx.db.$transaction(async (trx) => {
          const [message] = await Promise.all([
            trx.message.create({
              data: {
                messageText,
                userId: ctx.session.user.id,
                conversationId,
                crazy,
              },
            }),
            trx.conversationUser.findUniqueOrThrow({
              where: {
                userId_conversationId: {
                  userId: ctx.session.user.id,
                  conversationId,
                },
              },
            }),
          ]);

          await trx.conversation.update({
            data: {
              lastMessageId: message.id,
            },
            where: {
              id: conversationId,
            },
          });
        });

        const user = await ctx.db.conversationUser.findFirst({
          where: {
            conversationId,
            NOT: {
              userId: ctx.session.user.id,
            },
          },
          select: {
            userId: true,
          },
        });

        ctx.ee.emit("sendMessage", { conversationId, userId: user!.userId });
      },
    ),

  connectUser: protectedProcedure
    .input(z.object({ username: z.string() }))
    .mutation(async ({ input: { username }, ctx }) => {
      const currentUserId = ctx.session.user.id;

      // Find the user by their username
      const userToConnect = await ctx.db.user.findUnique({
        where: { username },
      });

      if (!userToConnect) {
        throw new Error("User not found");
      }

      if (userToConnect.id === currentUserId) {
        throw new Error("You cannot connect with yourself");
      }

      // Check if a conversation already exists between the users
      const existingConversation = await ctx.db.conversationUser.findFirst({
        where: {
          userId: currentUserId,
          conversation: {
            conversationUsers: {
              some: { userId: userToConnect.id },
            },
          },
        },
        include: {
          conversation: true,
        },
      });

      if (existingConversation) {
        return existingConversation.conversation;
      }

      //   if (existingConversation) {
      //     throw new Error("You are already connected with this user");
      //   }

      // No existing conversation, create a new one
      const newConversation = await ctx.db.conversation.create({
        data: {
          conversationUsers: {
            createMany: {
              data: [{ userId: currentUserId }, { userId: userToConnect.id }],
            },
          },
        },
      });

      return newConversation;
    }),

  connectedUsers: protectedProcedure.query(async ({ ctx }) => {
    const currentUserId = ctx.session.user.id;

    const conversations = await ctx.db.conversationUser.findMany({
      where: { userId: currentUserId },
      include: {
        conversation: {
          include: {
            conversationUsers: {
              where: {
                NOT: {
                  userId: currentUserId,
                },
              },
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                    username: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Return the list of connected users
    return conversations.map((conversation) => {
      const connectedUser = conversation.conversation.conversationUsers[0].user;
      return {
        id: connectedUser.id,
        name: connectedUser.name,
        image: connectedUser.image,
        username: connectedUser.username,
        conversationId: conversation.conversation.id, // Add conversationId here
      };
    });
  }),

  onSendMessage: protectedProcedure.subscription(({ ctx }) => {
    return observable<{ conversationId: string }>((emit) => {
      const onSendMessage = (data: {
        conversationId: string;
        userId: string;
      }) => {
        if (data.userId === ctx.session.user.id) {
          emit.next({ conversationId: data.conversationId });
        }
      };
      ctx.ee.on("sendMessage", onSendMessage);

      return () => {
        ctx.ee.off("sendMessage", onSendMessage);
      };
    });
  }),

  isTyping: protectedProcedure
    .input(z.object({ typing: z.boolean(), userId: z.string() }))
    .mutation(({ ctx, input }) => {
      if (input.userId === ctx.session.user.id) {
        console.log("hello");
        return;
      }
      const username = ctx.session.user.username;

      // every 1s, clear old "isTyping"
      const interval = setInterval(() => {
        let updated = false;
        const now = Date.now();
        for (const [key, value] of Object.entries(currentlyTyping)) {
          if (now - value.lastTyped.getTime() > 3e3) {
            delete currentlyTyping[key];
            updated = true;
          }
        }
        if (updated) {
          ctx.ee.emit("isTypingUpdate");
        }
      }, 3e3);
      process.on("SIGTERM", () => {
        clearInterval(interval);
      });
      if (!input.typing) {
        delete currentlyTyping[username];
      } else {
        currentlyTyping[username] = {
          lastTyped: new Date(),
          userId: input.userId,
        };
      }
      ctx.ee.emit("isTypingUpdate");
    }),

  whoIsTyping: publicProcedure.subscription(({ ctx }) => {
    let prev: string[] | null = null;
    return observable<string[]>((emit) => {
      const onIsTypingUpdate = () => {
        const newData = Object.keys(currentlyTyping).filter(
          (username) =>
            currentlyTyping[username]?.userId === ctx.session?.user.id,
        );

        if (!prev || prev.toString() !== newData.toString()) {
          emit.next(newData);
        }
        prev = newData;
      };
      ctx.ee.on("isTypingUpdate", onIsTypingUpdate);
      return () => {
        ctx.ee.off("isTypingUpdate", onIsTypingUpdate);
      };
    });
  }),

  delete: protectedProcedure
    .input(z.object({ messageId: z.string(), userId: z.string() }))
    .mutation(async ({ input: { messageId, userId }, ctx }) => {
      const deletedMessage = await ctx.db.message.delete({
        where: {
          id: messageId,
        },
      });

      ctx.ee.emit("deleteMessage", { userId });

      return deletedMessage;
    }),

  update: protectedProcedure
    .input(
      z.object({
        messageId: z.string(),
        newMessageText: z.string().min(1),
        userId: z.string(),
      }),
    )
    .mutation(async ({ input: { messageId, newMessageText, userId }, ctx }) => {
      const message = await ctx.db.message.findUnique({
        where: {
          id: messageId,
        },
        select: {
          userId: true, // Ensure we get the userId to check ownership
        },
      });

      if (!message) {
        throw new Error("Message not found");
      }

      if (message.userId !== ctx.session.user.id) {
        throw new Error("You are not authorized to update this message");
      }

      const updatedMessage = await ctx.db.message.update({
        where: {
          id: messageId,
        },
        data: {
          messageText: newMessageText,
        },
      });

      ctx.ee.emit("sendMessage", {
        conversationId: updatedMessage.conversationId,
        userId,
      });

      return updatedMessage;
    }),

  onDelete: protectedProcedure.subscription(({ ctx }) => {
    return observable<{ userId: string }>((emit) => {
      const onDelete = (data: { userId: string }) => {
        if (data.userId === ctx.session.user.id) {
          emit.next({ userId: data.userId });
        }
      };
      ctx.ee.on("deleteMessage", onDelete);

      return () => {
        ctx.ee.off("deleteMessage", onDelete);
      };
    });
  }),

  onCountdown: protectedProcedure.subscription(({ ctx }) => {
    return observable<{ countdownTime: number; countdownUrl: string }>(
      (emit) => {
        const onCountdown = (data: {
          conversationId: string;
          userId: string;
          countdownTime: number;
          countdownUrl: string;
        }) => {
          if (data.userId === ctx.session.user.id) {
            emit.next({
              countdownTime: data.countdownTime,
              countdownUrl: data.countdownUrl,
            });
          }
        };
        ctx.ee.on("countdown", onCountdown);

        return () => {
          ctx.ee.off("countdown", onCountdown);
        };
      },
    );
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
