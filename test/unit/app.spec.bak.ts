import {bootstrap} from 'aurelia-bootstrapper';
import {StageComponent} from 'aurelia-testing';
import {PLATFORM} from 'aurelia-pal';

describe('Stage App Component', () => {
  let component;

  beforeEach(() => {
    component = StageComponent
      .withResources(PLATFORM.moduleName('app'))
      .inView('<app></app>');
  });

  afterEach(() => component.dispose());

  it.skip('should render message', done => {
    component.create(bootstrap).then(() => {
      const view = component.element;
      expect(view.textContent.trim().indexOf('Schedule transaction')).toBe(0);
      done();
    }).catch(e => {
      done(e);
    });
  });
});
