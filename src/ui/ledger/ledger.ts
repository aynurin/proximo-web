import { autoinject } from "aurelia-framework";
import { LogManager } from 'aurelia-framework';

import { IntroBuildingContext, IntroContainer } from "lib/intro-building-context";
import { waitForHtmlElement } from "lib/utils";

const COMPONENT_NAME = "ledger";

const log = LogManager.getLogger(COMPONENT_NAME);

@autoinject()
export class LedgerCustomElement {
  private intro: IntroContainer;

  constructor(private introContext: IntroBuildingContext) { }

  created() {
    log.debug('created');
    this.intro = this.introContext.getContainer(COMPONENT_NAME);
  }

  readyForIntro() {
    log.debug("readyForIntro");
    waitForHtmlElement("scheduleWizardButton", (scheduleWizardButton: HTMLElement) => {
      this.intro.ready([{
        element: scheduleWizardButton, 
        intro: `${COMPONENT_NAME}:intro.schedule-wizard-button`,
        version: 1,
        priority: 100,
        onStepEnter: (introContext: IntroBuildingContext) => {
          log.debug("attaching onclick", scheduleWizardButton);
          scheduleWizardButton.addEventListener("click", introContext.completeIntro);
        },
        onStepExit: (introContext: IntroBuildingContext) => {
          log.debug("detaching onclick", scheduleWizardButton);
          scheduleWizardButton.removeEventListener("click", introContext.completeIntro);
      }
      }]);
    });
  }

  attached() {
    log.debug("attached");
    this.readyForIntro();
  }
}
