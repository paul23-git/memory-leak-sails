'use strict';

class WorkerController {
  constructor(maxOpenTasks, time, cooldown=1000, maxfail=100) {
    this.maxOpen = maxOpenTasks;
    this.time = time;
    this.active = false;
    this.cooldown = cooldown;
    this.waiter = undefined;
    this.maxfail = 100;
    this.cnt = 0;
  }

  async DoRun(runCount=0, maxCount=undefined) {
    while (maxCount === undefined || runCount < maxCount) {
      this.cnt += 1;
      runCount += 1;
      console.log(`total run count: ${this.cnt}`);
      this.waiter = undefined;
      let taskList;
      try {
        this.active = true;
        taskList = await Task.find({}).populate('relatedTasks').populate('notBefore');
        //taskList = await this.makeload();
      } catch (err) {
        console.error(err);
        this.active = false;
        return;
      }
    }

  }

}



module.exports = {};
module.exports.WorkerController = WorkerController;
