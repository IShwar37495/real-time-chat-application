require("dotenv").config();
const mongoose = require("mongoose");

const connectdb = async () => {
  try {
    const connection = await mongoose.connect(`${process.env.MONGODB_URI}`);

    console.log("mongodb connected");
  } catch (error) {
    console.log("can't connect to the database", error);

    process.exit(1);
  }
};
module.exports = connectdb;
