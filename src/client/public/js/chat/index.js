// public/js/chat/index.js
import { socket } from '../socket/index.js';

console.log('✅ chat module loaded');

window.addEventListener('DOMContentLoaded', () => {
  const apiBase      = window.API_BASE;     // e.g. "http://localhost:3000"
  const gameId       = window.GAME_ID;      // exposed in lobby.ejs
  const parent       = document.getElementById('chat-messages');
  const messageInput = document.querySelector('.chat-input input');
  const sendButton   = document.querySelector('.chat-input button');

  // Join this game’s Socket.IO room
  socket.emit('joinGame', gameId);

  // Send chat when “Send” is clicked
  sendButton.addEventListener('click', async () => {
    const text = messageInput.value.trim();
    if (!text) return;
    messageInput.value = '';

    try {
      const res = await fetch(
        `${apiBase}/chat/${gameId}`,
        {
          method: 'POST',
          credentials: 'include',             // include session cookie
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text }),
        }
      );
      if (!res.ok) {
        console.error('Failed to send chat:', res.status, res.statusText);
      }
    } catch (err) {
      console.error('Error sending chat:', err);
    }
  });

  // Render incoming messages
  socket.on(`chat-message:${gameId}`, ({ message, sender, gravatar, timestamp }) => {
    const msgEl = document.createElement('div');
    msgEl.className = 'chat-message';
    msgEl.innerHTML = `
      <img class="gravatar"
           src="https://gravatar.com/avatar/${gravatar}?s=32&identicon"
           alt="${sender}" />
      <span class="timestamp">${new Date(timestamp).toLocaleTimeString()}</span>
      <span>${message}</span>
    `;
    parent.appendChild(msgEl);
    parent.scrollTop = parent.scrollHeight;
  });
});
