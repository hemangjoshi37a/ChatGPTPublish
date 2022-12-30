chrome.browserAction.onClicked.addListener(function(tab) {
  // inject the content script into the page
  chrome.tabs.executeScript(tab.id, {file: "content_script.js"});
});

// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  // If the message is a request to publish the chat, send a request to the server to publish the chat
  if (message.request == "publish_chat") {
    // Get the authentication token and repository from the message
    var authToken = message.authToken;
    var repository = message.repository;
    // Send a request to the server to publish the chat
    publishChat(authToken, repository, message.chat);
  }
});

// Send a request to the server to publish the chat
function publishChat(authToken, repository, chat) {
  // Set up the request to the GitHub API to create a new file or update an existing file
  var xhr = new XMLHttpRequest();
  xhr.open("PUT", "https://api.github.com/repos/" + repository + "/contents/chat.txt");
  xhr.setRequestHeader("Authorization", "Bearer " + authToken);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      // Send a response back to the popup with the server's response
      chrome.runtime.sendMessage({response: xhr.responseText});
    }
  }
  // Create the data for the new file or update the existing file with the chat
  var data = {
    "message": "Update chat",
    "content": btoa(chat)
  };
  xhr.send(JSON.stringify(data));
}

chrome.browserAction.setPopup({
  popup: "popup.html"
});
