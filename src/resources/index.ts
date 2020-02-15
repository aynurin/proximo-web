import {FrameworkConfiguration} from 'aurelia-framework';
import {PLATFORM} from 'aurelia-pal';

export function configure(config: FrameworkConfiguration) {
  config.globalResources([
    // I experienced browser window hanging when using only fromView
    // And if using toView, then you basically cannot use it as it with text inputs
    // As it becomes very inconvenient to use with e.g. money formatting
    PLATFORM.moduleName("./value-converters/text-to-int"),
    PLATFORM.moduleName("./value-converters/text-to-money"),
    PLATFORM.moduleName("./value-converters/text-to-float")
  ]);
}
