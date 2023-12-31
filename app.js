require("dotenv").config();
require("express-async-errors");

// extra security packages

const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean");
const rateLimiter = require("express-rate-limit");

const express = require("express");
const app = express();

const connectDB = require("./db/connect");
const authenticatedUser = require("./middleware/authentication");

const jobsRouter = require("./routes/jobs");
const authRouter = require("./routes/auth");

// error handler
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

app.get("/", (req, res) => {
  res.send("Jobs APIs");
});

app.set("trust proxy", 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);
app.use(express.json());
app.use(xss());
app.use(helmet());
app.use(cors());
// extra packages

// routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/jobs", authenticatedUser, jobsRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3579;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () => {
      console.log(
        `Server is listening on port ${port}... and connected to DB.`
      );
    });
  } catch (error) {
    console.log(error);
  }
};

start();
