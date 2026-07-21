// Mock for dompurify — passthrough sanitizer for e2e tests
function DOMPurify(_window: unknown) {
  return {
    sanitize: (html: string) => html,
  };
}
export default DOMPurify;
