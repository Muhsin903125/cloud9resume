import { Html, Head, Main, NextScript } from "next/document";
import { getAssetUrl } from "../lib/common-functions";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href={getAssetUrl("/logo-icon.png")} />
        <meta
          name="description"
          content="Cloud9Profile - Create your ATS-friendly resume in minutes."
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
