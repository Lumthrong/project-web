// Initialize date dropdowns
function initDateDropdowns() {
    const days = Array.from({length: 31}, (_, i) => i + 1);
    const months = [
        {value: '01', name: 'January'}, {value: '02', name: 'February'}, 
        {value: '03', name: 'March'}, {value: '04', name: 'April'}, 
        {value: '05', name: 'May'}, {value: '06', name: 'June'},
        {value: '07', name: 'July'}, {value: '08', name: 'August'}, 
        {value: '09', name: 'September'}, {value: '10', name: 'October'}, 
        {value: '11', name: 'November'}, {value: '12', name: 'December'}
    ];
    const currentYear = new Date().getFullYear();
    const years = Array.from({length: 30}, (_, i) => currentYear - 25 + i);

    const daySelect = document.getElementById('dobDay');
    const monthSelect = document.getElementById('dobMonth');
    const yearSelect = document.getElementById('dobYear');

    // Add days
    days.forEach(day => {
        const option = document.createElement('option');
        option.value = day.toString().padStart(2, '0');
        option.textContent = day;
        daySelect.appendChild(option);
    });

    // Add months
    months.forEach(month => {
        const option = document.createElement('option');
        option.value = month.value;
        option.textContent = month.name;
        monthSelect.appendChild(option);
    });

    // Add years
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    });

    // Set default to current date
    const today = new Date();
    daySelect.value = today.getDate().toString().padStart(2, '0');
    monthSelect.value = (today.getMonth() + 1).toString().padStart(2, '0');
    yearSelect.value = today.getFullYear() - 10;
}

// Admin login
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

// Check result
async function checkResult(e) {
    e.preventDefault();
    const name = document.getElementById('studentName').value;
    const roll_no = document.getElementById('rollNumber').value;
    const dob = `${document.getElementById('dobYear').value}-${
        document.getElementById('dobMonth').value}-${
        document.getElementById('dobDay').value}`;
    
    const message = document.getElementById('resultMessage');
    const resultDisplay = document.getElementById('resultDisplay');
    const table = document.getElementById('resultTable');

    try {
        const response = await fetch('https://project-web-toio.onrender.com/check-result', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ name, dob, roll_no }),
            credentials: 'include'
        });

        const data = await response.json();
        
        if (data.status === 'success') {
            message.textContent = '';
            message.className = '';
            message.classList.add('hidden');
            
            // Populate table
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>Subject</th>
                        <th>Marks</th>
                        <th>Grade</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.results.map(result => `
                        <tr>
                            <td>${result.subject}</td>
                            <td>${result.marks}</td>
                            <td>${result.grade}</td>
                        </tr>
                    `).join('')}
                </tbody>
            `;
            
            resultDisplay.classList.remove('hidden');
        } else {
            message.textContent = 'No results found. Please check your details.';
            message.className = 'message error';
            message.classList.remove('hidden');
            resultDisplay.classList.add('hidden');
        }
    } catch (error) {
        message.textContent = 'Error fetching results. Please try again.';
        message.className = 'message error';
        message.classList.remove('hidden');
        resultDisplay.classList.add('hidden');
    }
}

// Download PDF
async function downloadPDF() {
    const name = document.getElementById('studentName').value;
    const roll_no = document.getElementById('rollNumber').value;
    const dob = `${document.getElementById('dobYear').value}-${
        document.getElementById('dobMonth').value}-${
        document.getElementById('dobDay').value}`;

    try {
        const response = await fetch('https://project-web-toio.onrender.com/download-pdf', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ name, dob, roll_no }),
            credentials: 'include'
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${name}_${roll_no}_result.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    } catch (error) {
        alert('Failed to download PDF. Please try again.');
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    initDateDropdowns();
    
    document.getElementById('adminLoginForm')?.addEventListener('submit', adminLogin);
    document.getElementById('uploadCsvBtn')?.addEventListener('click', uploadCSV);
    document.getElementById('resultCheckForm')?.addEventListener('submit', checkResult);
    document.getElementById('downloadPdfBtn')?.addEventListener('click', downloadPDF);
});

//admin login/logout 
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('https://project-web-toio.onrender.com/check-admin-session', {
      credentials: 'include'
    });
    const data = await res.json();
    if (data.loggedIn) {
      document.getElementById('authItem').style.display = 'none';
      document.getElementById('logoutItem').style.display = 'block';
      document.getElementById('usernameDisplay').textContent = `Logged in as ${data.username}`;
      document.getElementById('adminControls').classList.remove('hidden');
    }
  } catch (err) {
    console.error("Session check failed", err);
  }
});

document.getElementById('logoutBtn')?.addEventListener('click', async (e) => {
  e.preventDefault();
  await fetch('https://project-web-toio.onrender.com/admin-logout', {
    method: 'POST',
    credentials: 'include'
  });
  window.location.reload();
});

//file type csv validation 
if (!file.name.endsWith('.csv')) {
    message.textContent = 'Only .csv files are allowed.';
    message.className = 'message error';
    message.classList.remove('hidden');
    return;
}


