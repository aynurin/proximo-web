declare module 'aurelia-google-analytics' {

  export interface Analytics {
    init(id: string): void;
    attach(options?: AttachOptions): void;
  }

  export interface AttachOptions {
    /**
     * Set to `true` to have some log messages appear in the browser console.
     */
		logging: { enabled: boolean };
		anonymizeIp: { enabled: boolean };
		pageTracking: {
      /**
       * Set to `false` to disable in non-production environments.
       */
			enabled: boolean,
      /**
       * Configure fragments/routes/route names to ignore page tracking for
       */
			ignore: {
        /**
         * Ignore a route fragment, login fragment for example: ['/login']
         */
				fragments: string[],
        /**
         * Ignore a route, login route for example: ['login']
         */
				routes: string[],
        /**
         * Ignore a route name, login route name for example: ['login-route']
         */
				routeNames: string[]
			},
      /**
       * Optional. By default it gets the title from payload.instruction.config.title.
       * For example, if you want to retrieve the tile from the document instead override with the following.
       * @example return document.title;
       * @param payload 
       */
			getTitle(payload: string): string;
      /**
       * Optional. By default it gets the URL fragment from payload.instruction.fragment.
       * For example, if you want to get full URL each time override with the following.
       * @example return window.location.href;
       * @param payload 
       */
			getUrl(payload: string): string;
		},
		clickTracking: {
      /**
       * Set to `false` to disable in non-production environments.
       */
			enabled: boolean,
      /**
       * Optional. By default it tracks clicks on anchors and buttons.
       * For example, if you want to also track clicks on span elements override with the following.
       * @example return element instanceof HTMLElement && (element.nodeName.toLowerCase() === 'a' || element.nodeName.toLowerCase() === 'span');
       * @param element 
       */
			filter(element: HTMLElement): boolean;
		},
		exceptionTracking: {
      /**
       * Set to `false` to disable in non-production environments.
       */
			enabled: boolean,
			applicationName?: string,
			applicationVersion?: string
		}
	}

}
