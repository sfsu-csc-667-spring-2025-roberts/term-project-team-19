//import io from "socket.io-client";
console.log("✅ socket module loaded");  

const socket = io("http://localhost:3000", {
  withCredentials: true
});
export { socket };
/*
Documentation:
- install npm i socket.io-client and  npm i @types/socket.io-client

*/ 