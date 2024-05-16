// const searchButton = document.getElementById("search-btn");
// const searchInput = document.getElementById("username");
// const suggestionsList = document.getElementById("suggestions-list");
// const userDetailsDiv = document.getElementById("user-details");
// const messageArea = document.getElementById("send-messages");
// const messageInput = document.getElementById("message-input");
// const sendButton = document.getElementById("send-btn");
// const messagesList = document.getElementById("messages-list");
// const partnersList = document.getElementById("partners-list");
// const profileInfo = document.getElementById("profile-info");
// const mainSection = document.getElementById("main-section");
// const chatSection = document.getElementById("chat-section");
// const searchSection = document.getElementById("search-section");

// // Setup the socket connection
// const socket = io();

// // Variables for user email and selected user email
// let selectedEmail;
// const loggedInUserEmail = sessionStorage.getItem("email");

// // Handle socket events
// socket.on("connect", () => {
//   socket.emit("register", loggedInUserEmail);
// });

// document.getElementById("profile-btn").addEventListener("click", function () {
//   var profileInfo = document.getElementById("profile-info");
//   var mainSection = document.getElementById("main-section");
//   var chatSection = document.getElementById("chat-section");
//   var searchSection = document.getElementById("search-section");

//   if (profileInfo.style.display === "none" || !profileInfo.style.display) {
//     profileInfo.style.display = "block";
//     searchSection.classList.add("blur");

//     searchSection.classList.add("non-clickable");
//   } else {
//     profileInfo.style.display = "none";
//     mainSection.classList.remove("blur");
//     chatSection.classList.remove("non-clickable");
//     searchSection.classList.remove("non-clickable");
//   }
// });

// const closeButton = document.getElementById("profile-close-btn");
// closeButton.addEventListener("click", function () {
//   var profileInfo = document.getElementById("profile-info");
//   var chatSection = document.getElementById("chat-section");
//   var searchSection = document.getElementById("search-section");

//   profileInfo.style.display = "none";
//   searchSection.classList.remove("blur");
//   chatSection.classList.remove("non-clickable");
//   searchSection.classList.remove("non-clickable");
// });

// socket.on("reply", (data) => {
//   if (data.fromEmail === selectedEmail) {
//     appendMessage(data.message, "received");
//   } else {
//     console.log("Received message for another chat:", data);
//     markConversationAsUpdated(data.fromEmail);
//   }
//   messagesList.scrollTop = messagesList.scrollHeight;
// });

// function appendMessage(message, type) {
//   const messageDiv = document.createElement("div");
//   messageDiv.className = type === "sent" ? "outgoing" : "incoming";
//   messageDiv.textContent = message;
//   messagesList.appendChild(messageDiv); // Append at the bottom
//   messagesList.scrollTop = messagesList.scrollHeight; // Scroll to the bottom
// }

// document.addEventListener("DOMContentLoaded", async () => {
//   if (!loggedInUserEmail) {
//     console.log("User is not logged in");
//     return;
//   }

//   messageArea.style.display = "none";

//   try {
//     const response = await axios.get(
//       "http://localhost:5000/getConversationPartners",
//       { params: { email: loggedInUserEmail } }
//     );
//     const partners = response.data;
//     displayConversationPartners(partners);
//   } catch (error) {
//     console.error("Failed to fetch conversation partners:", error);
//   }
// });

// // function displayConversationPartners(partners) {
// //   partnersList.innerHTML = "";

// //   partners.forEach((partner) => {
// //     const partnerElement = document.createElement("li");
// //     partnerElement.setAttribute("data-email", partner.email);

// //     // Determine who sent the last message and prepend "You: " if it was the logged-in user
// //     const messagePrefix =
// //       partner.lastMessageSender === loggedInUserEmail ? "You: " : "";
// //     const messageContent = partner.lastMessage
// //       ? `${messagePrefix}${partner.lastMessage}`
// //       : "No messages yet";

// //     partnerElement.innerHTML = `
// //           <strong>${partner.name}</strong>
// //           <p>${messageContent}</p>
// //           ${partner.unread ? "<span>New!</span>" : ""}
// //         `;

// //     partnerElement.onclick = () => {
// //       selectedEmail = partner.email;
// //       userDetailsDiv.innerHTML = `<h2>${partner.name}</h2><p>Email: ${partner.email}</p>`;
// //       messageArea.style.display = "block";
// //       loadMessages(partner.email, loggedInUserEmail); // Function to fetch and display messages
// //     };

// //     partnersList.appendChild(partnerElement);
// //   });
// // }

