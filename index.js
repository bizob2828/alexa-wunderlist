'use strict';
const request = require('request');
const _ = require('lodash');
const Promise = require('bluebird');
const req = Promise.promisify(request);
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
    return _.map(JSON.parse(lists), ({ id, title}) => ({ id, title }));
  });
}

function getList(list) {
  return makeRequest('lists').then((lists) => {
    return _.filter(JSON.parse(lists), (l) => l.title.toLowerCase() === list.toLowerCase())[0].id;
  });

}

function createTask(task, list) {
  return getList(list).then((id) => {
    return makeRequest('tasks', 'POST', { list_id: id, title: task });
  });

}

