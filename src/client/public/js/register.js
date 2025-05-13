// public/js/register.js
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');
    const emailInput = document.getElementById('email');
    const userInput = document.getElementById('username');
    const passInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirmPassword');
  
    form.addEventListener('submit', async e => {
      e.preventDefault();
  
      const email = emailInput.value.trim();
      const username = userInput.value.trim();
      const password = passInput.value;
      const confirm  = confirmInput.value;
  
      if (password !== confirm) {
        return alert("Passwords don’t match");
      }
  
      try {
        const res = await fetch('http://localhost:3000/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password }),
          });
  
        if (res.ok) {
          window.location.href = '/login';
        } else {
          const { error } = await res.json();
          alert(error || "Registration failed");
        }
      } catch (err) {
        console.error("Request failed", err);
        alert("Network error");
      }
    });
  });
  