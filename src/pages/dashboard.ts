import { autoinject } from "aurelia-framework";
import { LogManager } from 'aurelia-framework';

import { IntroBuildingContext, IntroContainer } from "components/intro-building-context";
import { waitForHtmlElement } from "components/utils";

const COMPONENT_NAME = "dashboard";

const log = LogManager.getLogger(COMPONENT_NAME);

@autoinject()
export class DashboardCustomElement {
  private intro: IntroContainer;

  constructor(private introContext: IntroBuildingContext) { }

  created() {
    log.debug('created');
    this.intro = this.introContext.getContainer(COMPONENT_NAME);
  }

  readyForIntro() {
    log.debug("readyForIntro");
    waitForHtmlElement("schedule-tab-button", (scheduleTabButton: HTMLElement) => {
      this.intro.ready([{
        intro: `${COMPONENT_NAME}:intro.default`,
        version: 15,
        priority: 0
      }, {
        element: scheduleTabButton, 
        intro: `${COMPONENT_NAME}:intro.schedule-tab`,
        version: 15,
        priority: 100,
        onStepEnter: (introContext: IntroBuildingContext) => {
          log.debug("attaching scheduleTabButton click event listener");
          scheduleTabButton.addEventListener("click", introContext.completeIntro);
        },
        onStepExit: (introContext: IntroBuildingContext) => {
          log.debug("detaching scheduleTabButton click event listener");
          scheduleTabButton.removeEventListener("click", introContext.completeIntro);
      }
      }]);
    });
  }

  attached() {
    log.debug("attached");
    this.readyForIntro();
  }
}
