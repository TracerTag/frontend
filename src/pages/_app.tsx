import { type AppType } from "next/app";
import { GeistSans } from "geist/font/sans";

import { api } from "~/utils/api";

import "~/styles/globals.css";

import { cn } from "~/utils";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <div className={cn(GeistSans.className, "h-full")}>
      <Component {...pageProps} />
    </div>
  );
};

export default api.withTRPC(MyApp);
