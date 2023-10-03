// server.js
const app = require("./app");
const dotenv = require("dotenv")
const cloudinary = require("cloudinary")
const connectDatabase = require("./config/database"); // Replace with the correct path

//Uncought Exception Error
process.on('uncaughtException', (err) =>{
  console.log(`Error: ${err.message}`)
  console.log(`Shutting down server Due to Uncought Exception Error`);
  process.exit(1);
})

dotenv.config({ path: "./config/config.env" });
const PORT = process.env.PORT;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Connect to MongoDB
connectDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is working on https://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error starting the server:", err.message);
  });