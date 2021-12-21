import {FrameworkConfiguration} from 'aurelia-framework';
import {PLATFORM} from 'aurelia-pal';

export function configure(config: FrameworkConfiguration) {
  config.globalResources([
    // I experienced browser window hanging when using only fromView
    // And if using toView, it becomes very inconvenient to use 
    // with e.g. money formatting
    PLATFORM.moduleName("./value-converters/text-to-float"),
    PLATFORM.moduleName("./value-converters/date-format"),
    PLATFORM.moduleName("./value-converters/schedule-label"),
    PLATFORM.moduleName("./value-converters/text-to-int"),
    PLATFORM.moduleName("./value-converters/text-to-money"),
    PLATFORM.moduleName("./value-converters/trim-space"),
  ]);
}
