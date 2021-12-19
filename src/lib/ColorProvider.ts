import { autoinject } from 'aurelia-framework';
import CustomError from './model/CustomError';
import { IPerson } from "./model/Person";

@autoinject
export default class ColorProvider {
  constructor (private readonly person: IPerson) {

  }

  newColor() {
    const selectedColors = this.person.accounts.map(a => a.colorCode);
    for (const color of colors) {
      if (!(color in selectedColors)) {
        return color;
      }
    }
    throw new CustomError("No more colors left, all taken");
  }
}

// https://coolors.co/f9704e-74bc4e-c332ad-6bb0b3-8332ac-ddbdd5-b61624-437789-bac77f-686350
// Also see https://medium.com/code-nebula/automatically-generate-chart-colors-with-chart-js-d3s-color-scales-f62e282b2b41
const colors = [
  "F9704E",
  "74BC4E",
  "C332AD",
  "6BB0B3",
  "8332AC",
  "DDBDD5",
  "B61624",
  "437789",
  "BAC77F",
  "686350",
]
