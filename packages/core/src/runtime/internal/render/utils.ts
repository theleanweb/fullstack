export function readableStreamFromAsyncIterable(output: AsyncIterableIterator<any>) {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      while (true) {
        const { done, value } = await output.next();

        if (done) {
          controller.close();
          break;
        }

        controller.enqueue(encoder.encode(value));
      }
    },
  });
}
export function is_promise(value: any): value is Promise<any> {
  return (
    !!value &&
    (typeof value === "object" || typeof value === "function") &&
    typeof value.then === "function"
  );
}
