import { TranTemplate, TranGenerated } from 'lib/model/tran-template';
import { AccountBalance } from 'lib/model/account-balance';
import { IContainerInfo } from 'lib/model/intro-container';

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
