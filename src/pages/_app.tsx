import { GeistSans } from "geist/font/sans";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { ThemeProvider } from "next-themes";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import DashboardLayout from "~/components/DashboardLayout";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
  router,
}) => {
  const isDashboardRoute = router.pathname.startsWith("/dashboard");

  const getLayout = (page: React.ReactNode) => {
    return isDashboardRoute ? <DashboardLayout>{page}</DashboardLayout> : page;
  };
  return (
    <ThemeProvider defaultTheme="light">
      <SessionProvider session={session}>
        <div className={GeistSans.className}>
          {getLayout(<Component {...pageProps} />)}
        </div>
      </SessionProvider>
    </ThemeProvider>
  );
};

export default api.withTRPC(MyApp);
