const express = require("express");
const app = express();

const http = require("http");
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server);

const path = require("path");
const nodemailer = require("nodemailer");
const cookieParser = require("cookie-parser");

// app.set("views", path.join(__dirname, "views"));
const cors = require("cors");
// console.log(path.join(__dirname, "public"));
app.use(express.static("public"));
app.use(cors());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const connectdb = require(__dirname + "/backend/database");
const Userdetail = require(__dirname + "/backend/usermodel");
const Messagedetail = require(__dirname + "/backend/messagemodal");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { listeners } = require("./backend/usermodel");

connectdb();

server.listen(5000, () => {
  console.log("server listening on port 5000");
});

const emailToSocketId = {};

io.on("connection", (socket) => {
  console.log("User connected", socket.id);

  socket.on("register", async (email) => {
    emailToSocketId[email] = socket.id;
    console.log(`Email ${email} registered with socket ID ${socket.id}`);
    const user = await Userdetail.findOne({ email });
    if (user) {
      // join socket to rooms for each conversation
      const conversations = await Messagedetail.find({
        $or: [{ sender: user._id }, { receiver: user._id }],
      }).distinct("conversationId");
      conversations.forEach((conversationId) => {
        socket.join(conversationId.toString());
      });
    }
  });

  socket.on("message", async (data) => {
    const { message, selectedEmail, loggedInUser } = data;
    const sender = await Userdetail.findOne({ email: loggedInUser });
    const receiver = await Userdetail.findOne({ email: selectedEmail });
    if (sender && receiver) {
      let conversationId = new mongoose.Types.ObjectId();
      const previousMessage = await Messagedetail.findOne({
        $or: [
          { sender: sender._id, receiver: receiver._id },
          { sender: receiver._id, receiver: sender._id },
        ],
      });
      if (previousMessage) {
        conversationId = previousMessage.conversationId;
      }
      const newMessage = new Messagedetail({
        sender: sender._id,
        receiver: receiver._id,
        conversationId,
        message,
      });
      await newMessage.save();

      io.to(conversationId.toString()).emit("reply", {
        message,
        fromEmail: sender.email,
        type: "received",
      });

      const receiverSocketId = emailToSocketId[selectedEmail];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("reply", {
          message,
          fromEmail: sender.email,
          type: "notification",
        });
      }
    }
  });

  socket.on("disconnect", () => {
    console.log(`Socket ${socket.id} disconnected`);
    const entries = Object.entries(emailToSocketId);
    const entry = entries.find(([email, id]) => id === socket.id);
    if (entry) {
      const [email] = entry;
      delete emailToSocketId[email];
      console.log(`User with email ${email} disconnected`);
    }
  });
});

app.delete("/deleteConversation", async (req, res) => {
  const { partnerEmail, userEmail } = req.body;
  if (!userEmail || !partnerEmail) {
    return res.status(400).send("Both user and partner emails are required");
  }

  const [user, partner] = await Promise.all([
    Userdetail.findOne({ email: userEmail }),
    Userdetail.findOne({ email: partnerEmail }),
  ]);
  if (!user || !partner) {
    return res.status(404).send("Users not found");
  }

  await Messagedetail.deleteMany({
    $or: [
      { sender: user._id, receiver: partner._id },
      { sender: partner._id, receiver: user._id },
    ],
  });

  res.status(200).send("Conversation deleted");
});

// app.get("/getConversationPartners", async (req, res) => {
//   const email = req.query.email;
//   const user = await Userdetail.findOne({ email });
//   if (!user) return res.status(404).send("User not found");

//   const messages = await Messagedetail.find({
//     $or: [{ sender: user._id }, { receiver: user._id }],
//   })
//     .populate("sender receiver")
//     .sort({ createdAt: -1 });

//   const partners = messages.map((msg) => {
//     const otherUser = msg.sender._id.equals(user._id)
//       ? msg.receiver
//       : msg.sender;
//     return {
//       name: otherUser.name,
//       email: otherUser.email,
//       lastMessage: msg.message,
//       unread: !msg.read && msg.receiver._id.equals(user._id), // Only consider unread if this user is the receiver
//     };
//   });

// app.get("/getConversationPartners", async (req, res) => {
// Existing implementation...
// });

