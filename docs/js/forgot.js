// forgot.js
document.getElementById("resetForm")?.addEventListener("submit", async function (e) {
  e.preventDefault();

  const messageEl = document.getElementById("message");
  messageEl.textContent = "";  // Clear previous message

  const username = document.getElementById("username").value.trim();
  const currentPassword = document.getElementById("currentPassword").value.trim();
  const newPassword = document.getElementById("newPassword").value.trim();

  try {
    const response = await fetch("https://project-web-toio.onrender.com/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, currentPassword, newPassword })
    });

    const result = await response.json();

    if (result.success) {
      messageEl.style.color = "green";
      messageEl.textContent = "Password changed successfully! Redirecting to login...";
      setTimeout(() => {
        window.location.href = "login.html";
      }, 2000);  // Redirect after 2 seconds
    } else {
      messageEl.style.color = "red";
      messageEl.textContent = "" + result.message;
    }
  } catch (error) {
    messageEl.style.color = "red";
    messageEl.textContent = "An error occurred while resetting the password. Please try again later.";
    console.error(error);
  }
});



// OTP-based recovery logic
document.addEventListener('DOMContentLoaded', () => {
  const maskedEmailEl = document.getElementById('maskedEmail');
  const form = document.getElementById('resetForm');
  const message = document.getElementById('message');
  const resendBtn = document.getElementById('resendOtp');

  // If any element is missing, log a warning and stop
  if (!maskedEmailEl || !form || !message || !resendBtn) {
    console.warn('Some required DOM elements not found on the page.');
    return;
  }

  // Get email from sessionStorage (set during recover.html submit)
  const email = sessionStorage.getItem('recoveryEmail');
  if (!email) {
    message.textContent = 'No email found. Please start from the recovery page.';
    form.style.display = 'none';
    return;
  }

  // Mask and show email
  const masked = email.replace(/^(.)(.*)(.@.*)$/, (_, a, b, c) => a + '*'.repeat(b.length) + c);
  maskedEmailEl.textContent = `6-digit Code to: ${masked}`;

  // Countdown timer for resend
  let countdown = 60;
  resendBtn.disabled = true;
  const timer = setInterval(() => {
    resendBtn.textContent = `Resend OTP (${countdown--})`;
    if (countdown < 0) {
      clearInterval(timer);
      resendBtn.disabled = false;
      resendBtn.textContent = 'Resend OTP';
    }
  }, 1000);

  // Handle OTP verification and password reset
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const otp = document.getElementById('otp').value.trim();
    const newPassword = document.getElementById('newPassword').value.trim();

    try {
      const res = await fetch('https://project-web-toio.onrender.com/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword })
      });
      const data = await res.json();
      if (data.success) {
  message.textContent = 'Password reset successful! Redirecting to login...';
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 2000); // redirect after 2 seconds
} else {
  message.textContent = data.message;
}

    } catch (err) {
      console.error(err);
      message.textContent = 'Error processing request';
    }
  });

  // Handle resend OTP
  resendBtn.addEventListener('click', async () => {
    try {
      const res = await fetch('https://project-web-toio.onrender.com/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        message.textContent = 'OTP resent';
        countdown = 60;
        resendBtn.disabled = true;
        const timer = setInterval(() => {
          resendBtn.textContent = `Resend OTP (${countdown--})`;
          if (countdown < 0) {
            clearInterval(timer);
            resendBtn.disabled = false;
            resendBtn.textContent = 'Resend OTP';
          }
        }, 1000);
      } else {
        message.textContent = data.message;
      }
    } catch (err) {
      console.error(err);
      message.textContent = 'Failed to resend OTP';
    }
  });
});

document.getElementById('recoverForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  try {
    const res = await fetch('https://project-web-toio.onrender.com/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (data.success) {
      sessionStorage.setItem('recoveryEmail', email); // Save email
      window.location.href = 'reset.html'; // Redirect
    } else {
      alert(data.message);
    }
  } catch (err) {
    alert('Failed to send OTP');
  }
});
