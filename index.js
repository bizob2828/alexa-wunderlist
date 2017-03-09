'use strict';
const Alexa = require('alexa-sdk');
const request = require('request');
const _ = require('lodash');
const promise = require('bluebird');
const req = promise.promisify(request);
const apiBase = 'https://a.wunderlist.com/api/v1';

/**
 * Convenience method to make http requests to wunderlist API
 * @param uri {String} uri to make http request
 * @param method {String} POST, PUT, DELETE, defaults to GET
 * @param data {Object} post data for POST/PUT/DELETE requests
 */
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

/**
 * Retrieve all wunderlists
 * @return array of objects with id, title
 */
function getLists() {
  return makeRequest('lists').then((lists) => {
    return _.map(JSON.parse(lists), (list) => ({ id: list.id, title: list.title }));
  });
}

/**
 * Find a list by title
 * @param list {String} title of list
 * @return {Object} of entire list details
 */
function getList(list) {
  return makeRequest('lists').then((lists) => {
    return _.filter(JSON.parse(lists), (l) => l.title.toLowerCase() === list.toLowerCase())[0].id;
  });

}

/**
 * Retrieve tasks for a list
 * @param list {String} title of list
 * @returns array of objects with id, title
 */
function getTasks(list) {
  return getList(list).then((id) => {
    return makeRequest(`tasks?list_id=${id}`, 'GET');
  })
  .then((tasks) => {
    return _.map(JSON.parse(tasks), (list) => ({ id: list.id, title: list.title }));
  });
}

/**
 * Creates a task for a list
 * @param task {String} name of task
 * @param list {String} title of list
 */
function createTask(task, list) {
  return getList(list).then((id) => {
    return makeRequest('tasks', 'POST', { list_id: id, title: task });
  });

}

// defines how to handle the alexa skill methods
const handlers = {
  'AddItem': function() {
    let list = this.event.request.intent.slots.List.value
      , item = this.event.request.intent.slots.Item.value;

    createTask(item, list).then(() => this.emit(':tell', `Item ${item} added to ${list}`));
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

// registers handlers with alexa sdk
exports.handler = (event, context, cb) => {
  const alexa = Alexa.handler(event, context);
  alexa.registerHandlers(handlers);
  alexa.execute();
};
