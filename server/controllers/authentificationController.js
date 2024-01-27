// authentificationController
const jwt = require('jsonwebtoken');

// Declare authentificationController object
const authentificationController = {};

authentificationController.authenticateToken = (req, res, next) => {
  // Retrieve the token from the 'ssid' cookie
  const token = req.cookies.ssid;

  // If no token is present, return a 401 Unauthorized status
  if (token == null) {
    return res.sendStatus(401);
  }

  // Verify the token using the provided secret key
  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    // Log any error encountered during token verification
    console.log(err);

    // If there's an error in token verification, return a 403 Forbidden status
    if (err) {
      return res.sendStatus(403);
    }

    // If the token is successfully verified, attach the user information to the request object
    req.user = user;

    // Proceed to the next middleware or route handler
    next();
  });
};
