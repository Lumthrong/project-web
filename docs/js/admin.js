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


// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('adminLoginForm').addEventListener('submit', adminLogin);
    document.getElementById('uploadCsvBtn').addEventListener('click', uploadCSV);
});

// Admin session check
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('https://project-web-toio.onrender.com/check-admin-session', {
      credentials: 'include'
    });
    const data = await res.json();
    if (data.loggedIn) {
      document.getElementById('adminControls').classList.remove('hidden');
      document.getElementById('adminMessage').textContent = `Logged in as ${data.username}`;
      document.getElementById('adminMessage').className = 'message success';
      document.getElementById('adminMessage').classList.remove('hidden');
    }
  } catch (err) {
    console.error("Session check failed", err);
  }
});

// Admin logout
document.getElementById('logoutBtn')?.addEventListener('click', async (e) => {
  e.preventDefault();
  await fetch('https://project-web-toio.onrender.com/admin-logout', {
    method: 'POST',
    credentials: 'include'
  });
  window.location.reload();
});
