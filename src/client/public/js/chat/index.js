//import { socket } from "../socket";
import { socket } from "../socket/index.js";

socket.on("test", (data) => {
    console.log("test", { data });
});
