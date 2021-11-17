const express = require("express");
const dotenv = require("dotenv");
const logger = require("./middleware/logger");

// Routes
const bootcamps = require("./routes/bootcamps");

// load env vars
dotenv.config({ path: "./config/config.env" });
const app = express();

// Middleware
app.use(logger);

// Mount routers to specific URL
app.use("/api/v1/bootcamps", bootcamps);

const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));
