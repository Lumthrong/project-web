document.getElementById('contactForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const subject = document.getElementById('subject').value.trim();
  const message = document.getElementById('message').value.trim();
  const messageBox = document.getElementById('contactMessage');

  function showMessage(text, isSuccess) {
    messageBox.textContent = text;
    messageBox.className = 'form-message ' + (isSuccess ? 'success' : 'error');
    messageBox.style.display = 'block';
  }


  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9]{10}$/;

  if (!emailRegex.test(email)) {
    showMessage("Please enter a valid email address.");
    return;
  }

  if (!phoneRegex.test(phone)) {
    showMessage("Please enter a valid 10-digit phone number.");
    return;
  }

  const res = await fetch('https://project-web-toio.onrender.com/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, phone, subject, message })
  });

  const result = await res.json();
  showMessage(result.message);
  if (res.ok) this.reset();
});
