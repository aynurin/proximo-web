import { TranTemplate } from './model/tran-template';

export interface State {
  schedule: TranTemplate[];
  accounts: string[];
}

export const initialState: State = {
    schedule: [],
    accounts: []
};
