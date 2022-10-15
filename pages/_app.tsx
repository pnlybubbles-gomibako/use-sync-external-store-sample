import type { AppProps } from "next/app";
import dynamic from "next/dynamic";
import React from "react";

const NoSSR = dynamic(
  () =>
    Promise.resolve(({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    )),
  {
    ssr: false,
  }
);

const App = ({ Component, pageProps }: AppProps) => (
  <NoSSR>
    <Component {...pageProps} />
  </NoSSR>
);

export default App;
