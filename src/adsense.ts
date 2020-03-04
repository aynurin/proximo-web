import { customElement, noView } from "aurelia-framework";
 
@noView()
@customElement('adsense')
export class AdSense {
  scripttag: HTMLScriptElement;
 
  attached() {
    this.scripttag = document.createElement('script');
    this.scripttag.setAttribute('src', 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js');
    this.scripttag.setAttribute('data-ad-client', 'ca-pub-8635029046616817');
    this.scripttag.async = true;
    document.body.appendChild(this.scripttag);
  }
 
  detached() {
    if (this.scripttag) {
      this.scripttag.remove();
    }
  }
}