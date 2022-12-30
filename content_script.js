// Listen for clicks on the browser action button
chrome.browserAction.onClicked.addListener(function(tab) {
  // Send a message to the active tab to get the chat with ChatGPT
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {request: "get_chat"}, function(response) {
      // If the chat was successfully retrieved, send a request to the background script to publish the chat
      if (response.success) {
        chrome.runtime.sendMessage({request: "publish_chat", chat: response.chat});
      }
    });
  });
});
// Send the authentication token to the popup
window.opener.postMessage({
  type: "auth_token",
  authToken: "AUTH_TOKEN"
}, "*");

