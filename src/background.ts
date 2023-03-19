'use strict';


// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

import SearchEngine from './search';

const microsecondsPerMonth = 1000 * 60 * 60 * 24 * 30;

chrome.runtime.onInstalled.addListener(details => {
  console.log('onInstalled...')
  console.log(details)

  const oneYearAgo = (new Date).getTime() - microsecondsPerMonth * 12;

  chrome.history.search({
    'text': '', // all history
    'startTime': oneYearAgo,
    'maxResults': 10000,
  }, function (items) {
    items.forEach(item => {
      console.log('inserting', item.title, item.url)
      SearchEngine.insert(item.url, item.title)
      // console.log(item.title, item.url)
    });
    console.log('all history loaded')
  });
})


chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.status !== 'complete') {
    return
  }
  console.log('tab update complete');
  console.log(tab.title, tab.url);
  const id = SearchEngine.insert(tab.url, tab.title);
  console.log('get', SearchEngine.get(id));
});



chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('reveive:', message)
  console.log('sender:', sender)

  const q = message.query;
  if (!q) {
    sendResponse({ results: [] })
    return
  }

  const pages = SearchEngine.query(q);
  console.log('result:', pages)
  if(!pages) {
    sendResponse({ results: [] })
    return
  }
  sendResponse({
    results: pages.map((page: any, idx: any) => {
      return {
        key: idx,
        url: page.url,
        title: page.title,
      }
    })
  })


  // key++;
  // sendResponse({
  //   results: [
  //     { key: key++, value: 'hello world 01' },
  //     { key: key++, value: 'hello world 02' },
  //     { key: key++, value: 'hello world 03' },
  //   ]
  // })
})