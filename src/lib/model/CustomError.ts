

export default class CustomError extends Error {
  constructor(message: string, public readonly context: unknown = null) {
    super(message);
  }
}
