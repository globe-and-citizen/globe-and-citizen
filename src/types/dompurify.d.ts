declare module "dompurify" {
  interface DOMPurifyI {
    sanitize(dirty: string, options?: object): string;
  }
  const DOMPurify: DOMPurifyI;
  export default DOMPurify;
}
