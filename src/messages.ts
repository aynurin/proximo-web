import { TranBuilder } from "./tran-builder";

export class TranAddRequest {
  constructor(public tran: TranBuilder) {}
}

export class TranEditRequested {
  constructor(public tran: TranBuilder) {}
}
