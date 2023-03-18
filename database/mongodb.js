const mongoose = require("mongoose");
const CONFIG = require("../config/config");

function connectToDb() {
  mongoose.connect(CONFIG.MONGODB_URL);

  mongoose.connection.on("connected", () => {
    console.log("Bot is connected to MongoDB successfully");
  });
  mongoose.connection.on("error", (err) => {
    console.log("An error occurred while connecting to the Database");
    console.log(err);
  });
}
mongoose.set("strictQuery", false);
module.exports = connectToDb;
