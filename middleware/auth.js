const ErrorHandler = require("../utils/errorHandler");
const jwt = require("jsonwebtoken");
const User = require("../models/userModels");

exports.isAuthenticatedUser = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      throw new ErrorHandler("Please login to access this resource.", 401);
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decodedData.id);

    // Set isAdmin to true for users with the "admin" role
    req.user.isAdmin = req.user.role === "admin";
    next();
  } catch (error) {
    next(error); // Pass the error to the next middleware (error handling middleware)
  }
};


exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Role: ${req.user.role} is not allowed to access this resource`,
          403
        )
      );
    }
    next();
  };
};

exports.adminOnlyRoute = (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(
      new ErrorHandler("You do not have permission to access this resource.", 403)
    );
  }
  next();
};
