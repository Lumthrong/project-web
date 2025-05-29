// Admin Login
async function adminLogin(e) {
    e.preventDefault();
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    const message = document.getElementById('adminMessage');

    try {
        const response = await fetch('https://project-web-toio.onrender.com/admin-login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ username, password }),
            credentials: 'include'
        });

        const data = await response.json();

        if (data.status === 'success') {
            message.textContent = 'Login successful!';
            message.className = 'message success';
            message.classList.remove('hidden');

            document.getElementById('adminControls').classList.remove('hidden');
            document.getElementById('adminLoginForm').classList.add('hidden');

            // Show logout button
            showLogoutButton();
            loadNotification();
        } else {
            message.textContent = 'Invalid username or password';
            message.className = 'message error';
            message.classList.remove('hidden');
        }
    } catch (error) {
        message.textContent = 'Login failed. Please try again.';
        message.className = 'message error';
        message.classList.remove('hidden');
    }
}

// Show Logout Button inside adminControls and header nav
function showLogoutButton() {
  const authItem = document.getElementById('authItem'); // Login menu
  const logoutItem = document.getElementById('logoutItem'); // Logout menu

  if (authItem) authItem.style.display = 'none';
  if (logoutItem) logoutItem.style.display = 'block';

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn && !logoutBtn.dataset.listener) {
    logoutBtn.addEventListener('click', adminLogout);
    logoutBtn.dataset.listener = 'true';
  }
}
// Logout
async function adminLogout(e) {
  e.preventDefault();
  try {
    await fetch('/admin-logout', {
      method: 'POST',
      credentials: 'include',
    });
    window.location.reload();
  } catch {
    alert('Logout failed. Please try again.');
  }
}
// Check admin session on page load
async function checkAdminSession() {
  try {
    const res = await fetch('/check-admin-session', { credentials: 'include' });
    const data = await res.json();
    if (data.loggedIn) {
      document.getElementById('adminControls').classList.remove('hidden');
      document.getElementById('adminLoginForm').classList.add('hidden');

      const msg = document.getElementById('adminMessage');
      msg.textContent = `Logged in as ${data.username}`;
      msg.className = 'message success';
      msg.classList.remove('hidden');

      showLogoutButton();
      loadNotifications();
    }
  } catch (err) {
    console.error('Session check failed', err);
  }
}
// CSV upload
async function uploadCSV() {
    const file = document.getElementById('csvFile').files[0];
    const message = document.getElementById('csvMessage');

    if (!file) {
        message.textContent = 'Please select a CSV file first';
        message.className = 'message error';
        message.classList.remove('hidden');
        return;
    }

    if (!file.name.endsWith('.csv')) {
        message.textContent = 'Only .csv files are allowed.';
        message.className = 'message error';
        message.classList.remove('hidden');
        return;
    }

    const formData = new FormData();
    formData.append('csvfile', file);

    try {
        const response = await fetch('https://project-web-toio.onrender.com/upload-csv', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });

        if (response.ok) {
            message.textContent = 'Results uploaded successfully!';
            message.className = 'message success';
        } else {
            message.textContent = 'Upload failed. Please check the file format.';
            message.className = 'message error';
        }
        message.classList.remove('hidden');
    } catch (error) {
        message.textContent = 'An error occurred during upload.';
        message.className = 'message error';
        message.classList.remove('hidden');
    }
}

// Event listeners setup
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('adminLoginForm')?.addEventListener('submit', adminLogin);
    document.getElementById('uploadCsvBtn')?.addEventListener('click', uploadCSV);
    checkAdminSession();
});

document.addEventListener('DOMContentLoaded', () => {
  const notificationList = document.getElementById('notificationList');
  const addForm = document.getElementById('addNotificationForm');

  // Fetch and display all notifications
  async function loadNotifications() {
    try {
      const res = await fetch('/notifications');
      const data = await res.json();

      notificationList.innerHTML = ''; // Clear existing list

      data.forEach(notification => {
        const item = document.createElement('li');
        item.innerHTML = `
          <h4>${notification.title}</h4>
          <p>${notification.description}</p>
          ${notification.link ? `<a href="${notification.link}" target="_blank">Read more</a>` : ''}
          <small>${new Date(notification.created_at).toLocaleString()}</small>
          <button data-id="${notification.id}" class="delete-btn">🗑️</button>
        `;
        notificationList.appendChild(item);
      });

      // Attach delete handlers
      document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', async () => {
          const id = button.getAttribute('data-id');
          if (confirm('Are you sure you want to delete this notification?')) {
            await fetch(`/delete-notification/${id}`, { method: 'DELETE' });
            loadNotifications(); // Refresh list
          }
        });
      });
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  }

  // Handle add notification form
  addForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = addForm.title.value.trim();
    const description = addForm.description.value.trim();
    const link = addForm.link.value.trim();

    if (!title || !description) {
      alert('Title and description are required.');
      return;
    }

    try {
      await fetch('/add-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, link })
      });
      addForm.reset();
      loadNotifications(); // Refresh list
    } catch (err) {
      console.error('Failed to add notification:', err);
    }
  });

  // Initial load
  loadNotifications();
});


