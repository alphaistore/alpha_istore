// frontend/pages/_document.js
import Document, { Html, Head, Main, NextScript } from 'next/document';
import siteConfig from '../config';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en" className="scroll-smooth">
        <Head>
          <meta charSet="UTF-8" />
          <meta name="description" content={siteConfig.description} />
          <meta name="theme-color" content={siteConfig.themeColor} />
        </Head>
        <body className="bg-surface-muted text-ink">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;