const chatForm = document.getElementById("chat-form");
const chatMessage = document.querySelector(".chat-messages");

//connect to the socket
const socket = io();

const displayOptions = (options) => {
  const message = `<ul> ${options
    .map((option) => `<li>${option}</li>`)
    .join("")} </ul>`;
  displayMessage(message, true);
};

const displayMessage = (message, isBotMessage) => {
  const div = document.createElement("div");
  div.className = `message message-${isBotMessage ? "bot" : "user"}`;
  div.innerHTML = message;

  document.querySelector(".chat-messages").append(div);
  chatMessage.scrollTop = chatMessage.scrollHeight;
};

const displayMenu = (menus) => {
  const message = `<ol start=2> ${menus
    .map((menu) => `<li>${menu.name}</li>`)
    .join("")} </ol>`;
  displayMessage(message, true);
};

const displayOrder = (orders) => {
  if (orders.includes(null)) {
    const newOrder = orders.filter((value) => value !== null);
    const message = `There is an invalid order, You ordered for : \n <ul> ${newOrder
      .map((order) => `<li>${order.name}</li>`)
      .join("")} </ul> \n\n <br> Select 0 to cancel order `;

    console.log(newOrder);

    displayMessage(message, true);
  } else {
    const options = [
      "Continue your order by clicking 2 - 11",
      "Type 99 to checkout order",
      "Type 98 to see order history",
      "Type 97 to see current order",
      "Type 0 to cancel order",
    ];

    const message = `You just ordered for : \n <ul> ${orders
      .map((order) => `<li>${order.name}</li>`)
      .join("")} </ul>`;
    console.log("message", message);
    displayMessage(message, true);
    displayOptions(options);
  }
};

const displayCheckout = (orders) => {
  const message = `Checkout : \n <ul> ${orders
    .map((order) => `<li>${order.name}</li>`)
    .join("")} </ul>`;
  displayMessage(message, true);
};

const orderHistory = (orders) => {
  const message = `Your Order History : \n <ul> ${orders
    .map((order) => `<li>${order.name}</li>`)
    .join("")} </ul>`;
  displayMessage(message, true);
};
//When a user connects
socket.on("connect", () => {
  console.log("You are connected:", socket.id);
});

socket.on("welcome", ({ options }) => {
  displayOptions(options);
});

socket.on("botResponse", ({ type, data }) => {
  switch (type) {
    case "menu":
      displayMenu(data);
      break;
    case "pattern":
      displayOrder(data);
      break;
    case "no-checkout":
      displayMessage(data.message, true);
      break;
    case "checkout":
      displayCheckout(data);
      break;
    case "no-order":
      displayMessage(data.message, true);
      break;
    case "currentOrder":
      displayOrder(data);
      break;
    case "no-cancel":
      displayMessage(data.message, true);
      break;
    case "wrong-input":
      displayMessage(data.message, true);
      break;
    case "order-history":
      orderHistory(data);
      break;
    default:
      displayMessage(data.message, true);
      break;
  }
});

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Get message text
  let messageInput = e.target.elements.messageInput.value.trim();

  displayMessage(messageInput, false);
  //emit message to the server
  socket.emit("chatMessage", messageInput);

  //clear the message
  e.target.elements.messageInput.value = "";
  e.target.elements.messageInput.focus();
});

//output message to DOM
function outputMessage(message) {}

// //get the elements from the DOM
// const messages = document.getElementById("messages");
// const chatForm = document.getElementById("chat-form");

// //listen for the chat message event from the server
// socket.on("chat message", (message) => {
//   //output the message to the DOM
//   outputMessage(message);
// });

// //attach an event listener to the form
// chatForm.addEventListener("submit", (e) => {
//   //prevent the default behaviour
//   e.preventDefault();

//   //get the message from the input
//   const message = e.target.elements["message-input"].value;

//   //sends the message to the server
//   socket.emit("chat message", message);

//   //clear the input field
//   e.target.elements["message-input"].value = "";
//   e.target.elements["message-input"].focus();
// });

// //Output the message to the DOM
// const outputMessage = (message) => {
//   //create a div element
//   const div = document.createElement("div");
//   div.classList.add("message");
//   //check if the message is from the bot or the user
//   if (message.sender === "Bot") {
//     div.innerHTML = `User: ${message.message}`;
//   } else {
//     div.innerHTML = `Bot: ${message.message}`;
//   }
//   //append the div to the messages div
//   messages.appendChild(div);
// };
