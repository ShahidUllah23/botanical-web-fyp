const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const errorMiddleware = require("./middleware/error");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");

dotenv.config({ path: "Backend/config/config.env" });

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload({ limits: { fileSize: 10 * 1024 * 1024 } })); // 10 MB limit


// Route imports
const user = require("./routes/userRoute");
const product = require("./routes/productRoute");
const order = require("./routes/orderRoute")
const payment = require("./routes/paymentRoute")
const blogs = require("./routes/blogroute")
app.use("/api/v1", product);
app.use("/api/v1", user);
app.use("/api/v1", order);
app.use("/api/v1", payment);
app.use("/api/v1", blogs);


//Middleware For Errors
app.use(errorMiddleware);

module.exports = app;
