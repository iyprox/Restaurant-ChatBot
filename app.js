// Description: This file is the entry point for the application
// Importing the required modules
const express = require("express");
const socketio = require("socket.io");
const Order = require("./model");

const path = require("path");

const http = require("http");
const session = require("express-session");


// Connection database
const CONFIG = require("./config/config");
const connectToDb = require("./database/mongodb");
// dotenv.config();

//creating an express app
const app = express();

//setting the public folder as the static folder
app.use(express.static(path.join(__dirname, "public")));

//session configuration
const sessionMiddleware = session({
	secret: "secret",
	resave: false,
	saveUninitialized: true,
	cookie: {
		secure: false,
		//set expiry time for session to 7 days
		maxAge: 1000 * 60 * 60 * 24 * 7,
	},
});

//creating a server
const server = http.createServer(app);
const io = socketio(server);

// Connect to Mongodb Database
connectToDb();

const botName = "ChatBot";

const options = [
  "Type 1 to Place an order",
  "Type 99 to checkout order",
  "Type 98 to see order history",
  "Type 97 to see current order",
  "Type 0 to cancel order",
];
const menus = [
  { id: 2, name: "Cheeseburger" },
  { id: 3, name: "Grilled Chicken Sandwich" },
  { id: 4, name: "Caesar Salad" },
  { id: 5, name: "Spaghetti and Meatballs" },
  { id: 6, name: "Fish and Chips" },
  { id: 7, name: "Chicken Alfredo" },
  { id: 8, name: "Steak Frites" },
  { id: 9, name: "Veggie Burger" },
  { id: 10, name: "French Onion Soup" },
  { id: 11, name: "Chocolate Cake" },
];

const orders = [];

//using the session middleware
app.use(sessionMiddleware);
io.engine.use(sessionMiddleware);

//listening for user connection
io.on("connection", (socket) => {

	console.log("a user connected", session.id);
  socket.emit("welcome", { options });
  const session = socket.request.session;

  socket.on(
    "chatMessage",
    (msg) => {
//Regex for 2-11, to pick a menu
const pattern = /^[2-9]|1[0-1]$/;

switch (true) {
  //Places an order
  case msg === "1":
    socket.emit("botResponse", { type: "menu", data: menus });
    break;
    //to checkout order
  case msg === "99":
    if (session.orders.length == 0) {
      socket.emit("botResponse", {
        type: "no-checkout",
        data: { message: "You have no order to checkout" },
      });
    } else {
      socket.emit("botResponse", {
        type: "checkout",
        data: session.orders,
      });
      session.orders = [];
      session.save();
    }

    break;
    //to see order history
  case msg === "98":
    socket.emit("botResponse", {
        type: "order-history",
        data: session.orders,
      })

    break;
    //to see current order
  case msg === "97":
    if (session.orders.length == 0) {
      socket.emit("botResponse", {
        type: "no-order",
        data: {
          message:
            "You have not made any order yet!  Type 1 to Place an order",
        },
      });
    } else {
      socket.emit("botResponse", {
        type: "currentOrder",
        data: session.orders,
      });
    }
    break;
    //cancel order
  case msg === "0":
    if (session.orders.length == 0) {
      socket.emit("botResponse", {
        type: "no-cancel",
        data: {
          message: "No order to cancel",
        },
      });
    } else {
      socket.emit("botResponse", {
        type: "cancel",
        data: {
          message: `You just cancelled your order of ${session.orders.length} item(s)
          `,
        },
      });
      session.orders = [];
      session.save();
    }
    break;
  case pattern.test(msg):
    const order = menus.find((item) => item.id == +msg);
    session.orders.push(order);

    const newOrder = new Order({
      sessionId: session.id,
      orders: session.orders,
    });

    newOrder.save();

    session.save();
    socket.emit("botResponse", { type: "pattern", data: session.orders });
    break;
  default:
    socket.emit("botResponse", {
      type: "wrong-input" || "null",
      data: {
        message: `Your input is wrong, Try again!`,
      },
    });
    break;
}
}
);
});






//   if (!session.orders) {
//     session.orders = [];
//     session.save();
//   }
// 	//get the session id from the socket
// 	// const session = socket.request.session;
// 	const sessionId = session.id;
//   console.log("someone connected!..", session.id);
//   socket.emit("welcome", { options });

// 	//the socket.id changes every time the user refreshes the page, so we use the session id to identify the user and create a room for them
// 	socket.join(sessionId);

//   //welcome the user
//   io.to(sessionId).emit("chat message", {sender: "Bot", message: "Welcome to my restaurant, let us have your order.."});

//   //a radom variable to store the user's progress
//   let progress = 0

//   //listen for the chat message event from the client
//   socket.on("chat message", (message) => {

//     //output the user message to the DOM by emitting the chat message event to the client
//     io.to(sessionId).emit("chat message", {sender: "Bot", message});

//      //logic to check the user's progress
//     switch(progress){
//       case 0:
//         //if the user replies, increase the progress and send the default message
//         io.to(sessionId).emit("chat message", {sender: "User", message:`Press any of the following keys: <br>
//     1. Place Order <br>
//     2. Checkout Order <br>
//     3. Order History <br>
//     4. Cancel Order <br>`});

//         progress = 1;
//         break;
//       case 1:
//         //the user has selected an option, so we check which option they selected
//         let botresponse = "";
//         if(message === "1"){
//           botresponse = "You selected option 1 <br> here is the menu";

//         }else if(message === "2"){
//           botresponse = "You selected option 2 <br> checkout your order";

//         }else if (message === "3"){
//           botresponse = "You selected option 3 <br> here is your order history";

//         }else if(message === "4"){
//           botresponse = "You selected option 4 <br>order canceled";

//         }else{
//           //if the user enters an invalid option, we send the default message
//           botresponse = "Invalid option <br> Press any of the following keys: <br> 1. Place Order <br> 2. Checkout Order <br> 3. Order History <br> 4. Cancel Order <br>";
//           progress = 1;
//           io.to(sessionId).emit("chat message", {sender: "Bot", message: botresponse});
//           return
//         }
//         io.to(sessionId).emit("chat message", {sender: "Bot", message: botresponse});

//         //reset the progress
//         progress = 0;
//         break;
//     }

//   });
// });

//starting the server
app.listen(CONFIG.PORT, () => {
  console.log(`Server is up on http://localhost:${CONFIG.PORT}`);
});
