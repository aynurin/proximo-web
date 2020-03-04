import { TranTemplate } from './model/tran-template';
import { AccountBalance } from './model/account-balance';

export interface State {
  schedule: TranTemplate[];
  scheduleVersion: number;
  accounts2: AccountBalance[];
}

export const initialState: State = {
    schedule: [],
    scheduleVersion: 0,
    accounts2: []
};
