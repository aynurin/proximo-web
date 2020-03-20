import { EventAggregator } from "aurelia-event-aggregator";
import { pluck } from 'rxjs/operators';
import { connectTo } from 'aurelia-store';
import { State } from '../state';
import { Chart } from "chart.js";

import * as moment from "moment";
import numeral from 'numeral';
import { autoinject, observable } from 'aurelia-framework';
import { LogManager } from 'aurelia-framework';
import { TranGenerated } from "model/tran-template";

const log = LogManager.getLogger('line-chart');

@autoinject()
@connectTo<State>((store) => store.state.pipe(pluck('ledger')))
export class LineChartCustomElement {
  chartArea: HTMLCanvasElement;
  lineChart: Chart;
  canvas: CanvasRenderingContext2D;
  datasets: any[] = [];
  isAttached: boolean = false;
  ledger: TranGenerated[];
  @observable public state: TranGenerated[];

  constructor(ea: EventAggregator) {
    ea.subscribe("screen-changed", () => this.screenChanged());
  }

  // when data is changed - need to update datasets
  stateChanged = () => {
    let newDataSets = [];
    if (this.state) {
      newDataSets = generateDatasets(this.state);
    } else {
      newDataSets = [];
    }
    this.datasets.length = 0;
    for (let d of newDataSets) {
      this.datasets.push(d);
    }
    if (this.datasets && this.lineChart) {
      this.lineChart.update();
    }
  }

  // when screen size is changed - need to update the chart drawing area
  screenChanged() {
    log.debug('screenChanged');
    this.resetChartContext();
  }

  // when control is attached to dom - need to initialize the chart drawoing area
  attached() {
    log.debug('attached');
    this.isAttached = true;
    this.resetChartContext();
  }

  detached() {
    this.isAttached = false;
  }

  resetChartContextCounter: number = 0;
  resetChartContext() {
    if (this.chartArea == null) {
      return;
    }
    this.resetChartContextCounter += 1;
    log.debug('resetChartContext', this.resetChartContextCounter);
    this.canvas = this.chartArea.getContext("2d");
    this.makeChart();
  }

  makeChart() {
    this.lineChart = new Chart(this.canvas, {
      type: "line",
      data: { datasets: this.datasets },
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

function generateDatasets(ledger: TranGenerated[]): any[] {
  let datasets: { [account: string]: any } = {};
  const addTran = (accountName: string, tran: TranGenerated) => {
    if (!(accountName in datasets)) {
      datasets[accountName] = newDataset(accountName);
    }
    addDatapoint(datasets[accountName], tran);
  }
  for (let tran of ledger) {
    addTran(tran.account, tran);
    if (tran.isTransfer) {
      addTran(tran.transferToAccount, Object.assign({}, tran, {account: tran.transferToAccount}));
    }
  }
  return Object.values(datasets);
}