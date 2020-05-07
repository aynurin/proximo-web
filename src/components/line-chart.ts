import { autoinject } from 'aurelia-framework';
import { LogManager } from 'aurelia-framework';
import { EventAggregator } from "aurelia-event-aggregator";
import { connectTo } from 'aurelia-store';

import * as moment from "moment";
import numeral from "numeral";

import { State } from 'state';
import { TranGenerated } from "model/tran-template";

import Chart from "./alt-chartjs";
import { IntroContainer, IntroBuildingContext } from "./intro-building-context";

const COMPONENT_NAME = "line-chart";

const log = LogManager.getLogger(COMPONENT_NAME);

@autoinject()
@connectTo()
export class LineChartCustomElement {
  private chartArea: HTMLCanvasElement;
  private lineChart: Chart;
  private canvas: CanvasRenderingContext2D;
  private datasets: any[] = [];
  private state: State;
  private lastVersion: number;

  private intro: IntroContainer;

  constructor(
    private ea: EventAggregator,
    private introContext: IntroBuildingContext) { }

  created() {
    log.debug('created');
    this.ea.subscribe("ledger-changed", () => this.ledgerChanged());
    this.intro = this.introContext.getContainer(COMPONENT_NAME);
  }

  readyForIntro() {
    log.debug("readyForIntro");
    this.intro.ready([{ 
      element: this.chartArea, 
      intro: `components:${COMPONENT_NAME}.intro.default`, 
      version: 1,
      priority: 20 }]);
  }

  ledgerChanged = () => {
    log.debug('ledgerChanged');
    this.generateChart(this.state);
  }

  ifLedgerChanged(action: (state: State) => void) {
    if (this.state && (isNaN(this.lastVersion) || this.lastVersion < this.state.scheduleVersion)) {
      action(this.state);
      this.lastVersion = this.state.scheduleVersion;
    }
  }

  // when data is changed - need to update datasets
  generateChart = (state: State) => {
    log.debug('generateChart', state ? state.scheduleVersion : 'none');
    let newDataSets = [];
    if (state.ledger) {
      newDataSets = generateDatasets(state.ledger);
    } else {
      newDataSets = [];
    }
    this.datasets.length = 0;
    for (let d of newDataSets) {
      this.datasets.push(d);
    }
    if (this.lineChart) {
      this.lineChart.update();
      this.readyForIntro();
    }
  }

  // when control is attached to dom - need to initialize the chart drawing area
  attached() {
    log.debug('attached');
    this.resetChartContext();
    this.ifLedgerChanged(this.generateChart);
  }

  detached() {
    log.debug('detached');
  }

  resetChartContext() {
    log.debug('resetChartContext', this.chartArea != null);
    if (this.chartArea == null) {
      return;
    }
    this.canvas = this.chartArea.getContext("2d");
    this.makeChart();
  }

  makeChart() {
    log.debug('makeChart', this.state && this.state.ledger ? this.state.ledger.length : 'none', this.datasets.length);
    this.lineChart = new Chart(this.canvas, {
      type: "lineAlt",
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

function generateDatasets(ledger: TranGenerated[]): any[] {
  let datasets: { [account: string]: any } = {};
  const addTran = (accountName: string, tran: TranGenerated) => {
    if (!(accountName in datasets)) {
      datasets[accountName] = newDataset(accountName);
    }
    datasets[accountName].data.push({ x: moment(tran.date).format("YYYY-MM-DD"), y: tran.balances[tran.account] });
  }
  for (let tran of ledger) {
    addTran(tran.account, tran);
    if (tran.isTransfer) {
      addTran(tran.transferToAccount, Object.assign({}, tran, {account: tran.transferToAccount}));
    }
  }
  return Object.values(datasets);
}
