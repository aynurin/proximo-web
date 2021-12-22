export {};

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeAValidSchedule(): R;
    }
  }
}
