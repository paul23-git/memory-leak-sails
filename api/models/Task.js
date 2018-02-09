/**
 * Session.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  migrate: 'alter',
  attributes: {
    orderId: {
      type: 'number',
      columnType: 'integer',
      required: true,
    },
    queueStatus: {
      type: 'string',
      defaultsTo: 'new',
    },
    jobType: {
      type: 'string',
      required: true,
    },
    result: {
      type: 'string',
      defaultsTo: '',
    },
    argData: {
      type: 'string',
      defaultsTo: '',
    },
    detail: {
      type: 'string',
      defaultsTo: '',
    },
    lastActive: {
      type: 'ref',
      columnType: 'timestamp',
    },
    notBefore: {
      collection: 'task',
      via: 'relatedTasks',
    },
    relatedTasks: {
      collection: 'task',
      via: 'notBefore',
    },
    updatedAt: {
      type: 'number',
      autoUpdatedAt: true,
    },
    priority: {
      type: 'number',
      defaultsTo: 1,
    }
  },
};