// function displayConversationPartners(partners) {
//   partnersList.innerHTML = "";
//   partners.forEach((partner) => {
//     const partnerElement = document.createElement("li");
//     partnerElement.className = "partner-item";
//     partnerElement.setAttribute("data-email", partner.email);

//     const messagePrefix =
//       partner.lastMessage.sender === loggedInUserEmail ? "You: " : "";
//     const messageContent = partner.lastMessage
//       ? `${messagePrefix}${partner.lastMessage.message}`
//       : "No messages yet";

//     partnerElement.innerHTML = `
//             <div><strong>${partner.name}</strong><p>${messageContent}</p></div>
//             <div>${
//               partner.unread ? "<span class='new-message'>New!</span>" : ""
//             }</div>
//         `;

//     partnerElement.onclick = () => {
//       selectedEmail = partner.email;
//       userDetailsDiv.innerHTML = `<h2>${partner.name}</h2><p>Email: ${partner.email}</p>`;
//       messageArea.style.display = "block";
//       loadMessages(partner.email, loggedInUserEmail);
//     };

//     partnersList.appendChild(partnerElement);
//   });
// }

// function markConversationAsUpdated(email) {
//   const children = partnersList.children;
//   for (let i = 0; i < children.length; i++) {
//     const partnerEmail = children[i].getAttribute("data-email");
//     if (partnerEmail === email) {
//       children[i].classList.add("new-message");
//       break;
//     }
//   }
// }

// async function loadMessages(partnerEmail, userEmail) {
//   const response = await axios.get("http://localhost:5000/getMessages", {
//     params: { partnerEmail, userEmail },
//   });
//   messagesList.innerHTML = "";
//   response.data.reverse().forEach((msg) => {
//     // Reverse the array to display in correct order
//     appendMessage(msg.text, msg.sentByCurrentUser ? "sent" : "received");
//   });
// }

// // User search
// searchButton.addEventListener("click", async () => {
//   const name = searchInput.value.trim();
//   if (!name) return;

//   try {
//     const response = await axios.get("http://localhost:5000/findUser", {
//       params: { name },
//     });
//     if (response.data.user) {
//       const userData = response.data.user;
//       userDetailsDiv.innerHTML = `<h2>${userData.name}</h2><p>Email: ${userData.email}</p>`;
//       messageArea.style.display = "block";
//       sessionStorage.setItem("targetUserId", userData._id);
//       messagesList.innerHTML = "";
//     } else {
//       userDetailsDiv.innerHTML = "<p>User not found. Please try again.</p>";
//       messageArea.style.display = "none";
//     }
//   } catch (error) {
//     console.error("Error:", error.message);
//     userDetailsDiv.innerHTML = "<p>Failed to search user.</p>";
//     messageArea.style.display = "none";
//   }
// });

// // User autocomplete
// searchInput.addEventListener("input", async () => {
//   const query = searchInput.value.trim();
//   if (!query) {
//     suggestionsList.innerHTML = "";
//     return;
//   }

//   try {
//     const response = await axios.get(
//       `http://localhost:5000/autocomplete?query=${query}`
//     );
//     const users = response.data;

//     suggestionsList.innerHTML = "";
//     users.forEach((user) => {
//       const listItem = document.createElement("li");
//       listItem.textContent = user.name;
//       listItem.addEventListener("click", () => {
//         messagesList.innerHTML = "";
//         selectedEmail = user.email;
//         userDetailsDiv.innerHTML = `<h1>${user.name}</h1><p>Email: ${user.email}</p>`;
//         messageArea.style.display = "block";
//       });
//       suggestionsList.appendChild(listItem);
//     });
//   } catch (error) {
//     console.error("Error:", error);
//   }
// });

// // Send message
// sendButton.addEventListener("click", () => {
//   const message = messageInput.value.trim();
//   if (!message) return;

//   socket.emit("message", {
//     message: message,
//     selectedEmail: selectedEmail,
//     loggedInUser: loggedInUserEmail,
//   });

//   appendMessage(message, "sent");
//   messageInput.value = "";
// });

// Get the required DOM elements
const searchButton = document.getElementById("search-btn");
const searchInput = document.getElementById("username");
const suggestionsList = document.getElementById("suggestions-list");
const userDetailsDiv = document.getElementById("user-details");
const messageArea = document.getElementById("send-messages");
const messageInput = document.getElementById("message-input");
const sendButton = document.getElementById("send-btn");
const messagesList = document.getElementById("messages-list");
const partnersList = document.getElementById("partners-list");
const profileInfo = document.getElementById("profile-info");
const mainSection = document.getElementById("main-section");
const chatSection = document.getElementById("chat-section");
const searchSection = document.getElementById("search-section");

