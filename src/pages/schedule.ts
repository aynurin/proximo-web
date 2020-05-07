import { autoinject } from "aurelia-framework";
import { LogManager } from 'aurelia-framework';

import { IntroBuildingContext, IntroContainer } from "components/intro-building-context";
import { waitForHtmlElement } from "components/utils";

const COMPONENT_NAME = "schedule";

const log = LogManager.getLogger(COMPONENT_NAME);

@autoinject()
export class ScheduleCustomElement {
  private intro: IntroContainer;

  constructor(private introContext: IntroBuildingContext) { }

  created() {
    log.debug('created');
    this.intro = this.introContext.getContainer(COMPONENT_NAME);
  }

  readyForIntro() {
    log.debug("readyForIntro");
    waitForHtmlElement("ledger-tab-button", (ledgerTabButton: HTMLElement) => {
      // await this.introContext.completeIntro();
      this.intro.ready([{
        element: ledgerTabButton, 
        intro: `${COMPONENT_NAME}:intro.ledger-tab`,
        version: 1,
        priority: 100,
        onStepEnter: (introContext: IntroBuildingContext) => {
          log.debug("attaching onclick", ledgerTabButton);
          ledgerTabButton.addEventListener("click", introContext.completeIntro);
        },
        onStepExit: (introContext: IntroBuildingContext) => {
          log.debug("detaching onclick", ledgerTabButton);
          ledgerTabButton.removeEventListener("click", introContext.completeIntro);
        }
      }]);
    });
  }

  attached() {
    log.debug("attached");
    this.readyForIntro();
  }
}
