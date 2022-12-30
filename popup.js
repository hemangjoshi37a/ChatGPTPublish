// Wait for the DOM to finish loading
document.addEventListener("DOMContentLoaded", function() {
  // Add a click event listener to the "Publish" button
  document.getElementById("publish-button").addEventListener("click", function() {
    // Get the values of the GitHub authentication token and the repository name from the form
    var authToken = document.getElementById("auth-token").value;
    var repository = document.querySelector('input[name="repository"]:checked').value;

    // Get the chat from the active tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {request: "get_chat"}, function(response) {
        // If the chat was successfully retrieved, call the publishChat function with the auth token, repository name, and chat
        if (response.success) {
          publishChat(authToken, repository, response.chat);
        }
      });
    });
  });
});

// Send a request to the server to publish the chat
function publishChat(authToken, repository, chat) {
  // Set up the request to the GitHub API to create a new file or update an existing file
  var xhr = new XMLHttpRequest();
  xhr.open("PUT", `https://api.github.com/repos/${repository}/contents/chat.txt`);
  xhr.setRequestHeader("Authorization", `Bearer ${authToken}`);
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

window.addEventListener("message", function(event) {
  // Check that the message is from the GitHub login page
  if (event.origin == "https://github.com") {
    // Get the authentication token from the message
    var authToken = event.data;
    // Set the value of the "auth-token" input to the authentication token
    document.getElementById("auth-token").value = authToken;
    // Get the user's repositories
    getRepositories(authToken);
  }
});

// Wait for the DOM to finish loading
document.addEventListener("DOMContentLoaded", function() {
  // Add a click event listener to the "Login with GitHub" button
  document.getElementById("login-button").addEventListener("click", function() {
    window.open("https://github.com/login", "_blank");
  });
});


// Get the user's repositories and display them in a radio button list
function getRepositories(authToken) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "https://api.github.com/user/repos", true);
  xhr.setRequestHeader("Authorization", `Bearer ${authToken}`);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      var repositories = JSON.parse(xhr.responseText);
      // Display the list of repositories in a radio button list
      var repositoryList = document.getElementById("repository-list");
      for (var i = 0; i < repositories.length; i++) {
        var repository = repositories[i];
        var label = document.createElement("label");
        var radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "repository";
        radio.value = repository.full_name;
        label.appendChild(radio);
        label.appendChild(document.createTextNode(repository.full_name));
        repositoryList.appendChild(label);
      }
    }
  }
  xhr.send();
}


