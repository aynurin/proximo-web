import { Aurelia } from 'aurelia-framework';
import { Analytics } from 'aurelia-google-analytics';
import environment from '../config/environment.json';
import { PLATFORM } from 'aurelia-pal';
import { I18N, TCustomAttribute } from 'aurelia-i18n';
import Backend from 'i18next-http-backend';
import 'font-awesome/css/font-awesome.css';
import { createEmptyState } from 'lib/state/emptyState';

export async function configure(aurelia: Aurelia) {
  aurelia.use
    .standardConfiguration()
    .feature(PLATFORM.moduleName('au/index'));

  aurelia.use.developmentLogging(environment.debug ? 'debug' : 'warn');

  if (environment.testing) {
    aurelia.use.plugin(PLATFORM.moduleName('aurelia-testing'));
  }

  aurelia.use
    .plugin(PLATFORM.moduleName('aurelia-store'), { initialState: createEmptyState() })
    .plugin(PLATFORM.moduleName('aurelia-plugins-tabs'))
    .plugin(PLATFORM.moduleName('aurelia-dialog'))
    .plugin(PLATFORM.moduleName('aurelia-sortablejs'))
    .plugin(PLATFORM.moduleName('aurelia-i18n'), (instance: I18N) => {
      const aliases = ['t', 'i18n'];
      // add aliases for 't' attribute
      TCustomAttribute.configureAliases(aliases);

      // register backend plugin
      instance.i18next.use(Backend);

      // adapt options to your needs (see http://i18next.com/docs/options/)
      // make sure to return the promise of the setup method, in order to guarantee proper loading
      return instance.setup({
        backend: {                                  // <-- configure backend settings
          loadPath: './ui/{{ns}}/{{ns}}-locale-{{lng}}.json', // <-- XHR settings for where to get the files from
        },
        attributes: aliases,
        lng: 'en',
        fallbackLng: 'en',
        debug: environment.debug,
        ns: ['welcome', 'dashboard', 'ledger', 'schedule'],
        skipTranslationOnMissingKey: true
      });
    });

  if (!environment.debug) {
    aurelia.use.plugin(PLATFORM.moduleName('aurelia-google-analytics'), (config: Analytics) => {
      config.init('UA-159543803-1');
      config.attach({
        logging: {
          enabled: true
        },
        anonymizeIp: {
          enabled: true
        },
        pageTracking: {
          enabled: true,
          ignore: {
            fragments: [],
            routes: [],
            routeNames: []
          },
          getTitle: (payload) => {
            return document.title;
          },
          getUrl: (payload) => {
            return window.location.href;
          }
        },
        clickTracking: {
          enabled: true,
          filter: (element) => {
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

  await aurelia.start().then(() => aurelia.setRoot(PLATFORM.moduleName('app')));
}
