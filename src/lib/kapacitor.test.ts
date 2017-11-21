import * as assert from 'power-assert';
import { Kapacitor, ITask, IUpdateTask, ITemplate, IUpdateTemplate, IPingStats, ConfigUpdateAction } from './kapacitor';

const kapacitor = new Kapacitor({
  host: '192.168.99.100'
});

const testCreateTask = async () => {
  const task: ITask = {
    id: 'test_kapa',
    type: 'stream',
    dbrps: [{ db: 'test', rp: 'autogen' }],
    script: `stream
              |from()
                .measurement("tick")`,
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

const testCreateTemplate = async () => {
  const template: ITemplate = {
    id: 'test_template',
    type: 'stream',
    script: `
      // Which measurement to consume
      var measurement string
      // Optional where filter
      var where_filter = lambda: TRUE
      // Optional list of group by dimensions
      var groups = [*]
      // Which field to process
      var field string
      // Warning criteria, has access to 'mean' field
      var warn lambda
      // Critical criteria, has access to 'mean' field
      var crit lambda
      // How much data to window
      var window = 5m
      // The slack channel for alerts
      var slack_channel = '#alerts'

      stream
          |from()
              .measurement(measurement)
              .where(where_filter)
              .groupBy(groups)
          |window()
              .period(window)
              .every(window)
          |mean(field)
          |alert()
              .warn(warn)
              .crit(crit)
              .slack()
              .channel(slack_channel)
    `,
    vars: {
      var1: {
        value: 42,
        type: 'float'
      }
    }
  };
  const res = await kapacitor.createTemplate(template);
  console.log(res);
};

const testGetTemplate = async () => {
  const tmplId = 'test_template';
  let res = await kapacitor.getTemplate(tmplId);
  assert(res.id === tmplId);
  res = await kapacitor.getTemplate(tmplId, {scriptFormat: 'raw'})
  console.log(res.dot);
};

const testGetNoExistsTemplate = async () => {
  const tmplId = 'test_template22';
  try {
    let res = await kapacitor.getTemplate(tmplId);
    assert(res.id === tmplId);
    res = await kapacitor.getTemplate(tmplId, {scriptFormat: 'raw'})
    console.log(res.dot);
  } catch (e) {
    assert(e.message === 'no template exists');
  }
};

const testUpdateTemplate = async () => {
  const tmpl: IUpdateTemplate = {
    id: 'test_template',
    vars: {
      var1: {
        value: 42,
        type: 'float'
      }
    }
  };
  const res = await kapacitor.updateTemplate(tmpl);
  console.log(res.modified);
  // console.log(res);
};

const testRemoveTemplate = async () => {
  await kapacitor.removeTemplate('test_template');
};

const testGetTemplates = async () => {
  let res = await kapacitor.getTemplates();
  assert(res.templates);
  res = await kapacitor.getTemplates({
    scriptFormat: 'raw',
    limit: 5
  })
  console.log(JSON.stringify(res, null, 2));
};

const testPing = async () => {
  const res: IPingStats[] = await kapacitor.ping(3000);
  assert(res.length > 0);
  assert(res[0].online);
  console.log('version: ', res[0].version);
};

const testGetConfig = async () => {
  let res = await kapacitor.getConfig();
  assert(res['link']['href'] === '/kapacitor/v1/config');
  res = await kapacitor.getConfig('influxdb');
  assert(res['link']['href'] === '/kapacitor/v1/config/influxdb');
  res = await kapacitor.getConfig('influxdb', 'default');
  assert(res['link']['href'] === '/kapacitor/v1/config/influxdb/default');
};

const testUpdateConfig = async () => {

  let influxdb = await kapacitor.getConfig('influxdb', 'default');
  const disableSubscriptions = influxdb['options']['disable-subscriptions'];
  console.log('disable-subscriptions: ', disableSubscriptions);
  const action: ConfigUpdateAction = {
    set: {
      'disable-subscriptions' : !disableSubscriptions
    }
  };
  await kapacitor.updateConfig(action, 'influxdb', 'default');

  influxdb = await kapacitor.getConfig('influxdb', 'default');
  const disableSubscriptions2 = influxdb['options']['disable-subscriptions'];
  console.log('disable-disableSubscriptions2: ', disableSubscriptions2);
  assert( disableSubscriptions2 === !disableSubscriptions);
};

describe('test kapacitor', () => {
  it('should create task', testCreateTask);
  it('should get task', testGetTask);
  it('should update task', testUpdateTask);
  it('should remove task', testRemoveTask);
  it('should get all task', testGetTasks);

  it('should create template', testCreateTemplate);
  it('should get template', testGetTemplate);
  it('should test get no exists template', testGetNoExistsTemplate);
  it('should update template', testUpdateTemplate);
  it('should remove template', testRemoveTemplate);
  it('should get all template', testGetTemplates);

  it('should test ping', testPing);

  it('should get config', testGetConfig);
  it('should update config', testUpdateConfig);
});
