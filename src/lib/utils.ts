import CustomError from "./model/CustomError";

export function isNonEmptyString(val: null | string) {
  return val != null && typeof val === "string" && val.length > 0 && lenTrimmed(val) > 0;
}

export function lenTrimmed(val: string) {
  if (val == null) {
    return 0;
  }
  if (typeof val !== "string") {
    throw new CustomError("lenTrimmed works only with strings");
  }
  return val.trim().length;
}

export function isValidNumber(val: null | number) {
  return val != null && typeof val === "number" && !isNaN(val)
}

export function interfaceDesc(val: object): string {
  if (val == null) {
    return "(null)";
  } else {
    return "{ " + Object.keys(val).map(x => x + ": " + (x == "_typeName" ? JSON.stringify(val[x]) : typeof val[x])).join(", ") + " }";
  }
}

export function firstOfTheMonth(date: Date = null): Date {
  if (date == null) {
    date = new Date();
  }
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function waitForHtmlElement(elementId: string, action: (element: HTMLElement) => any) {
    const element = document.getElementById(elementId);
    if (element) {
        action(element);
    } else {
        window.setTimeout(() => {
            waitForHtmlElement(elementId, action);
        }, 100);
    }
}

export function waitForDelay(delayMs: number, action: () => any) {
    window.setTimeout(action, delayMs);
}

export function waitFor(checker: () => boolean, action: () => any) {
    if (checker()) {
        setTimeout(action,0);
    } else {
        window.setTimeout(() => {
            waitFor(checker, action);
        }, 100);
    }
}
