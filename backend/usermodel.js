const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userdetailSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    otp: {
      type: Number,
    },

    isLoggedIn: {
      type: Boolean,
      default: false,
    },
    accessToken: {
      type: String,
    },
  },
  { timestamps: true }
);

userdetailSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userdetailSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userdetailSchema.methods.generateAccessToken = function () {
  const secret = process.env.ACCESS_TOKEN_SECRET;

  console.log(secret);
  if (!secret) {
    console.log("unable to find secret");
  }
  return jwt.sign(
    {
      email: this.email,
      name: this.name,
    },

    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

const Userdetail = mongoose.model("Userdetail", userdetailSchema);

module.exports = Userdetail;
