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

// Show Logout Button inside adminControls
function showLogoutButton() {
  // Navbar items you created in the header
  const authItem   = document.getElementById('authItem');   // “Login”
  const logoutItem = document.getElementById('logoutItem'); // “Logout”

  /* 1. Hide the normal Login link
     2. Reveal the existing <li id="logoutItem">… */
  if (authItem)   authItem.style.display   = 'none';
  if (logoutItem) logoutItem.style.display = 'block';

  /* 3. Add the click-handler to its <a id="logoutBtn"> only **once** */
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn && !logoutBtn.dataset.listener) {      // prevent double binding
    logoutBtn.addEventListener('click', adminLogout);
    logoutBtn.dataset.listener = 'true';
  }
}
// Logout
async function adminLogout(e) {
    e.preventDefault();
    try {
        await fetch('https://project-web-toio.onrender.com/admin-logout', {
            method: 'POST',
            credentials: 'include'
        });
        window.location.reload();
    } catch {
        alert('Logout failed. Please try again.');
    }
}

// Session check on page load
async function checkAdminSession() {
    try {
        const res = await fetch('https://project-web-toio.onrender.com/check-admin-session', {
            credentials: 'include'
        });
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
        console.error("Session check failed", err);
    }
}

// Event listeners setup
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('adminLoginForm')?.addEventListener('submit', adminLogin);
    document.getElementById('uploadCsvBtn')?.addEventListener('click', uploadCSV);
    document.getElementById('addNotificationForm')?.addEventListener('submit', addNotification);
    checkAdminSession();
});
// Add Notification
async function addNotification(e) {
    e.preventDefault();
    const title = document.getElementById('notifTitle').value;
    const description = document.getElementById('notifDesc').value;
    const link = document.getElementById('notifLink').value;
    const message = document.getElementById('notifMessage');

    try {
        const response = await fetch('https://project-web-toio.onrender.com/admin/add-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ title, description, link })
        });

        if (response.ok) {
            message.textContent = 'Notification added successfully!';
            message.className = 'message success';
            document.getElementById('addNotificationForm').reset();
            loadNotifications();
        } else {
            message.textContent = 'Failed to add notification.';
            message.className = 'message error';
        }
    } catch (err) {
        message.textContent = 'Error occurred while adding notification.';
        message.className = 'message error';
    }

    message.classList.remove('hidden');
}

// Load All Notifications
async function loadNotifications() {
    try {
        const res = await fetch('https://project-web-toio.onrender.com/api/notifications', {
            credentials: 'include'
        });
        const notifications = await res.json();
        const tableBody = document.querySelector('#notificationTable tbody');
        tableBody.innerHTML = '';

        notifications.forEach(n => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${n.title}</td>
                <td>${n.description}</td>
                <td>${n.link ? `<a href="${n.link}" target="_blank">Link</a>` : '—'}</td>
                <td><button class="delete-btn" data-id="${n.id}">Delete</button></td>
            `;
            tableBody.appendChild(row);
        });

        // Attach delete listeners
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this notification?')) {
                    await deleteNotification(id);
                }
            });
        });
    } catch (err) {
        console.error("Failed to load notifications", err);
    }
}

// Delete Notification
async function deleteNotification(id) {
    try {
        const res = await fetch(`https://project-web-toio.onrender.com/admin/delete-notification/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (res.ok) {
            loadNotifications();
        } else {
            alert('Failed to delete notification');
        }
    } catch (err) {
        alert('Error while deleting notification');
    }
}
