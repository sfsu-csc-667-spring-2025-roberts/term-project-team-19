import { socket } from '../socket/index.js';
console.log('✅ chat module loaded');

window.addEventListener('DOMContentLoaded', () => {
  const parent = document.querySelector('section#chat > div');
  const form = document.querySelector('section#chat form.chat-form');
  const messageInput = form.querySelector('input[name="message"]');

  form.addEventListener('submit', event => {
    event.preventDefault();
    const text = messageInput.value;
    messageInput.value = '';              // now safe: messageInput is never null
    fetch('/chat/0', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ message: text }),
    });
  });

  socket.on('chat-message:0', ({ message, sender, gravatar, timestamp }) => {
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
