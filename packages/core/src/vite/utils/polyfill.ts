import {
  File as NodeFile,
  fetch as nodeFetch,
  FormData as NodeFormData,
  Headers as NodeHeaders,
  Request as NodeRequest,
  Response as NodeResponse,
} from "@remix-run/web-fetch";

export function installPolyfills() {
  global.File = NodeFile;

  global.Headers = NodeHeaders as unknown as typeof Headers;
  global.Request = NodeRequest as typeof Request;
  global.Response = NodeResponse as unknown as typeof Response;
  global.fetch = nodeFetch as typeof fetch;
  global.FormData = NodeFormData;
}
