import { Aurelia } from 'aurelia-framework';
import {FrameworkConfiguration} from 'aurelia-framework';
import {configure} from 'au/index';
import fs from 'fs';
import path from 'path';

test('should register all value converters', () => {
  const config = new FrameworkConfiguration(new Aurelia());

  return new Promise<void>((resolve) => {
    fs.readdir('./src/au/value-converters', (err, files) => {
      files = files.map(f => path.basename(f, '.ts'));
      files.sort();
      let resources = [];
      const spy = jest.spyOn(config, 'globalResources').mockImplementation((r: string[]) => {
        resources = r.map(f => path.basename(f, '.ts'));
        resources.sort();
        return this;
      });
      configure(config);
      expect(resources).toEqual(files);
      spy.mockRestore();
      resolve();
    });
  })
});
