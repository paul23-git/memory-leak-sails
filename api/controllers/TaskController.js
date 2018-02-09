const WorkerController = require('./WorkerController').WorkerController;
'use strict';

async function addTask(orderId, newStatus) {
  const date = new Date();
  let id = await Task.count();
  const bigger = await Task.find({
    queueId: {'>=': id}
  }).sort('queueId DESC');
  if (bigger.length > 0) {
    id = bigger[0].queueId + 1;
  }
  const data = {newStatus: newStatus};
  const [checkTask, updateTask, recheckTask] = await Promise.all([
    Task.create({
      orderId: orderId,
      queueId: id,
      queueStatus: 'new',
      jobType: 'check',
      lastActive: date
    }).fetch(),
    Task.create({
      orderId: orderId,
      queueId: id + 1,
      queueStatus: 'new',
      jobType: 'update',
      argData: JSON.stringify(data),
      lastActive: date
    }).fetch(),
    Task.create({
      orderId: orderId,
      queueId: id + 2,
      queueStatus: 'new',
      jobType: 'recheck',
      lastActive: date
    }).fetch()
  ]);
  await Promise.all([
    Task.addToCollection(checkTask.id, 'relatedTasks', updateTask.id),
    Task.addToCollection(updateTask.id, 'relatedTasks', recheckTask.id),
  ]);
  return [checkTask, updateTask, recheckTask];
}

function changeTaskQueueStatus(task, newStatus) {
  const old = task.queueStatus;
  const dat = {queueStatus: newStatus};

  if (old === newStatus) {
    return [task];
  }
  if (old === 'active') {
    dat.lastActive = new Date();
  }
  return Task.update({queueId: task.queueId}, dat).fetch();
}

async function changeTaskQueueStatusId(id, newStatus) {
  'use strict';
  const task = await Task.findOne({queueId: id});
  return await changeTaskQueueStatus(task, newStatus);
}

async function makeTaskActive(task) {
  'use strict';
  return await changeTaskQueueStatus(task, 'active');
}
async function makeTaskActiveId(id) {
  'use strict';
  const task = await Task.findOne({queueId: id});
  return await makeTaskActive(task);
}

module.exports = {
  addTaskCall: function(req, res) {
    const params = req.allParams();
    const orderId = parseInt(params.orderId);
    const newStatus = params.newStatus;
    if (orderId === undefined || newStatus === undefined) {
      res.badRequest();
    }
    addTask(orderId, newStatus)
      .then(function(result) {
        res.send(result);
      })
      .catch(function(err) {
        console.log(err);
        res.send(err);
      });
  },

  makeTaskActiveCall: function(req, res) {
    'use strict';
    const params = req.allParams();
    const id = parseInt(params.queueId);
    if (id === undefined) {
      res.badRequest();
    }
    makeTaskActiveId(id)
      .then(function(result) {
        res.send(result);
      })
      .catch(function(err) {
        console.log(err);
        res.send(err);
      });
  },

  setTaskStatusCall: function(req, res) {
    'use strict';
    const params = req.allParams();
    const id = parseInt(params.queueId);
    const status = params.queueStatus;
    if (id === undefined || status === undefined) {
      res.badRequest();
    }
    changeTaskQueueStatusId(id, status)
      .then(function(result) {
        res.send(result);
      })
      .catch(function(err) {
        console.log(err);
        res.send(err);
      });
  },


  startRunCall: async function(req, res) {
    const worker = new WorkerController();
    await worker.DoRun();
    //await sails.hooks.manager.startWorker();
    res.ok();
  }
};

module.exports.addTask = addTask;
module.exports.makeTaskActive = makeTaskActive;
