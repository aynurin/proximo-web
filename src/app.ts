import { Store, connectTo } from 'aurelia-store';
import * as State from './state';
import { TranStateActions } from './model/tran-actions';

@connectTo()
export class App {
  message = "FinForecast";
  accounts: string[] = [];

  public state: State.State;

  public constructor(private store: Store<State.State>) {
    let tranActions = new TranStateActions(this.store);
    tranActions.register();
  }
}
