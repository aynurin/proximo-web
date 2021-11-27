export class TrimSpaceValueConverter {
  fromView(val: string) {
    if (!val) return null;
    return val.trim();
  }
}
