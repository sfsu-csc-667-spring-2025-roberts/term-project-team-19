import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import apiRouter from "./src/routes";
import session from "express-session";

const app = express();
const port = process.env.PORT || 3001;

// View engine setup
app.set("views", path.join(__dirname, "src/views/templates"));
app.set("view engine", "ejs");

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000", // Your client URL
    credentials: true, // Allow credentials (cookies)
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));

// Test route for static files
app.get("/test-css", (req, res) => {
  res.sendFile(path.join(__dirname, "public/styles.css"));
});

// Routes
app.use("/", apiRouter);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).sendFile(path.join(__dirname, "public/404.html"));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
