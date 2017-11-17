import * as assert from 'power-assert';
import { Kapacitor, ITask } from './kapacitor';

const kapacitor = new Kapacitor();

const testCreateTask = async () => {
  const task: ITask = {
    id: 'test_kapa',
    type: 'stream',
    dbrps: [{ db: 'test', rp: 'autogen' }],
    script: 'stream\n    |from()\n        .measurement(\'tick\')\n',
    vars: {
      var1: {
        value: 42,
        type: 'float'
      }
    }
  };
  const res = await kapacitor.createTask(task);
  console.log(res);
};

const testDropTask = async () => {
  await kapacitor.dropTask('test_kapa');
};

describe('test kapacitor', () => {
  it('should create task', testCreateTask);
  it('should drop task', testDropTask);
});
