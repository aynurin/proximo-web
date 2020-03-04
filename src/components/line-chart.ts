import { TranGenerated } from "../model/tran-generated";

import { Chart } from "chart.js";

import * as moment from "moment";
import numeral from 'numeral';
import { LogManager, autoinject } from 'aurelia-framework';
import { EventAggregator } from "aurelia-event-aggregator";

const log = LogManager.getLogger('line-chart');

@autoinject()
export class LineChartCustomElement {
  chartArea: HTMLCanvasElement;
  isAttached: boolean = false;
  ledger: TranGenerated[];
  delay: number;

  public constructor(
    ea: EventAggregator) {
      log.debug('subscribe to ledger');
      ea.subscribe("ledger-changed", (ledger: TranGenerated[]) => {
        log.debug('receiving new ledger');
        this.ledgerChanged(ledger);
      });
  }

  attached() {
    this.isAttached = true;
    if (this.ledger != null) {
      this.ledgerChanged(this.ledger);
    }
  }

  detached() {
    this.isAttached = false;
  }

  public ledgerChanged(ledger: TranGenerated[]) {
    this.ledger = ledger;
    if (!this.isAttached) {
      return;
    }
    if (this.delay != null) {
      window.clearTimeout(this.delay);
      this.delay = null;
    }
    if (this.delay == null) {
      this.delay = window.setTimeout(() => this.makeChart(ledger), 1000);
    }
  }

  makeChart(ledger: TranGenerated[]) {
    this.delay = null;
    let datasets = generateDatasets(ledger);
    var ctx = this.chartArea.getContext("2d");
    var myChart = new Chart(ctx, {
      type: "line",
      data: { datasets },
      options: {
        responsive: true,
        tooltips: {
					// intersect: false,
					// mode: 'index',
					callbacks: {
						label: function(tooltipItem, myData) {
							var label = myData.datasets[tooltipItem.datasetIndex].label || '';
							if (label) {
								label += ': ';
							}
							label += numeral(tooltipItem.value).format('0,0.00');
							return label;
            },
            title: function(tooltipItems, myData) {
              return moment(tooltipItems[0].label).format("MMMM Do, YYYY");
            }
					}
        },
        hover: {
          mode: "nearest",
          intersect: true
        },
        elements: {
          line: {
            tension: 0
          }
        },
        scales: {
          xAxes: [
            {
              type: "time",
              distribution: "series",
              offset: true,
              ticks: {
                major: {
                  enabled: true,
                  fontStyle: "bold"
                },
                source: "data",
                autoSkip: true,
                autoSkipPadding: 75,
                maxRotation: 0,
                sampleSize: 100
              },
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
  }
}

const __colors = [
  "#45A831",
  "#EBBB07",
  "#B81AE8",
  "#2685FF",

  "#82E5FF",
  "#7AE876",
  "#F79B72",
  "#EF61FF",
];
let __lastUsedColor = -1;
const __accountColors = {}

function accountColor(acc: string): string {
  if (!(acc in __accountColors)) {
    __lastUsedColor++;
    if (__lastUsedColor == __colors.length) {
      __lastUsedColor = 0;
    }
    __accountColors[acc] = __colors[__lastUsedColor];
  }
  return __accountColors[acc];
}

function newDataset(acc: string): any {
  return {
    label: acc,
    borderColor: accountColor(acc),
    data: [],
    
    backgroundColor: "rgba(255,255,255,0)",
    fill: false,
    lineTension: 0.2,
    borderWidth: 2
  }
}

function addDatapoint(dataset: any, tran: TranGenerated) {
  dataset.data.push({ x: moment(tran.date).format("YYYY-MM-DD"), y: tran.balances[tran.account] });
}

function generateDatasets(ledger: TranGenerated[]) {
  let datasets = {};
  for (let tran of ledger) {
    if (!(tran.account in datasets)) {
      datasets[tran.account] = newDataset(tran.account);
    }
    addDatapoint(datasets[tran.account], tran);
  }
  return Object.values(datasets);
}