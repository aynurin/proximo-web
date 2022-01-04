import CustomError from "./model/CustomError";

export function isNumber(val: unknown) {
  return val != null && typeof val === "number" && !isNaN(val);
}

export function isString(val: unknown) {
  return val != null && typeof val === "string";
}

export function isNonEmptyString(val: unknown) {
  if (val != null && typeof val === "string") {
    const strVal = val as string;
    return strVal.length > 0 && lenTrimmed(strVal) > 0;
  }
  return false;
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

/**
 * @deprecated Use `isNumber` instead
 */
export function isValidNumber(val: null | number) {
  return isNumber(val);
}

export function interfaceDesc(val: object): string {
  if (val == null) {
    return "(null)";
  } else {
    return "{ " + Object.keys(val).map(x => x + ": " + (x == "_typeName" ? JSON.stringify(val[x]) : typeof val[x])).join(", ") + " }";
  }
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
