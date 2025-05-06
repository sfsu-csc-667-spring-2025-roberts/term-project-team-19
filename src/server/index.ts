import * as path from "path";
import * as http from "http";

import express from "express";
import httpErrors from "http-errors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import session from "express-session";

import rootRoutes from "./routes/root";
import authRoutes from "./routes/auth";
import testRoutes from "./routes/test";
import { timeMiddleware } from "./middleware/time";

import * as config from "./config";

const app = express();
const server = http.createServer(app);
const io = new Server(server)

const PORT = process.env.PORT || 3000;

config.liveReload(app);
config.sessesion(app);
config.sockets(io, app);


app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

app.use(express.static(path.join(process.cwd() + "public")));
app.set("views", path.join(process.cwd(), "src", "server", "templates"));
app.set("view engine", "ejs");

app.use("/", rootRoutes);
app.use("/auth", authRoutes);

app.use((_, __, next) => {
  next(httpErrors(404));
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
