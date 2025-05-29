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

// Load notifications into table
async function loadNotifications() {
  const tableBody = document.querySelector('#notificationTable tbody');
  tableBody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';

  try {
    const res = await fetch('https://project-web-toio.onrender.com/notifications', { credentials: 'include' });
    const notifications = await res.json();

    if (!notifications.length) {
      tableBody.innerHTML = '<tr><td colspan="4">No notifications found.</td></tr>';
      return;
    }

    tableBody.innerHTML = notifications.map(notif => `
      <tr>
        <td>${escapeHtml(notif.title)}</td>
        <td>${escapeHtml(notif.description)}</td>
        <td>${notif.link ? `<a href="${escapeHtml(notif.link)}" target="_blank">Link</a>` : ''}</td>
        <td><button class="deleteBtn" data-id="${notif.id}">Delete</button></td>
      </tr>
    `).join('');

    // Add delete button event listeners
    document.querySelectorAll('.deleteBtn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this notification?')) return;
        const id = btn.dataset.id;
        try {
          const res = await fetch(`https://project-web-toio.onrender.com/admin/notifications/${id}`, {
            method: 'DELETE',
            credentials: 'include',
          });
          if (res.ok) {
            loadNotifications();
          } else {
            alert('Failed to delete notification.');
          }
        } catch {
          alert('Error deleting notification.');
        }
      });
    });

  } catch (error) {
    tableBody.innerHTML = '<tr><td colspan="4">Failed to load notifications.</td></tr>';
  }
}

// Add notification form handler
document.getElementById('addNotificationForm')?.addEventListener('submit', async e => {
  e.preventDefault();

  const title = document.getElementById('notifTitle').value.trim();
  const description = document.getElementById('notifDesc').value.trim();
  const link = document.getElementById('notifLink').value.trim();
  const msg = document.getElementById('notifMessage');

  if (!title || !description) {
    msg.textContent = 'Title and description are required.';
    msg.className = 'message error';
    msg.classList.remove('hidden');
    return;
  }

  try {
    const res = await fetch('https://project-web-toio.onrender.com/admin/notifications', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      credentials: 'include',
      body: JSON.stringify({ title, description, link })
    });
    const data = await res.json();

    if (data.status === 'success') {
      msg.textContent = 'Notification added!';
      msg.className = 'message success';
      document.getElementById('addNotificationForm').reset();
      loadNotifications();
    } else {
      msg.textContent = data.error || 'Failed to add notification.';
      msg.className = 'message error';
    }
  } catch {
    msg.textContent = 'Error adding notification.';
    msg.className = 'message error';
  }
  msg.classList.remove('hidden');
});

// Utility to escape HTML
function escapeHtml(text) {
  return text.replace(/[&<>"']/g, function(m) {
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];
  });
}


