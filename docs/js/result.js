// Initialize date dropdowns
function initDateDropdowns() {
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = [
        { value: '01', name: 'January' }, { value: '02', name: 'February' },
        { value: '03', name: 'March' }, { value: '04', name: 'April' },
        { value: '05', name: 'May' }, { value: '06', name: 'June' },
        { value: '07', name: 'July' }, { value: '08', name: 'August' },
        { value: '09', name: 'September' }, { value: '10', name: 'October' },
        { value: '11', name: 'November' }, { value: '12', name: 'December' }
    ];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 20 }, (_, i) => currentYear - 25 + i);

    const daySelect = document.getElementById('dobDay');
    const monthSelect = document.getElementById('dobMonth');
    const yearSelect = document.getElementById('dobYear');

    if (!daySelect || !monthSelect || !yearSelect) return;

    days.forEach(day => {
        const option = document.createElement('option');
        option.value = day.toString().padStart(2, '0');
        option.textContent = day;
        daySelect.appendChild(option);
    });

    months.forEach(month => {
        const option = document.createElement('option');
        option.value = month.value;
        option.textContent = month.name;
        monthSelect.appendChild(option);
    });

    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    });

    const today = new Date();
    daySelect.value = today.getDate().toString().padStart(2, '0');
    monthSelect.value = (today.getMonth() + 1).toString().padStart(2, '0');
    yearSelect.value = today.getFullYear() - 10;
}

// Check result
async function checkResult(e) {
    e.preventDefault();

    const name = document.getElementById('studentName').value.trim();
    const roll_no = document.getElementById('rollNumber').value.trim();
    const dob = `${document.getElementById('dobYear').value}-${document.getElementById('dobMonth').value}-${document.getElementById('dobDay').value}`;

    const message = document.getElementById('resultMessage');
    const resultDisplay = document.getElementById('resultDisplay');
    const table = document.getElementById('resultTable');

    try {
        const response = await fetch('https://project-web-toio.onrender.com/check-result', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, dob, roll_no }),
            credentials: 'include'
        });

        const data = await response.json();

        if (data.status === 'success') {
            message.textContent = '';
            message.className = 'hidden';
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>Subject</th>
                        <th>Marks</th>
                        <th>Grade</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.results.map(r => `
                        <tr>
                            <td>${r.subject}</td>
                            <td>${r.marks}</td>
                            <td>${r.grade}</td>
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
    const name = document.getElementById('studentName').value.trim();
    const roll_no = document.getElementById('rollNumber').value.trim();
    const dob = `${document.getElementById('dobYear').value}-${document.getElementById('dobMonth').value}-${document.getElementById('dobDay').value}`;

    try {
        const response = await fetch('https://project-web-toio.onrender.com/download-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
        } else {
            alert('PDF download failed. Please check your information.');
        }
    } catch (error) {
        alert('Failed to download PDF. Please try again.');
    }
}

// Attach event listeners safely
function setupEventListeners() {
    const form = document.getElementById('resultCheckForm');
    const pdfBtn = document.getElementById('downloadPdfBtn');

    if (form) form.addEventListener('submit', checkResult);
    if (pdfBtn) pdfBtn.addEventListener('click', downloadPDF);
}

// Ensure DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initDateDropdowns();
        setupEventListeners();
    });
} else {
    initDateDropdowns();
    setupEventListeners();
}
