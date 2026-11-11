/** An error with an HTTP status and a code that the client translates into a message. */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
  ) {
    super(code);
  }
}
