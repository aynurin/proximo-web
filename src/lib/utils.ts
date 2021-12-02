
export function isNonEmptyString(val: null | string) {
  return val != null && typeof val === "string" && val.length > 0;
}

export function interfaceString(val: object) {
  if (val == null) {
    return "(null)";
  } else {
    return "{ " + Object.keys(val).map(x => x + ": " + (x == "_typeName" ? JSON.stringify(val[x]) : typeof val[x])).join(", ") + " }";
  }
}

export function waitForHtmlElement(elementId: string, action: (element: HTMLElement) => any) {
    let element = document.getElementById(elementId);
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