// Setup the socket connection
const socket = io();

// Variables for user email and selected user email
let selectedEmail;
const loggedInUserEmail = sessionStorage.getItem("email");
const loggedInUserName = sessionStorage.getItem("name");
console.log(loggedInUserName);

// Handle socket events
socket.on("connect", () => {
  socket.emit("register", loggedInUserEmail);
});

document.getElementById("profile-btn").addEventListener("click", function () {
  if (profileInfo.style.display === "none" || !profileInfo.style.display) {
    profileInfo.style.display = "block";
    document.getElementById("profile-name").textContent = loggedInUserName;
    document.getElementById("profile-email").textContent = loggedInUserEmail;

    searchSection.classList.add("blur");
    searchSection.classList.add("non-clickable");
  } else {
    profileInfo.style.display = "none";
    mainSection.classList.remove("blur");
    chatSection.classList.remove("non-clickable");
    searchSection.classList.remove("non-clickable");
  }
});

const closeButton = document.getElementById("profile-close-btn");
closeButton.addEventListener("click", function () {
  profileInfo.style.display = "none";
  searchSection.classList.remove("blur");
  chatSection.classList.remove("non-clickable");
  searchSection.classList.remove("non-clickable");
});

socket.on("reply", (data) => {
  if (data.fromEmail === selectedEmail) {
    appendMessage(data.message, "received");
  } else {
    markConversationAsUpdated(data.fromEmail);
  }
  messagesList.scrollTop = messagesList.scrollHeight;
});

function appendMessage(message, type) {
  const messageDiv = document.createElement("div");
  messageDiv.className = type === "sent" ? "outgoing" : "incoming";
  messageDiv.textContent = message;
  messagesList.appendChild(messageDiv); // Append at the bottom
  messagesList.scrollTop = messagesList.scrollHeight; // Scroll to the bottom
}

document.addEventListener("DOMContentLoaded", async () => {
  if (!loggedInUserEmail) {
    console.log("User is not logged in");
    return;
  }

  messageArea.style.display = "none";

  try {
    const response = await axios.get(
      "http://localhost:5000/getConversationPartners",
      { params: { email: loggedInUserEmail } }
    );
    const partners = response.data;
    displayConversationPartners(partners);
  } catch (error) {
    console.error("Failed to fetch conversation partners:", error);
  }
});

// function displayConversationPartners(partners) {
//   partnersList.innerHTML = "";
//   partners.forEach((partner) => {
//     const partnerElement = document.createElement("li");
//     partnerElement.className = "partner-item";
//     partnerElement.setAttribute("data-email", partner.email);

//     const messagePrefix =
//       partner.lastMessage.sender === loggedInUserEmail ? "You: " : "";
//     const messageContent = partner.lastMessage
//       ? `${messagePrefix}${partner.lastMessage.message}`
//       : "No messages yet";

//     partnerElement.innerHTML = `
//       <div><strong>${partner.name}</strong><p>${messageContent}</p></div>
//       <div>${
//         partner.unread ? "<span class='new-message'>New!</span>" : ""
//       }</div>
//     `;

//     partnerElement.onclick = () => {
//       selectedEmail = partner.email;
//       userDetailsDiv.innerHTML = `<h2>${partner.name}</h2>`;
//       messageArea.style.display = "block";
//       loadMessages(partner.email, loggedInUserEmail);

//       // Mark messages as read
//       const newMessageSpan = partnerElement.querySelector(".new-message");
//       if (newMessageSpan) {
//         newMessageSpan.remove();
//       }

//       markMessagesAsRead(partner.email, loggedInUserEmail);
//     };

//     partnersList.appendChild(partnerElement);
//   });
// }

function displayConversationPartners(partners) {
  partnersList.innerHTML = "";
  partners.forEach((partner) => {
    const partnerElement = document.createElement("li");
    partnerElement.className = "partner-item";
    partnerElement.setAttribute("data-email", partner.email);

    const messagePrefix =
      partner.lastMessage.sender === loggedInUserEmail ? "You: " : "";
    const messageContent = partner.lastMessage
      ? `${messagePrefix}${partner.lastMessage.message}`
      : "No messages yet";

    partnerElement.innerHTML = `
      <div>
        <strong>${partner.name}</strong>
        <p>${messageContent}</p>
      </div>
      <div>
        ${partner.unread ? "<span class='new-message'>New!</span>" : ""}
        <button class='delete-btn'>Delete</button>
      </div>
    `;

    partnerElement.onclick = (e) => {
      if (e.target.classList.contains("delete-btn")) {
        e.stopPropagation();
        deleteConversation(partner.email);
      } else {
        selectedEmail = partner.email;
        userDetailsDiv.innerHTML = `<h2>${partner.name}</h2>`;
        messageArea.style.display = "block";
        messagesLoaded = 0;
        loadMessages(partner.email, loggedInUserEmail);
        markMessagesAsRead(partner.email, loggedInUserEmail);
      }
    };

    partnersList.appendChild(partnerElement);
  });
}

