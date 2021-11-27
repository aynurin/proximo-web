import {

  ChartConfiguration,
  ChartType,
  ChartData,
  ChartTypeRegistry,

  Chart,
  LineElement,
  PointElement,
  LineController,
  CategoryScale,
  LinearScale,
  TimeScale,
  TimeSeriesScale,

  // ArcElement,
  // BarElement,
  // BarController,
  // BubbleController,
  // DoughnutController,
  // PieController,
  // PolarAreaController,
  // RadarController,
  // ScatterController,
  // LogarithmicScale,
  // RadialLinearScale,
  // Decimation,
  // Filler,
  // Legend,
  // Title,
  // Tooltip,
  // SubTitle
} from 'chart.js';

export const lineChartType: ChartType = "line";

// class ChartOptions implements ChartConfiguration<ChartType, number, unknown> {
//   type: ChartType = "line";
//   data: ChartData<keyof ChartTypeRegistry, number, unknown>;
// }

Chart.register(
  LineElement,
  PointElement,
  LineController,
  CategoryScale,
  LinearScale,
  TimeScale,
  TimeSeriesScale,

  // ArcElement,
  // BarElement,
  // BarController,
  // BubbleController,
  // DoughnutController,
  // PieController,
  // PolarAreaController,
  // RadarController,
  // ScatterController,
  // LogarithmicScale,
  // RadialLinearScale,
  // Decimation,
  // Filler,
  // Legend,
  // Title,
  // Tooltip,
  // SubTitle
);

// extending charts: 
//  - https://stackoverflow.com/questions/30462042/line-chartjs-empty-null-values-doesnt-break-the-line
//  - https://www.chartjs.org/docs/latest/developers/charts.html#extending-existing-chart-types
// Chart.controllers.lineAlt = Chart.controllers.line.extend({
//     draw: function () {
//         // Call super method first
//         Chart.controllers.line.prototype.draw.call(this, arguments);

//     //     // now draw the segments
//     //     var ctx = this.chart.chart.ctx;
//     //     this.chart.data.datasets.forEach(function (dataset) {
//     //         ctx.strokeStyle = dataset.borderColor;

//     //         var previousPoint = {
//     //             value: null,
//     //             x: null,
//     //             y: null
//     //         };
//     //         dataset.data.forEach(function (point) {
//     //             if (previousPoint.value !== null && point.value !== null) {
//     //                 ctx.beginPath();
//     //                 ctx.moveTo(previousPoint.x, previousPoint.y);
//     //                 ctx.lineTo(point.x, point.y);
//     //                 ctx.stroke();
//     //             }
//     //             previousPoint = point;
//     //         });
//     //     });
//     }
// });

export default Chart;
