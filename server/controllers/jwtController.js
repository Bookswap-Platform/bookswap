const jwt = require('jsonwebtoken');

const jwtController = {};

jwtController.generateToken = (req, res, next) => {

  if(res.locals.token){
    return next();
  }else{
// function to create the jwt token
  // function generateAccessToken(username) {
  //   return jwt.sign(username, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
  // }

  const newUser = { username, password }
  const token = jwt.sign(newUser, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
  // const token = generateAccessToken({ username: req.body.username });
  // console.log('what is username',{username: req.body.username})
  // res.locals.token = token;
  // send token as a cookie and added secure: true
  res.cookie('jwt', token, { httpOnly: true });

  return next();
  }
}

module.exports = jwtController;
