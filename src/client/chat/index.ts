import { socket } from "../socket";

const parent = document.querySelector("section#chat div");
const messageInput = document.querySelector<HTMLInputElement>("section#chat from input[name=message]");

document.querySelector("section#chat form.chat-form")?.addEventListener("submit", (event) => {
    event.preventDefault();

    const message = messageInput?.value;
    messageInput!.value = "";
     
    fetch("/chat/0", {
        method: "post",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({message}),
    });
});

//@ts-ignore
socket.on("chat-message:0", ({ message, sender, gravatar, timestamp}: ChatMessage) => {
    const container = document.createElement("div");
    container.className = "chat-message";

    const img = document.createElement("img");
    img.className = "gravatar";
    img.src = `https://gravatar.com/avatar/${gravatar}?s=32&identicon`;
    img.alt = `Gravatar of ${sender}`

    const displayTime = document.createElement("span");
    displayTime.className = "timestamp";
    displayTime.innerText = new Date(timestamp).toLocaleTimeString();

    const messageText = document.createElement("span");
    messageText.innerText = message;

    container.appendChild(img);
    container.appendChild(displayTime);
    container.appendChild(messageText);

    parent?.appendChild(container);
    parent?.scrollTo({ top: parent.scrollHeight, behavior: "smooth"});
});

