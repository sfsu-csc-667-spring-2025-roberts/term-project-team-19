import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import apiRouter from "./src/routes";
import session from "express-session";
import { createServer } from "http";
import { Server as IOServer } from "socket.io";

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
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Session middleware (if needed)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // set `true` if using HTTPS
  })
);

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));

// Test route for static files
app.get("/test-css", (req, res) => {
  res.sendFile(path.join(__dirname, "public/styles.css"));
});

// Application routes
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

// Create HTTP server and attach Socket.IO
const httpServer = createServer(app);
const io = new IOServer(httpServer, {
  cors: { origin: "http://localhost:3000", credentials: true },
});

// Make the io instance available in routes
app.set("io", io);

// WebSocket connection handler
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  // Additional socket event handlers can go here
});

// Start both HTTP and WebSocket server
httpServer.listen(port, () => {
  console.log(`Server & WebSocket listening on port ${port}`);
});