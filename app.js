const User = require("./modals/user.js");
const bodyParser = require("body-parser");
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");

const url = "mongodb://localhost:27017/project";

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;

db.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

db.once("open", () => {
  console.log("Connected to MongoDB");
});

const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", async (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});
app.get("/forgetpassword", async (req, res) => {
  try {
    res.sendFile(path.join(__dirname, "/public/forgetpassword.html"));
    ``;
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});
app.get("/register", async (req, res) => {
  try {
    res.sendFile(path.join(__dirname, "/public/register.html"));
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body);
    // Find the user by email
    const user = await User.findOne({ email });

    // If user not found or password incorrect, send error response
    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // If email and password are correct, send success response
    res
      .status(200)
      .json({ message: "Login successful", user: { email: user.email } });
  } catch (error) {
    console.error("Error handling login request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/submitform", async (req, res) => {
  try {
    // Log the request body to inspect the data being sent from the client
    console.log("Request body:", req.body);

    const { name, email, password, phoneNumber } = req.body;
    // Create a new user instance using the User model
    const user = new User({
      name: name,
      email: email,
      password: password,
      phoneNumber: phoneNumber,
    });

    // Save the user to the database
    const savedUser = await user.save();
    console.log("User created:", savedUser);
    res.redirect("/");
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Error creating user" }); // Handle errors
  }
});

app.put("/forgotpassword", async (req, res) => {
  try {
    const { email, newPassword, phoneNumber } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Authenticate the request by verifying the phone number
    if (user.phoneNumber !== phoneNumber) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Update the user's password
    user.password = newPassword;
    let use = await user.save();
    console.log(use);
    // Respond with success message
    res.status(200).json({ message: "Password updated successfully" });
    
  } catch (error) {
    console.error("Error handling forgot password request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
