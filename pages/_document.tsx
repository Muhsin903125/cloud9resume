import { Html, Head, Main, NextScript } from "next/document";
import icon from "../public/logo-icon.png";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href={icon.src} />
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