function deleteConversation(partnerEmail) {
  axios
    .delete("http://localhost:5000/deleteConversation", {
      data: { partnerEmail, userEmail: loggedInUserEmail },
    })
    .then((response) => {
      console.log("Conversation deleted");
      // Remove partner from UI
      const partnerElement = partnersList.querySelector(
        `[data-email='${partnerEmail}']`
      );
      if (partnerElement) {
        partnersList.removeChild(partnerElement);
      }
    })
    .catch((error) => {
      console.error("Failed to delete conversation:", error);
    });
}

function markMessagesAsRead(partnerEmail, userEmail) {
  axios
    .post("http://localhost:5000/markAsRead", {
      partnerEmail,
      userEmail,
    })
    .then((response) => {
      console.log("Messages marked as read");
    })
    .catch((error) => {
      console.error("Failed to mark messages as read:", error);
    });
}

function markConversationAsUpdated(email) {
  const children = Array.from(partnersList.children);
  let updatedConversation;
  for (let i = 0; i < children.length; i++) {
    const partnerEmail = children[i].getAttribute("data-email");
    if (partnerEmail === email) {
      updatedConversation = children[i];
      partnersList.removeChild(updatedConversation);
      const newMessageSpan = updatedConversation.querySelector(".new-message");
      if (newMessageSpan) {
        newMessageSpan.style.display = "inline";
      } else {
        const newSpan = document.createElement("span");
        newSpan.className = "new-message";
        newSpan.textContent = "New!";
        updatedConversation.querySelector("div").appendChild(newSpan);
      }
      break;
    }
  }
  if (updatedConversation) {
    partnersList.insertBefore(updatedConversation, partnersList.firstChild);
  }
}

async function loadMessages(partnerEmail, userEmail) {
  const response = await axios.get("http://localhost:5000/getMessages", {
    params: { partnerEmail, userEmail },
  });
  messagesList.innerHTML = "";
  response.data.reverse().forEach((msg) => {
    appendMessage(msg.text, msg.sentByCurrentUser ? "sent" : "received");
  });
}

// User search
searchButton.addEventListener("click", async () => {
  const name = searchInput.value.trim();
  if (!name) return;

  try {
    const response = await axios.get("http://localhost:5000/findUser", {
      params: { name },
    });
    if (response.data.user) {
      const userData = response.data.user;
      userDetailsDiv.innerHTML = `<h2>${userData.name}</h2><p>Email: ${userData.email}</p>`;
      messageArea.style.display = "block";
      sessionStorage.setItem("targetUserId", userData._id);
      messagesList.innerHTML = "";
    } else {
      userDetailsDiv.innerHTML = "<p>User not found. Please try again.</p>";
      messageArea.style.display = "none";
    }
  } catch (error) {
    console.error("Error:", error.message);
    userDetailsDiv.innerHTML = "<p>Failed to search user.</p>";
    messageArea.style.display = "none";
  }
});

// User autocomplete
searchInput.addEventListener("input", async () => {
  const query = searchInput.value.trim();
  if (!query) {
    suggestionsList.innerHTML = "";
    return;
  }

  try {
    const response = await axios.get(
      `http://localhost:5000/autocomplete?query=${query}`
    );
    const users = response.data;

    suggestionsList.innerHTML = "";
    users.forEach((user) => {
      const listItem = document.createElement("li");
      listItem.textContent = user.name;
      listItem.addEventListener("click", () => {
        messagesList.innerHTML = "";
        selectedEmail = user.email;
        userDetailsDiv.innerHTML = `<h1>${user.name}</h1>`;
        // <p>Email: ${user.email}</p>`;
        messageArea.style.display = "block";
      });
      suggestionsList.appendChild(listItem);
    });
  } catch (error) {
    console.error("Error:", error);
  }
});

// Send message
sendButton.addEventListener("click", () => {
  const message = messageInput.value.trim();
  if (!message) return;

  socket.emit("message", {
    message: message,
    selectedEmail: selectedEmail,
    loggedInUser: loggedInUserEmail,
  });

  appendMessage(message, "sent");
  messageInput.value = "";
});
