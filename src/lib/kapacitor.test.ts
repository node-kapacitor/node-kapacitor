import * as assert from 'power-assert';
import { Kapacitor, ITask, IUpdateTask, dashToCamel } from './kapacitor';

const kapacitor = new Kapacitor();

const testCreateTask = async () => {
  const task: ITask = {
    id: 'test_kapa',
    type: 'stream',
    dbrps: [{ db: 'test', rp: 'autogen' }],
    script: 'stream\n    |from()\n        .measurement("tick")\n',
    vars: {
      var1: {
        value: 42,
        type: 'float'
      }
    }
  };
  const res = await kapacitor.createTask(task);
  // console.log(res);
};

const testGetTask = async () => {
  const taskId = 'test_kapa';
  let res = await kapacitor.getTask(taskId);
  assert(res.id === taskId);
  res = await kapacitor.getTask(taskId, {dotView: 'labels'})
  console.log(res.status);
};

const testUpdateTask = async () => {
  const task: IUpdateTask = {
    id: 'test_kapa',
    status: 'enabled'
  };
  const res = await kapacitor.updateTask(task);
  console.log(res.status);
  // console.log(res);
};

const testRemoveTask = async () => {
  await kapacitor.removeTask('test_kapa');
};

const testGetTasks = async () => {
  let res = await kapacitor.getTasks();
  assert(res.tasks);
  res = await kapacitor.getTasks({
    dotView: 'labels',
    limit: 5
  })
  console.log(JSON.stringify(res, null, 2));
};

describe('test kapacitor', () => {
  it('should create task', testCreateTask);
  it('should get task', testGetTask);
  it('should update task', testUpdateTask);
  it('should remove task', testRemoveTask);
  it('should get all task', testGetTasks);
});
