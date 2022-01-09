const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({ status: false, message: "Access Denied" });
    }
    try {
      const verified = jwt.verify(token, process.env.TOKEN_SECRET);
      if (verified) {
        req.user = verified;
        next();
      } else {
        return res
          .status(401)
          .json({ status: false, message: "Please Login Again " });
      }
    } catch (err) {
      console.log(err);
      return res.status(401).json({ status: false, message: "Invalid Token" });
    }
  } else {
    return res
      .status(401)
      .json({ status: false, message: "Please Login Again " });
  }
}

module.exports = auth;
