import { TranSchedule } from './tran-schedule';

export class App {
  message = "FinForecast";
  schedule: TranSchedule[] = [];
  accounts: string[] = []
  newTran: TranSchedule = new TranSchedule();

  addTran(tran: TranSchedule) {
    const newTran = TranSchedule.isEmpty(tran) ? this.newTran : tran;
    if (!TranSchedule.isEmpty(newTran)) {
      this.schedule.push(newTran);
      if (this.accounts.find(acc => acc == newTran.account) == null) {
        this.accounts.push(newTran.account)
      }
      this.newTran = new TranSchedule();
      this.accounts.sort((a, b) => a.localeCompare(b));
    }
  }

  removeTran(tran: TranSchedule) {
    let index = this.schedule.indexOf(tran);
    if (index !== -1) {
      this.schedule.splice(index, 1);
    }
  }
}
