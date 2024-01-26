// commented out for JWT to take over

// const cookieController = {};
// const jwt = require('jsonwebtoken');

// function generateAccessToken(username) {
//     // the username doesn't appear to change much
//     return jwt.sign(username, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
//   }

// cookieController.setSSIDCookie = (req, res, next) => {
//     console.log('cookieController running')
//     console.log('res locals userID is ', res.locals.userID)
//     res.cookie('ssid', res.locals.userID, { httpOnly: true });
//     // possibly change to userID
//     const token = generateAccessToken({ username: req.body.username });
//     res.locals.token = token;

//     return next();
// }

// module.exports = cookieController;

