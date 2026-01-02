declare module "html-pdf-node" {
  interface PDFOptions {
    format?: string;
    printBackground?: boolean;
    margin?: {
      top?: string;
      bottom?: string;
      left?: string;
      right?: string;
    };
    landscape?: boolean;
    preferCSSPageSize?: boolean;
  }

  interface PDFFile {
    content?: string;
    url?: string;
  }

  function generatePdf(file: PDFFile, options?: PDFOptions): Promise<Buffer>;
  function generatePdfs(
    files: PDFFile[],
    options?: PDFOptions
  ): Promise<Buffer[]>;

  export = { generatePdf, generatePdfs };
}
