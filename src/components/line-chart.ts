import { TranGenerated } from "../model/tran-generated";

import { connectTo } from 'aurelia-store';
import { State } from '../state';
import { Chart } from "chart.js";

import * as moment from "moment";
import numeral from 'numeral';
import { autoinject, observable } from 'aurelia-framework';

@autoinject()
@connectTo()
export class LineChartCustomElement {
  chartArea: HTMLCanvasElement;
  isAttached: boolean = false;
  ledger: TranGenerated[];
  delay: number;
  @observable public state: State;

  attached() {
    this.isAttached = true;
    this.makeChart(this.state.ledger);
  }

  detached() {
    this.isAttached = false;
  }

  stateChanged = () => {
    if (this.state && this.state.ledger) {
      this.makeChart(this.state.ledger);
    }
  }

  makeChart = (ledger: TranGenerated[]) => {
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