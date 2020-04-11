import { TranTemplate, TranGenerated } from 'model/tran-template';
import { AccountBalance } from 'model/account-balance';
import { IContainerInfo } from 'model/intro-container';

export interface State {
  schedule: TranTemplate[];
  scheduleVersion: number;
  accounts2: AccountBalance[];
  ledger: TranGenerated[];
  introContainers: IContainerInfo[];
}

export const initialState: State = {
  schedule: [],
  scheduleVersion: 0,
  accounts2: [],
  ledger: [],
  introContainers: [],
};
