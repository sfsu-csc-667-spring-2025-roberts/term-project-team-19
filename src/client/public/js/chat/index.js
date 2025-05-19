import { socket } from '../socket/index.js';
console.log('✅ chat module loaded');

window.addEventListener('DOMContentLoaded', () => {
  const parent       = document.getElementById('chat-messages');
  const messageInput = document.querySelector('.chat-input input');
  const sendButton   = document.querySelector('.chat-input button');

  sendButton.addEventListener('click', event => {
    event.preventDefault();
    const text = messageInput.value;
    messageInput.value = '';              // now safe: messageInput is never null
    fetch('/chat/1', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ message: text }),
    });
  });

  socket.on("chat-message:1", ({ message, sender, gravatar, timestamp }) => {
    const msgEl = document.createElement('div');
    msgEl.className = 'chat-message';
    msgEl.innerHTML = `
      <img class="gravatar" src="https://gravatar.com/avatar/${gravatar}?s=32&identicon" alt="${sender}" />
      <span class="timestamp">${new Date(timestamp).toLocaleTimeString()}</span>
      <span>${message}</span>
    `;
    parent.appendChild(msgEl);
    parent.scrollTo({ top: parent.scrollHeight, behavior: 'smooth' });
  });
});
