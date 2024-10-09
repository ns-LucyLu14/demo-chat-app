import { observable } from "@trpc/server/observable";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  findOne: protectedProcedure
    .input(z.object({ username: z.string().nullable() }))
    .query(({ input, ctx }) => {
      return ctx.db.user.findFirst({
        where: { username: input.username },
      });
    }),

  create: publicProcedure
    .input(z.object({ name: z.string().min(1), username: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.create({
        data: {
          name: input.name,
          username: input.username,
          email: null,
          theme: "light",
        },
      });
    }),

  changeUserTheme: protectedProcedure
    .input(z.object({ theme: z.enum(["light", "dark"]) }))
    .mutation(({ input: { theme }, ctx }) => {
      return ctx.db.user.update({
        data: {
          theme,
        },
        where: {
          id: ctx.session.user.id,
        },
        select: {
          id: true,
          theme: true,
        },
      });
    }),

  changeUserNickname: protectedProcedure
    .input(z.object({ nickname: z.string() }))
    .mutation(async ({ input: { nickname }, ctx }) => {
      await ctx.db.$transaction(async (trx) => {
        await trx.user.update({
          data: {
            nickname,
          },
          where: {
            id: ctx.session.user.id,
          },
        });
      });

      ctx.ee.emit("changeNickname", {
        nickname,
        userId: ctx.session.user.id,
      });

      return nickname;
    }),

  onChangeUserNickname: protectedProcedure.subscription(({ ctx }) => {
    return observable<{ nickname: string }>((emit) => {
      const onChangeNickname = (data: { nickname: string; userId: string }) => {
        if (data.userId !== ctx.session.user.id) {
          emit.next({ nickname: data.nickname });
        }
      };
      ctx.ee.on("changeNickname", onChangeNickname);

      return () => {
        ctx.ee.off("changeNickname", onChangeNickname);
      };
    });
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
