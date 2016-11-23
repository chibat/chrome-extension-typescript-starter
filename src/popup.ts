import * as moment from 'moment';

function renderStatus(statusText) {
  document.getElementById('status').textContent = statusText;
}

document.addEventListener('DOMContentLoaded', function() {
  const queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    document.getElementById('url').textContent = tabs[0].url;
    document.getElementById('time').textContent = moment().format('YYYY-MM-DD HH:mm:ss');
  });
});
