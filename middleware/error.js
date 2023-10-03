// errorMiddleware.js

const { JsonWebTokenError } = require("jsonwebtoken");
const ErrorHandler = require("../utils/errorHandler");

const errorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";
  // Wrong Mongodb Id error
  if (err.name === "CastError") {
    const message = `Resource Not Found: ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  // mongoose duplicate key error
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
    err = new ErrorHandler(message, 400);
  }

  //wrong jwt token error
  if (err.code === "JsonWebTokenError") {
    const message = `Json Web Token is Invalid, Please try again`;
    err = new ErrorHandler(message, 400);
  }

  //jwt token Expire Error
  if (err.code === "JsonWebTokenExpire") {
    const message = `Json Web Token is Expire, Please try again`;
    err = new ErrorHandler(message, 400);
  }

  // Send the error response to the client
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};

module.exports = errorMiddleware;
