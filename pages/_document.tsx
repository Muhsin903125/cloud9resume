import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/logo-icon.png?v=2" />
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
