import { socket } from "../socket/index.js";

// public/js/chat/index.js
import { socket } from "../socket/index.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("🔥 chat module loaded");
  const form = document.querySelector("section#chat form");
  const input = document.querySelector("section#chat form input[name=message]");
  const container = document.querySelector("section#chat > div");

  if (!form || !input || !container) {
    console.error("Chat elements not found", { form, input, container });
    return;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const msg = input.value.trim();
    if (!msg) return;
    input.value = "";
    console.log("📤 Sending:", msg);

    fetch("/chat/0", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ message: msg }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        console.log("📨 Posted:", msg);
      })
      .catch((err) => console.error("❌ post error", err));
  });

  socket.on("chat-message:0", (data) => {
    console.log("📥 Received:", data);
    const msgEl = document.createElement("div");
    msgEl.className = "chat-message";

    const img = document.createElement("img");
    img.className = "gravatar";
    img.src = `https://gravatar.com/avatar/${data.gravatar}?s=32&identicon`;
    img.alt = `Avatar of ${data.sender}`;

    const time = document.createElement("span");
    time.className = "timestamp";
    time.textContent = new Date(data.timestamp).toLocaleTimeString();

    const text = document.createElement("span");
    text.className = "text";
    text.textContent = data.message;

    msgEl.append(img, time, text);
    container.appendChild(msgEl);
    container.scrollTop = container.scrollHeight;
  });
});