app.get("/getConversationPartners", async (req, res) => {
  const email = req.query.email;
  const user = await Userdetail.findOne({ email });
  if (!user) return res.status(404).send("User not found");

  const partners = await Messagedetail.aggregate([
    {
      $match: {
        $or: [{ sender: user._id }, { receiver: user._id }],
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $group: {
        _id: "$conversationId",
        lastMessage: { $first: "$$ROOT" },
      },
    },
    {
      $lookup: {
        from: "userdetails",
        localField: "lastMessage.sender",
        foreignField: "_id",
        as: "senderDetails",
      },
    },
    {
      $lookup: {
        from: "userdetails",
        localField: "lastMessage.receiver",
        foreignField: "_id",
        as: "receiverDetails",
      },
    },
    {
      $addFields: {
        partnerDetails: {
          $cond: {
            if: { $eq: ["$lastMessage.sender", user._id] },
            then: { $arrayElemAt: ["$receiverDetails", 0] },
            else: { $arrayElemAt: ["$senderDetails", 0] },
          },
        },
      },
    },
    {
      $project: {
        name: "$partnerDetails.name",
        email: "$partnerDetails.email",
        lastMessage: "$lastMessage.message",
        lastMessageSender: "$lastMessage.sender",
        unread: {
          $and: [
            { $eq: ["$lastMessage.receiver", user._id] },
            { $not: ["$lastMessage.read"] },
          ],
        },
      },
    },
  ]);

  res.send(
    partners.map((partner) => ({
      name: partner.name,
      email: partner.email,
      lastMessage: {
        sender:
          user._id.toString() === partner.lastMessageSender.toString()
            ? email
            : partner.email,
        message: partner.lastMessage,
      },
      unread: partner.unread,
    }))
  );
});

app.get("/getMessages", async (req, res) => {
  const { partnerEmail, userEmail } = req.query;
  if (!userEmail || !partnerEmail) {
    return res.status(400).send("Both user and partner emails are required");
  }
  const [user, partner] = await Promise.all([
    Userdetail.findOne({ email: userEmail }),
    Userdetail.findOne({ email: partnerEmail }),
  ]);
  if (!user || !partner) {
    return res.status(404).send("Users not found");
  }
  const messages = await Messagedetail.find({
    $or: [
      { sender: user._id, receiver: partner._id },
      { sender: partner._id, receiver: user._id },
    ],
  })
    .sort({ createdAt: -1 })
    .limit(20);
  res.json(
    messages.map((msg) => ({
      text: msg.message,
      sentByCurrentUser: msg.sender.equals(user._id),
    }))
  );
});

app.get("/getUserDetails", async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).send({ error: "User ID is required" });
  }

  try {
    const user = await Userdetail.findById(userId);
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    res.send({ name: user.name, email: user.email, _id: user._id });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).send({ error: "Internal server error" });
  }
});

app.post("/markAsRead", async (req, res) => {
  const { partnerEmail, userEmail } = req.body;
  if (!userEmail || !partnerEmail) {
    return res.status(400).send("Both user and partner emails are required");
  }

  const [user, partner] = await Promise.all([
    Userdetail.findOne({ email: userEmail }),
    Userdetail.findOne({ email: partnerEmail }),
  ]);
  if (!user || !partner) {
    return res.status(404).send("Users not found");
  }

  await Messagedetail.updateMany(
    { sender: partner._id, receiver: user._id, read: false },
    { $set: { read: true } }
  );

  res.status(200).send("Messages marked as read");
});

const verifyJWT = async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    // console.log(token);

    if (!token) {
      console.log("unauthorized access");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // console.log(decodedToken, "iam decoded token");

    const user = await Userdetail.findOne({ email: decodedToken.email }).select(
      "-password"
    );

    if (!user) {
      console.log("invalid access token");
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("invalid access token or maybe something went wrong", error);
  }
};

const generateAccessToken = async (email) => {
  try {
    const user = await Userdetail.findOne({ email: email });

    if (!user) {
      console.log("user not found");
      return null;
    }

    const accessToken = user.generateAccessToken();

    await user.save({ validateBeforeSave: false });

    return accessToken;
  } catch (error) {
    console.error("error in generating access token", error);
    return null;
  }
};

const generateOtp = () => {
  return Math.floor(1000 + Math.random() * 9000);
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ishwarmnd2000@gmail.com",
    pass: "zztkqtuyazqkwrvw",
  },
});

app.get("/", async (req, res) => {
  //   res.sendFile(path.join(__dirname, "public", "index.html"));

  const filePath = path.resolve(__dirname, "./public/index.html");

  res.sendFile(filePath);
});

app.get("/login", async (req, res) => {
  const filePath = path.resolve(__dirname, "./public/index.html");

  res.sendFile(filePath);
});

app.get("/register", async (req, res) => {
  const filePath = path.resolve(__dirname, "./public/signup.html");

  res.sendFile(filePath);
});

app.get("/home", async (req, res) => {
  const filePath = path.resolve(__dirname, "./public/home.html");
  res.sendFile(filePath);
});

