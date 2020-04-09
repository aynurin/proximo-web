# `aurelia-app`

This project is bootstrapped by [aurelia-cli](https://github.com/aurelia/cli).

For more information, go to https://aurelia.io/docs/cli/webpack

## Todo

Guess account balances
Intro:
    * -> Dash: Welcome to PROXIMO! This is your dashboard. It shows you your financial forecast. REMEMBER: PROXIMO is not connected to your banking account, and it does not run any real transactions on your behalf. PROXIMO is a simulation tool that let's you simulate transactions that you can predict in the future. Click "Next" to look around.
        * CHART: The chart shows how your accounts will behave given the transactions schedule you create
        * TABLE: This table shows your monthly accounts and totals. You can find the mininum account balance during the month, ending balance, how much money was deposited on that account, and how much was spent. This table will highlight months when your expences exceed your income or when you have a risk of an overdraft.
        * FORM: This is where you set your current accounts balance. PROXIMO will try to guess these numbers given the schedule you define, but it is always a good idea to check again with your online bank or banking app and update here if anything is not matching.
        * SCHEDULE: Click here to see the schedule you have just defined.
    * -> Schedule: This is your schedule. It instructs PROXIMO what transactions to simulate on your accounts. You can review the schedule here, modify it, or delete a scheduled transaction. As a reminder: PROXIMO is not connected to your banking account, and it does not run any real transactions on your behalf. PROXIMO is a simulation tool that let's you simulate transactions that you can predict in the future.
        * LEDGER: Click here to have a look at your forecasted ledger
    * -> Ledger: This is your forecast. It shows transactions generated based on your schedule. It is often helpful to look into it for a detailed review and to figure our where the money went. It will highlight transactions in yellow if they make any of your accounts go below $50 or in red if they cause an overdraft.
        * ACCOUNT: This is your running balance on this account.
        * NEW TRANSACTION: Click here to plan a birthday party that will happen in several months.
            * Choose a date when it happens
            * Now tell PROXIMO how to schedule this transaction. Given this is a birthday party, it will probably happen once a year, so choose this option and click NEXT.
            * Even if this is a weekend or a holiday, PROXIMO should simulate it right on the birthday date, so let's keep this as is and click NEXT.
            * You can limit the starting and end date of a recurring transaction. Let's keep the party unlimited and click NEXT.
            * And the last part - how much you want to spend, from which account you want to pay, and let's add a description that this is a birthday party. Make sure to set it as a "Withdrawal" as this is what you will spend, and not deposit on your account, and not transfer to another one of your accounts. Click "Schedule transaction" when you are ready.
            * (HIGHLIGHT DASH, LED, FEED?) That's it. Now check out your updated Ledger and Dashboard to see how the expense that you plan to have in the future affects your accounts, and adjust if necessary. And please tell me what you think - leave your feedback!
New day UX
How to test everything? List all the scenarios at least?..
Mobile UX
Cookie consent, Google Analytics etc.
Searchable tables (lots of fun!)
Chart adjustments
Holidays
Last day of month
Undo/Redo/Create new experiment
Date Picker UX
Focus mode - next month in details
Daily notifications
Loading


BLOG idea: Hugo with theme: 

## Run dev app

Run `npm start`, then open `http://localhost:8080`

You can change the standard webpack configurations from CLI easily with something like this: `npm start -- --open --port 8888`. However, it is better to change the respective npm scripts or `webpack.config.js` with these options, as per your need.

To enable Webpack Bundle Analyzer, do `npm run analyze` (production build).

To enable hot module reload, do `npm start -- --hmr`.

To change dev server port, do `npm start -- --port 8888`.

To change dev server host, do `npm start -- --host 127.0.0.1`

**PS:** You could mix all the flags as well, `npm start -- --host 127.0.0.1 --port 7070 --open --hmr`

For long time aurelia-cli user, you can still use `au run` with those arguments like `au run --env prod --open --hmr`. But `au run` now simply executes `npm start` command.

## Build for production

Run `npm run build`, or the old way `au build --env prod`.

## Unit tests

Run `au test` (or `au jest`).

To run in watch mode, `au test --watch` or `au jest --watch`.
