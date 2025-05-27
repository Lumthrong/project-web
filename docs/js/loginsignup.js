document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const verifyForm = document.getElementById('verifyForm');
  const logoutBtn = document.getElementById('logoutBtn');
  const logoutItem = document.getElementById('logoutItem');
  const authItem = document.getElementById('authItem');

  // Show error message inside the form
  function showError(form, message) {
    let errorMsg = form.querySelector('.form-error');
    if (!errorMsg) {
      errorMsg = document.createElement('div');
      errorMsg.className = 'form-error';
      form.appendChild(errorMsg);
    }
    errorMsg.textContent = message;
  }

  // Clear errors and remove input error classes
  function clearErrors(form) {
    Array.from(form.elements).forEach(input => {
      if (input.tagName === 'INPUT') input.classList.remove('input-error');
    });
    const existing = form.querySelector('.form-error');
    if (existing) existing.remove();
  }

  // Validate input as Gmail or 10-digit phone number
  function isValidIdentifier(value) {
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    const phoneRegex = /^\d{10}$/;
    return gmailRegex.test(value) || phoneRegex.test(value);
  }

  // Enable or disable all inputs in a form
  function setFormDisabled(form, disabled) {
    Array.from(form.elements).forEach(el => (el.disabled = disabled));
  }

  // Check login status and update UI accordingly
  async function checkLoginStatus() {
    try {
      const res = await fetch('https://project-web-toio.onrender.com/check-auth', { method: 'GET', credentials: 'include' });
      const data = await res.json();

      if (data.loggedIn) {
        if (authItem) authItem.style.display = 'none';
        if (logoutItem) {
          logoutItem.style.display = 'inline-block';
          const usernameDisplay = document.getElementById('usernameDisplay');
          if (usernameDisplay) usernameDisplay.textContent = data.username;
        }
      } else {
        if (authItem) authItem.style.display = 'inline-block';
        if (logoutItem) {
          logoutItem.style.display = 'none';
          const usernameDisplay = document.getElementById('usernameDisplay');
          if (usernameDisplay) usernameDisplay.textContent = '';
        }
      }
    } catch (err) {
      console.error('Error checking login status:', err);
    }
  }

  // Common input event listener to clear error styling/messages
  function attachInputClearError(form, inputs) {
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        input.classList.remove('input-error');
        const errorMsg = form.querySelector('.form-error');
        if (errorMsg) errorMsg.remove();
      });
    });
  }

  // Login form submission handler
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearErrors(loginForm);

      const username = loginForm.username.value.trim();
      const password = loginForm.password.value;

      if (!isValidIdentifier(username)) {
        loginForm.username.classList.add('input-error');
        showError(loginForm, 'Please enter a valid Gmail address or 10-digit phone number.');
        return;
      }

      setFormDisabled(loginForm, true);

      try {
        const res = await fetch('https://project-web-toio.onrender.com/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
          credentials: 'include'
        });

        const result = await res.json();

        if (res.ok) {
          window.location.href = 'index.html';
        } else {
          loginForm.username.classList.add('input-error');
          loginForm.password.classList.add('input-error');
          showError(loginForm, result.message || 'Invalid username or password');
        }
      } catch {
        showError(loginForm, 'Login failed. Please try again.');
      } finally {
        setFormDisabled(loginForm, false);
      }
    });

    attachInputClearError(loginForm, [loginForm.username, loginForm.password]);
  }

  // Signup form submission handler - requests OTP