app.post("/register", async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: "please fill all the details" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "passwords do not match" });
  }

  const existedUser = await Userdetail.findOne({ email });

  if (existedUser) {
    return res.status(400).json({ message: "user with same email exists" });
  }

  const existedUserWithName = await Userdetail.findOne({ name });

  if (existedUserWithName) {
    return res
      .status(400)
      .json({ message: "user with same name exists already" });
  }

  const user = await Userdetail.create({
    name,
    email,
    password,
  });

  const createdUser = await Userdetail.findById(user._id).select("-password");

  console.log(createdUser);

  if (!createdUser) {
    return res.status(500).json({ error: "server error" });
  }

  return res
    .status(201)
    .json({ redirectUrl: "/login", message: "user registered successfully" });
  // const filePath = path.resolve(__dirname, "./public/index.html");

  // return res.sendFile(filePath);

  // return res
  //   .status(201)
  //   .json({ message: "user created successfully", user: createdUser });
});

app.get("/findUser", async (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ error: "Please enter username" });
  }

  try {
    const user = await Userdetail.findOne({ name: name }).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ message: "User found", user: user });
  } catch (error) {
    console.error("Error finding user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please fill all the details" });
  }

  try {
    const existedUser = await Userdetail.findOne({ email: email });

    if (!existedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    const isPasswordMatch = await existedUser.isPasswordCorrect(password);

    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const accessToken = await generateAccessToken(email);

    const generatedAccessToken = await Userdetail.updateOne(
      { email: email },
      { accessToken: accessToken, isLoggedIn: true }
    );

    if (!accessToken) {
      return res.status(500).json({ error: "failed to generate access token" });
    }

    return res.status(200).json({
      email: email,
      isLoggedIn: true,
      name: existedUser.name,
      accessToken: accessToken,
      userId: existedUser._id, // Send user ID back to the client
      redirectUrl: "/home",
      message: "user registered successfully",
    });
  } catch (error) {
    console.error("Error finding user:", error);
    return res
      .status(500)
      .json({ error: error.message || "Internal server error" });
  }
});

app.get("/autocomplete", async (req, res) => {
  try {
    const { query } = req.query;
    const regex = new RegExp(`^${query}`, "i");
    // const users = await Userdetail.find({ name: regex }).limit(10);
    const users = await Userdetail.find(
      { name: regex },
      "name email _id"
    ).limit(10);
    res.json(users);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/forgotPassword", verifyJWT, async (req, res) => {
  const filePath = path.resolve(__dirname, "./public/forgotPassword.html");

  res.sendFile(filePath);
});

app.get("/newPassword", async (req, res) => {
  const filePath = path.resolve(__dirname, "./public/newPassword.html");

  res.sendFile(filePath);
});

app.get("/logout", verifyJWT, async (req, res) => {
  const filePath = path.resolve(__dirname, "./public/logout.html");

  res.sendFile(filePath);
});

app.post("/logout", verifyJWT, async (req, res) => {
  if (!req.user) {
    return res.status(400).json({ message: "user not found" });
  }

  try {
    await Userdetail.updateOne(
      {
        email: req.user.email,
      },
      { $set: { isLoggedIn: false, accessToken: 1 } }
    );

    res.status(200).json({ message: "logout successful" });
  } catch (error) {
    res.status(500).json({ message: "an error occured" });
  }
});

app.post("/forgotPassword", verifyJWT, async (req, res) => {
  const { email } = req.body;

  const user = await Userdetail.findOne({ email: email });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  try {
    const otp = generateOtp();
    // user.otp = otp;
    const updatedUser = await Userdetail.updateOne(
      { email: email },
      { otp: otp }
    );

    console.log(updatedUser);

    const info = await transporter.sendMail({
      from: '"ishwar" <ishwarmnd2000@gmail.com>',
      to: "ishwarjhokhra2000@gmail.com",
      subject: "Password Reset",
      text: `please enter ${otp} to verify your email`,
    });

    console.log("Message sent: %s", info.messageId);

    return res.status(201).json("message sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({ error: "Failed to send reset email" });
  }
});

app.post("/verifyOtp", async (req, res) => {
  const { email, otp } = req.body;

  // console.log(email);

  try {
    const user = await Userdetail.findOne({ email: email });

    console.log(user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const userOtp = user.otp;

    if (!userOtp) {
      return res.status(400).json({ message: "OTP not found for the user" });
    }

    console.log(userOtp);

    if (userOtp != otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.otp = null;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({ redirectUrl: "/newPassword" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/newPassword", async (req, res) => {
  const { password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
  }

  const user = await Userdetail.findById(req.user._id);

  user.password = password;

  await Userdetail.save({ validateBeforeSave: false });

  return res.status(201).json("password changed successfully");
});
