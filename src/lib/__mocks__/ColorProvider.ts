import { IPerson } from "lib/model/Person";

export default class ColorProvider {
  constructor (private person: IPerson) { }

  newColor() {
    return "fkeclr";
  }
}
