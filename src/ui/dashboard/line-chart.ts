import { autoinject } from 'aurelia-framework';
import { LogManager } from 'aurelia-framework';
import { EventAggregator } from "aurelia-event-aggregator";
import { connectTo } from 'aurelia-store';

import { IPerson } from "lib/model/Person";

import Chart from "./alt-chartjs";
import { lineChartType } from "./alt-chartjs";
import { IntroContainer, IntroBuildingContext } from "lib/intro-building-context";
import Ledger from 'lib/model/Ledger';
import { ChartConfiguration,  ChartDataset } from 'chart.js';

const COMPONENT_NAME = "line-chart";

const log = LogManager.getLogger(COMPONENT_NAME);

@autoinject()
@connectTo()
export class LineChartCustomElement {
  private chartArea: HTMLCanvasElement;
  private lineChart: Chart<typeof lineChartType, { x: Date; y: number; }[]>;
  private canvas: CanvasRenderingContext2D;
  private datasets: ChartDataset<typeof lineChartType,{x: Date, y: number}[]>[] = [];
  private state: IPerson;

  private intro: IntroContainer;

  constructor(
    private ea: EventAggregator,
    private introContext: IntroBuildingContext) { }

    readyForIntro() {
      log.debug("readyForIntro");
      this.intro.ready([{
        element: this.chartArea,
        intro: `dashboard:intro.${COMPONENT_NAME}`,
        hint: null,
        version: 1,
        priority: 20
      }]);
    }

  created() {
    log.debug('created');
    this.ea.subscribe("ledger-changed", () => this.ledgerChanged());
    this.intro = this.introContext.getContainer(COMPONENT_NAME);
  }

  detached() {
    log.debug('detached');
  }

  // when control is attached to dom - need to initialize the chart drawing area
  attached() {
    log.debug('attached');
    this.resetChartContext();
    this.generateChart(this.state);
  }

  ledgerChanged = () => {
    log.debug('ledgerChanged');
    this.generateChart(this.state);
  }

  // when data is changed - need to update datasets
  generateChart = (state: IPerson) => {
    log.debug('generateChart');
    this.datasets.length = 0;
    const datasets = this.generateDatasets(state);
    for (const d of datasets) {
      this.datasets.push(d);
    }
    if (this.lineChart) {
      this.lineChart.update();
      this.readyForIntro();
    }
  }

  makeChart() {
    log.debug('makeChart', this.datasets.length);
    const chartConfig: ChartConfiguration<typeof lineChartType,{x: Date, y: number}[]> = {
      type: lineChartType,
      data: { datasets: this.datasets },
      options: {
        scales: {
              xAxes: {
                  type: "time",
                  offset: true
                },
              yAxes: {
                  display: true,
                }
        }
      }
    };
    this.lineChart = new Chart(this.canvas, chartConfig);
  }

  generateDatasets(state: IPerson): ChartDataset<typeof lineChartType,{x: Date, y: number}[]>[] {
    return state.accounts.map(account => ({
        label: account.friendlyName,
        // ex. data: [{x:'2016-12-25', y:20}, {x:'2016-12-26', y:10}], from https://www.chartjs.org/docs/latest/general/data-structures.html
        data: Array.from(new Ledger(account.ledger).groupByDate().values()).map(t => ({ x: t.key, y: t.last.accountBalance, all: t })),
        borderColor: account.colorCode,
        fill: false,
        stepped: true,
        parsing: false,
      }));
  }

  resetChartContext() {
    log.debug('resetChartContext', this.chartArea != null);
    if (this.chartArea == null) {
      return;
    }
    this.canvas = this.chartArea.getContext("2d");
    this.makeChart();
  }
}


/*

Lots of chart options commented during refactoring:


      // options: {
      //   responsive: true,
      //   // tooltips: {
      //   //   // intersect: false,
      //   //   // mode: 'index',
      //   //   callbacks: {
      //   //     label: function(tooltipItem, myData) {
      //   //       var label = myData.datasets[tooltipItem.datasetIndex].label || '';
      //   //       if (label) {
      //   //         label += ': ';
      //   //       }
      //   //       label += numberFormatter.format(tooltipItem.value);
      //   //       return label;
      //   //     },
      //   //     title: function(tooltipItems, myData) {
      //   //       return this.dateFormatter.format(tooltipItems[0].label);//.format("MMMM Do, YYYY");
      //   //     }
      //   //   }
      //   // },
      //   // hover: {
      //   //   mode: "nearest",
      //   //   intersect: true
      //   // },
      //   elements: {
      //     line: {
      //       tension: 0
      //     }
      //   },
      //   scales: {
      //     xAxes: 
      //       {
      //         type: "time",
      //         // distribution: "series",
      //         offset: true,
      //         ticks: {
      //           major: {
      //             enabled: true
      //           },
      //           source: "data",
      //           autoSkip: true,
      //           autoSkipPadding: 75,
      //           maxRotation: 0,
      //           sampleSize: 100
      //         },
      //         display: true,
      //         // scaleLabel: {
      //         //   display: true,
      //         //   labelString: "Month"
      //         // }
      //       }
      //     ,
      //     yAxes: 
      //       {
      //         display: true,
      //         // scaleLabel: {
      //         //   display: true,
      //         //   labelString: "Value"
      //         // }
      //       }

      //   }
      // }



*/
