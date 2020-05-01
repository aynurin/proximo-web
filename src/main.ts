import { Aurelia } from 'aurelia-framework'
import * as environment from '../config/environment.json';
import { PLATFORM } from 'aurelia-pal';
import { initialState } from './state';
import { I18N, TCustomAttribute } from 'aurelia-i18n';
import Backend from 'i18next-xhr-backend';
import 'font-awesome/css/font-awesome.css';

export function configure(aurelia: Aurelia) {
  aurelia.use
    .standardConfiguration()
    .feature(PLATFORM.moduleName('resources/index'));

  aurelia.use.developmentLogging(environment.debug ? 'debug' : 'warn');

  if (environment.testing) {
    aurelia.use.plugin(PLATFORM.moduleName('aurelia-testing'));
  }

  aurelia.use
    .plugin(PLATFORM.moduleName('aurelia-store'), { initialState })
    .plugin(PLATFORM.moduleName('aurelia-plugins-tabs'))
    .plugin(PLATFORM.moduleName('aurelia-dialog'))
    .plugin(PLATFORM.moduleName('aurelia-i18n'), (instance) => {
      let aliases = ['t', 'i18n'];
      // add aliases for 't' attribute
      TCustomAttribute.configureAliases(aliases);

      // register backend plugin
      instance.i18next.use(Backend);

      // adapt options to your needs (see http://i18next.com/docs/options/)
      // make sure to return the promise of the setup method, in order to guarantee proper loading
      return instance.setup({
        backend: {                                  // <-- configure backend settings
          loadPath: './locale/{{lng}}/{{ns}}.json', // <-- XHR settings for where to get the files from
        },
        attributes: aliases,
        lng: 'en',
        fallbackLng: 'en',
        debug: environment.debug,
        ns: ['components', 'dashboard', 'ledger', 'schedule', 'schedule-wizard'],
        skipTranslationOnMissingKey: true
      });
    });

  if (!environment.debug) {
    aurelia.use.plugin(PLATFORM.moduleName('aurelia-google-analytics'), config => {
      config.init('UA-159543803-1');
      config.attach({
        logging: {
          // Set to `true` to have some log messages appear in the browser console.
          enabled: true
        },
        pageTracking: {
          // Set to `false` to disable in non-production environments.
          enabled: true,
          // Configure fragments/routes/route names to ignore page tracking for
          ignore: {
            fragments: [], // Ignore a route fragment, login fragment for example: ['/login']
            routes: [], // Ignore a route, login route for example: ['login']
            routeNames: [] // Ignore a route name, login route name for example: ['login-route']
          },
          // Optional. By default it gets the title from payload.instruction.config.title.
          getTitle: (payload) => {
            // For example, if you want to retrieve the tile from the document instead override with the following.
            return document.title;
          },
          // Optional. By default it gets the URL fragment from payload.instruction.fragment.
          getUrl: (payload) => {
            // For example, if you want to get full URL each time override with the following.
            return window.location.href;
          }
        },
        clickTracking: {
          // Set to `false` to disable in non-production environments.
          enabled: true,
          // Optional. By default it tracks clicks on anchors and buttons.
          filter: (element) => {
            // For example, if you want to also track clicks on span elements override with the following.
            return element instanceof HTMLElement &&
              (element.nodeName.toLowerCase() === 'a' ||
                element.nodeName.toLowerCase() === 'button' ||
                element.nodeName.toLowerCase() === 'span');
          }
        },
        exceptionTracking: {
          // Set to `false` to disable in non-production environments.
          enabled: true
        }
      });
    });
  }

  aurelia.start().then(() => aurelia.setRoot(PLATFORM.moduleName('app')));
}