if (signupForm) {
  const signupMessage = document.getElementById('signupMessage');
  const passwordInput = signupForm.password;

  // Create and insert password strength message
  const passwordStrengthMessage = document.createElement('div');
  passwordStrengthMessage.style.marginTop = '5px';
  passwordInput.insertAdjacentElement('afterend', passwordStrengthMessage);

  // Password input listener for strength check
  passwordInput.addEventListener('input', () => {
  const password = passwordInput.value.trim();

  if (password === '') {
    passwordStrengthMessage.textContent = '';
    return;
  }

  if (!/^[A-Za-z0-9!@#$%^&*()_+\-=[\]{}|;':",.<>/?]*$/.test(password)) {
    passwordStrengthMessage.style.color = 'red';
    passwordStrengthMessage.textContent = 'Password contains invalid characters.';
    return;
  }

  const strength = getPasswordStrength(password);

  switch (strength) {
    case 'Weak':
      passwordStrengthMessage.style.color = 'red';
      break;
    case 'Good':
      passwordStrengthMessage.style.color = 'orange';
      break;
    case 'Strong':
      passwordStrengthMessage.style.color = 'green';
      break;
  }

  passwordStrengthMessage.textContent = `Password Strength: ${strength}`;
});

  // Password strength evaluation
  function getPasswordStrength(password) {
    const length = password.length;
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[!@#$%^&*()_+\-=[\]{}|;':",.<>/?]/.test(password);

    let score = 0;
    if (hasLower) score++;
    if (hasUpper) score++;
    if (hasNumber) score++;
    if (hasSymbol) score++;

    if (length < 8) return 'Weak';
    if (score >= 3 && length >= 8 && length < 12) return 'Good';
    if (score === 4 && length >= 12) return 'Strong';

    return 'Weak';
  }

  // Signup form submit handler
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors(signupForm);
    signupMessage.textContent = '';

    const username = signupForm.username.value.trim();
    const password = signupForm.password.value;

    if (!isValidIdentifier(username)) {
      signupForm.username.classList.add('input-error');
      showError(signupForm, 'Please enter a valid Gmail address or 10-digit phone number.');
      return;
    }

    if (
      password.length < 8 ||
      !/^[A-Za-z0-9!@#$%^&*()_+\-=[\]{}|;':",.<>/?]+$/.test(password)
    ) {
      signupForm.password.classList.add('input-error');
      showError(signupForm, 'Password must be at least 8 characters and contain only letters, numbers, and symbols.');
      return;
    }

    setFormDisabled(signupForm, true);

    try {
      // Request OTP for signup
      const res = await fetch('https://project-web-toio.onrender.com/request-signup-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
        credentials: 'include'
      });

      const result = await res.json();

      if (res.ok) {
        // Save username and password temporarily in sessionStorage for verify step
        sessionStorage.setItem('signupUsername', username);
        sessionStorage.setItem('signupPassword', password);

        signupMessage.style.color = 'green';
        signupMessage.textContent = '6-digit Code Sent. Please check your email or phone. Redirecting...';

        setTimeout(() => {
          window.location.href = 'verify.html';
        }, 2000);

      } else {
        signupForm.username.classList.add('input-error');
        signupMessage.style.color = 'red';
        signupMessage.textContent = result.message || 'Failed to send 6-digit Code.';
      }
    } catch {
      signupMessage.style.color = 'red';
      signupMessage.textContent = 'Failed to send 6-digit Code. Please try again.';
    } finally {
      setFormDisabled(signupForm, false);
    }
  });

  attachInputClearError(signupForm, [signupForm.username, signupForm.password]);
}


    
          
  // OTP Verification form handler (on verify.html)
  if (verifyForm) {
    verifyForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const otpInput = verifyForm.code;
      const otp = otpInput.value.trim();
      const messageDiv = document.getElementById('verifyError');

      messageDiv.textContent = '';
      messageDiv.style.color = 'red'; // default to error color
      if (!otp.match(/^\d{6}$/)) {
        messageDiv.textContent = 'Please enter a valid 6-digit Code';
        return;
      }

      const username = sessionStorage.getItem('signupUsername');
      const password = sessionStorage.getItem('signupPassword');

      if (!username || !password) {
        messageDiv.textContent = 'Signup info missing. Please signup again.';
        setTimeout(() => {
          window.location.href = 'signup.html';
        }, 2000);
        return;
      }

      try {
        const res = await fetch('https://project-web-toio.onrender.com/verify-signup-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password, otp }),
          credentials: 'include'
        });

        const result = await res.json();

        if (res.ok) {
          messageDiv.style.color = 'green';
          messageDiv.textContent = 'Signup successful! Redirecting to login...';

          sessionStorage.removeItem('signupUsername');
          sessionStorage.removeItem('signupPassword');

          setTimeout(() => {
            window.location.href = 'login.html';
          }, 2000);
        } else {
          messageDiv.textContent = result.message || 'verification failed';
        }
      } catch {
        messageDiv.textContent = 'verification failed. Please try again.';
      }
    });

    attachInputClearError(verifyForm, [verifyForm.code]);
  }

  // Logout button handler (run regardless of page)
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        const res = await fetch('https://project-web-toio.onrender.com/logout', { method: 'POST', credentials: 'include' });
        if (res.ok) window.location.href = 'index.html';
      } catch (err) {
        console.error('Logout failed:', err);
      }
    });
  }

  // Initial check to update UI based on login status (run regardless of page)
  checkLoginStatus();
});
