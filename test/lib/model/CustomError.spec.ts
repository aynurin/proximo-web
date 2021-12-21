import CustomError from "lib/model/CustomError";

describe('CustomError', () => {
  it('should extend Error', () => {
    const message = "my message";
    const context = { ctx: "this context" };
    const err = new CustomError(message, context);
    expect(err).toBeInstanceOf(Error);
    expect(err.context['ctx']).toBeTruthy();
    expect(err.context['ctx']).toBe(context.ctx);
    expect(err.message).toBe(message);
  });
});
