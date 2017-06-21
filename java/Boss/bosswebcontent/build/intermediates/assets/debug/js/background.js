/* Copyright (c) 2015 Workshop 12 Inc. */
chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('chrome.html', {id: "brainiacWinID"});
});