const express = require("express");
const path = require("path");
const PORT = 3000;
const app = express();
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
require("dotenv").config();
const googleMapsKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

// parses JSON from incoming request
app.use(express.json());
app.use(cookieParser());

// Store session data on the client within a cookie without requiring database
app.use(cookieSession({
  name: "whiskr-session",
  keys: ["secretekeyinsession"],
  httpOnly: true
}));


const libraryRouter = require("./routes/library");
const userController = require("./controllers/userController");
const cookieController = require("./controllers/cookieController");
const authController = require("./controllers/authController");

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/index.html"));
});

//Signup
app.post(
  "/action/signup",
  userController.createUser,
  authController.generateToken,
  authController.verifyToken,
  (req, res) => {
    res.status(200).json(true);
    // res.status(200).redirect('/home')
  }
);

app.get("/action/getMapsKey", (req, res) => {
  res.status(200).json(googleMapsKey);
});

//Checks user availability
app.get("/action/check/:username", userController.checkUser, (req, res) => {
  console.log("availability is ", res.locals.userAvailability);
  res.json(res.locals.userAvailability);
});

//Login
app.post(
  "/action/login",
  userController.verifyUser,
  authController.generateToken,
  authController.verifyToken,
  (req, res) => {
    console.log(
      "authentication completed, correctUser is ",
      res.locals.correctUser
    );
    console.log("redirecting to home");
    res.json(res.locals.correctUser);
  }
);

app.post(
  "/action/oAuth",
  userController.verifyOAuth,
  userController.newUserFromGoogleOauth,
  authController.generateToken,
  (req, res) => {
    res.status(200).json(res.locals.correctUser);
  }
);

//Protect server side requests to protected pages
app.get("/home", authController.verifyToken, (req, res) => {
  res.status(200).json(res.locals.user);
});

app.get("/myLibrary", authController.verifyToken, (req, res) => {
  res.status(200).json(res.locals.user);
});

app.get("/action/getUser", authController.verifyToken, (req, res) => {
  res.status(200).json(res.locals.user);
});

app.post(
  "/action/updateUser",
  authController.verifyToken,
  userController.updateUserProfile,
  (req, res) => {
    res.status(200).json(res.locals.user);
  }
);

app.get("/action/getLibrary", authController.verifyToken, (req, res) => {
  console.log("get library running");
  res.status(200).json(res.locals.user.books);
});

app.get("/action/getNotifications", authController.verifyToken, (req, res) => {
  console.log("get notifications running: ", res.locals.user.notifications);
  res.status(200).json(res.locals.user.notifications);
});

app.get(
  "/action/markAsRead/:id",
  authController.verifyToken,
  userController.markReadNotification,
  (req, res) => {
    res.status(200).json(res.locals.user.notifications);
  }
);

app.get(
  "/action/clearNotifications",
  authController.verifyToken,
  userController.clearNotifications,
  (req, res) => {
    res.status(200).json(res.locals.user.notifications);
  }
);

//Verify active session for client side requests to protected pages
app.get("/action/auth", authController.verifyToken, (req, res) => {
  res.status(200).json(res.locals.correctUser);
});

//Logout
app.get("/action/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

// Library
app.use("/library", libraryRouter);

//Handler for 404
app.use("*", (req, res) => {
  res.status(404).send("Page not found.");
});

//Global Error Handler
app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send({ error: err });
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});

module.exports = app;
