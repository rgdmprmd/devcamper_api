const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan"); // handle log every hit endpoint for development
const colors = require("colors"); // customize colorization for console.log
const fileupload = require("express-fileupload"); // file upload
const cookieParser = require("cookie-parser");
const errorHandler = require("./middleware/error");
// const logger = require("./middleware/logger");

// DB connection
const connectDB = require("./config/db");

// load env vars
dotenv.config({ path: "./config/config.env" });

// Connect to DB
connectDB();

// Routes
const bootcamps = require("./routes/bootcamps");
const courses = require("./routes/courses");
const auth = require("./routes/auth");
const users = require("./routes/users");
const reviews = require("./routes/reviews");

const app = express();

// Bodyparser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Dev logging Middleware
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

// File uploading
app.use(fileupload());

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

// Mount routers to specific URL
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);
app.use("/api/v1/auth", auth);
app.use("/api/v1/users", users);
app.use("/api/v1/reviews", reviews);

// Middleware for error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow));

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
	console.log(`Error: ${err.message}`.red);
	// close the server & exit process
	server.close(() => process.exit(1));
});
