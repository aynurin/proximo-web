export {};

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeAProperSchedule(): R;
    }
  }
}
