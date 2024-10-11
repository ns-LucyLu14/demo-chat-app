# Chat App Project - Powered by T3 stack

Welcome to my personal Chat App demo project (work in progress...)

This is a [T3 Stack](https://create.t3.gg/) powered app bootstrapped with `create-t3-app`.

## How to get started

To run this app on your local machine, first you need to clone this repository to your machine.

```
mkdir your-folder-name
cd your-folder-name
git clone https://github.com/ns-LucyLu14/chat-app-project.git
cd chat-app-project
```

We will be using Node Version Manager version 18 and yarn for this project. Please make sure you have `nvm` and `yarn` installed on your machine before you run the following command

```
nvm use 18
```

Run install command to install dependencies

```
yarn
```

Setup environment variables

```
cp .env.example .env
```

Setup Prisma database for local development

```
yarn db:push
```

Run the app

```
yarn dev
```

Visit `http://localhost:3000` on your browser and enjoy! 🔥

## Chat App Stack

If you are not familiar with the different technologies used in this project, please refer to the respective docs.

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!
