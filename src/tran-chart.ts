import { autoinject } from "aurelia-framework";
import { EventAggregator } from "aurelia-event-aggregator";

import { Store, connectTo } from "aurelia-store";
import { State } from "./state";

import { TranGenerated } from "./model/tran-generated";

import { Chart } from "chart.js";

import * as moment from "moment";

const colors = [
  "#003f5c",
  "#2f4b7c",
  "#665191",
  "#a05195",
  "#d45087",
  "#f95d6a",
  "#ff7c43",
  "#ffa600"
];

@autoinject()
@connectTo()
export class TranChartCustomElement {
  public state: State;
  chartArea: HTMLCanvasElement;
  lastUsedColor = -1;

  public constructor(
    private store: Store<State>,
    private ea: EventAggregator
  ) {}

  ledgerChanged(ledger: TranGenerated[]) {
    console.log("ledgerChanged");
    var ctx = this.chartArea.getContext("2d");
    console.log("ledgerChanged", ctx);
    let datasets = [];
    let months = [];
    for (let tran of ledger) {
      let month = moment(tran.date).format("MMM");
      if (months.find(m => m == month) == null) {
        months.push(month);
      }

      let chartData = datasets.find(d => d.label == tran.account);
      if (chartData == null) {
        this.lastUsedColor++;
        if (this.lastUsedColor == colors.length) {
          this.lastUsedColor = 0;
        }
        chartData = {
          label: tran.account,
          backgroundColor: "rgba(255,255,255,0)",
          borderColor: colors[this.lastUsedColor],
          data: []
        };
        datasets.push(chartData);
      }
      chartData.data.push(tran.balance);
    }
    console.log("ledgerChanged", datasets.length);
    var myChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: months,
        datasets: datasets
      },
      options: {
        responsive: true,
        title: {
          display: true,
          text: "Chart.js Line Chart"
        },
        tooltips: {
          mode: "index",
          intersect: false
        },
        hover: {
          mode: "nearest",
          intersect: true
        },
        scales: {
          xAxes: [
            {
              display: true,
              scaleLabel: {
                display: true,
                labelString: "Month"
              }
            }
          ],
          yAxes: [
            {
              display: true,
              scaleLabel: {
                display: true,
                labelString: "Value"
              }
            }
          ]
        }
      }
    });
    console.log("ledgerChanged", myChart);
  }

  attached() {
    console.log("subscribing to ledgerGenerated");
    this.ea.subscribe("ledgerGenerated", (ledger: TranGenerated[]) => {
      this.ledgerChanged(ledger);
    });
  }
}
