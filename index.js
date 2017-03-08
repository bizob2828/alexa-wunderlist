'use strict';
const Alexa = require('alexa-sdk');
const request = require('request');
const _ = require('lodash');
const promise = require('bluebird');
const req = promise.promisify(request);
const apiBase = 'https://a.wunderlist.com/api/v1';

function makeRequest(uri, method, data) {
  let opts = {
    url: `${apiBase}/${uri}`,
    headers: {
      'X-Access-Token': process.env.WLIST_TOKEN,
      'X-Client-ID': process.env.WLIST_ID,
      'Content-Type': 'application/json'
    },
    method: method || 'GET'
  };

  if(data) {
    opts.body = data;
    opts.json = true;
  }

  return req(opts).then((res) => res.body);
}

function getLists() {
  return makeRequest('lists').then((lists) => {
    return _.map(JSON.parse(lists), (list) => ({ id: list.id, title: list.title }));
  });
}

function getList(list) {
  return makeRequest('lists').then((lists) => {
    return _.filter(JSON.parse(lists), (l) => l.title.toLowerCase() === list.toLowerCase())[0].id;
  });

}

function getTasks(list) {
  return getList(list).then((id) => {
    return makeRequest(`tasks?list_id=${id}`, 'GET');
  })
  .then((tasks) => {
    return _.map(JSON.parse(tasks), (list) => ({ id: list.id, title: list.title }));
  });
}

function createTask(task, list) {
  return getList(list).then((id) => {
    return makeRequest('tasks', 'POST', { list_id: id, title: task });
  });

}

const handlers = {
  'AddItem': function() {
    let list = this.event.request.intent.slots.List.value
      , item = this.event.request.intent.slots.Item.value;

    createTask(item, list).then(() => this.emit(':tell', `Item added to ${list}`));
  },
  'ListContents': function() {
    let list = this.event.request.intent.slots.List.value;

    getTasks(list).then((tasks) => {
      this.emit(':tell', `Items on list are: ${_.map(tasks, 'title').join(' ')}`);
    });
  },
  'GetLists': function() {
    getLists().then((lists) => {
      this.emit(':tell', `Your lists are : ${_.map(lists, 'title').join(' ')}`);
    });
  }
};

exports.handler = (event, context, cb) => {
  const alexa = Alexa.handler(event, context);
  alexa.registerHandlers(handlers);
  alexa.execute();
};
