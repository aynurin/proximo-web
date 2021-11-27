import { State } from "lib/state";


export default function migrateStateDates20211127(state: State): boolean {
  let migrated = false;
  for (let tranTemplate of state.schedule) {
    if (typeof tranTemplate.date === "string") {
      tranTemplate.date = new Date(Date.parse(tranTemplate.date));
      migrated ||= true;
    }
    if (tranTemplate.selectedSchedule.dateSince != null && typeof tranTemplate.selectedSchedule.dateSince === "string") {
      tranTemplate.selectedSchedule.dateSince = new Date(Date.parse(tranTemplate.selectedSchedule.dateSince));
      migrated ||= true;
    }
    if (tranTemplate.selectedSchedule.dateTill != null && typeof tranTemplate.selectedSchedule.dateTill === "string") {
      tranTemplate.selectedSchedule.dateTill = new Date(Date.parse(tranTemplate.selectedSchedule.dateTill));
      migrated ||= true;
    }
  }
  for (let account of state.accounts2) {
    if (account.date != null && typeof account.date === "string") {
      account.date = new Date(Date.parse(account.date));
      migrated ||= true;
    }
  }
  for (let tran of state.ledger) {
    if (tran.date != null && typeof tran.date === "string") {
      tran.date = new Date(Date.parse(tran.date));
      migrated ||= true;
    }
  }
  return migrated;
}
