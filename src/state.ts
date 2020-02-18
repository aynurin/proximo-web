import { TranTemplate } from './model/tran-template';
import { AccountBalance } from './model/account-balance';

export interface State {
  schedule: TranTemplate[];
  accounts2: AccountBalance[];
  accounts: string[];
}

export const initialState: State = {
    schedule: [],
    accounts: [],
    accounts2: []
};
