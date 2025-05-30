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
            loadNotifications();
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
    await fetch('https://project-web-toio.onrender.com/admin-logout', {
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
    const res = await fetch('https://project-web-toio.onrender.com/check-admin-session', { credentials: 'include' });
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

// Load notifications with document links
async function loadNotifications() {
  try {
    const res = await fetch('https://project-web-toio.onrender.com/notifications');
    const data = await res.json();

    const tbody = document.querySelector('#notificationTable tbody');
    tbody.innerHTML = '';

    data.forEach(notification => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${notification.title}</td>
        <td>${notification.description}</td>
        <td>${
          notification.document_path 
            ? `<a href="https://project-web-toio.onrender.com${notification.document_path}" target="_blank">View Document</a>` 
            : 'No document'
        }</td>
        <td>
          <button class="delete-btn" data-id="${notification.id}">
            <i class="fas fa-trash"></i> Delete
          </button>
        </td>
      `;
      tbody.appendChild(row);
    });

    // Add delete handlers
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        if (confirm('Are you sure you want to delete this notification?')) {
          try {
            const response = await fetch(`https://project-web-toio.onrender.com/delete-notification/${id}`, { 
              method: 'DELETE',
              credentials: 'include'
            });
            
            if (response.ok) {
              loadNotifications();
            } else {
              alert('Failed to delete notification');
            }
          } catch (err) {
            console.error('Delete error:', err);
            alert('Error deleting notification');
          }
        }
      });
    });
  } catch (err) {
    console.error('Error loading notifications:', err);
  }
}

// Add notification form handler
document.addEventListener('DOMContentLoaded', () => {
  
  const addForm = document.getElementById('addNotificationForm');
  if (addForm) {
    addForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const messageElement = addForm.querySelector('.showMessage');
      const formData = new FormData(addForm);
      
      try {
        const response = await fetch('https://project-web-toio.onrender.com/add-notification', {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });
        
        if (response.ok) {
          messageElement.textContent = 'Notification added successfully!';
          messageElement.className = 'showMessage success';
          addForm.reset();
          loadNotifications();
        } else {
          messageElement.textContent = 'Failed to add notification';
          messageElement.className = 'showMessage error';
        }
      } catch (err) {
        console.error('Notification error:', err);
        messageElement.textContent = 'Error adding notification';
        messageElement.className = 'showMessage error';
      }
    });
  }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('adminLoginForm')?.addEventListener('submit', adminLogin);
  document.getElementById('uploadCsvBtn')?.addEventListener('click', uploadCSV);
  checkAdminSession();
});
    


