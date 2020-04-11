import { autoinject } from "aurelia-framework";
import { LogManager } from 'aurelia-framework';

import { IntroBuildingContext, IntroContainer } from "components/intro-building-context";

const log = LogManager.getLogger('dashboard');

@autoinject()
export class DashboardCustomElement {
  private intro: IntroContainer;

  constructor(private introContext: IntroBuildingContext) { }

  created() {
    log.debug('created');
    this.intro = this.introContext.getContainer("dashboard");
  }

  readyForIntro() {
    log.debug("readyForIntro");
    this.intro.ready([{ 
      intro: "pages\\dashboard:intro", 
      version: 4,
      priority: 0 }]);
  }

  attached() {
    log.debug("attached");
    this.readyForIntro();
  }
}
