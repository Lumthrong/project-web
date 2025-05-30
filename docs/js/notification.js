// notification.js
async function fetchNotifications() {
  const container = document.getElementById('notificationList');
  container.innerHTML = '<div class="loading">Loading notifications...</div>';
  
  try {
    const res = await fetch('https://project-web-toio.onrender.com/notifications');
    const notifications = await res.json();

    if (!notifications.length) {
      container.innerHTML = `
        <div class="empty-notifications">
          <i class="fas fa-bell-slash"></i>
          <h3>No Notifications Available</h3>
          <p>Check back later for new announcements</p>
        </div>
      `;
      return;
    }

    // Sort by date (newest first)
    notifications.sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    );

    container.innerHTML = notifications.map(n => `
      <div class="notification-item">
        <h3>${escapeHtml(n.title)}</h3>
        <div class="notification-date">
          <i class="far fa-calendar-alt"></i>
          ${formatDate(n.created_at)}
        </div>
        <p>${escapeHtml(n.description)}</p>
        ${n.document_path ? `
          <a href="https://project-web-toio.onrender.com${escapeHtml(n.document_path)}" 
             class="notification-document" 
             target="_blank">
            <i class="fas fa-file-download"></i>
            Download Document
          </a>
        ` : ''}
      </div>
    `).join('');

    // Setup filters
    setupFilters(notifications);

  } catch (error) {
    console.error('Error loading notifications:', error);
    container.innerHTML = `
      <div class="empty-notifications">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Failed to Load Notifications</h3>
        <p>Please try again later</p>
      </div>
    `;
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function setupFilters(notifications) {
  const searchInput = document.getElementById('searchInput');
  const dateFilter = document.getElementById('dateFilter');
  
  const filterNotifications = () => {
    const searchTerm = searchInput.value.toLowerCase();
    const dateValue = dateFilter.value;
    
    const filtered = notifications.filter(n => {
      // Search filter
      const matchesSearch = n.title.toLowerCase().includes(searchTerm) || 
                           n.description.toLowerCase().includes(searchTerm);
      
      // Date filter
      const now = new Date();
      const notifDate = new Date(n.created_at);
      
      let matchesDate = true;
      if (dateValue === 'week') {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        matchesDate = notifDate >= weekAgo;
      } else if (dateValue === 'month') {
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        matchesDate = notifDate >= monthAgo;
      }
      
      return matchesSearch && matchesDate;
    });
    
    renderFilteredNotifications(filtered);
  };
  
  searchInput.addEventListener('input', filterNotifications);
  dateFilter.addEventListener('change', filterNotifications);
}

function renderFilteredNotifications(filtered) {
  const container = document.getElementById('notificationList');
  
  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-notifications">
        <i class="fas fa-search"></i>
        <h3>No Matching Notifications</h3>
        <p>Try adjusting your search criteria</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = filtered.map(n => `
    <div class="notification-item">
      <h3>${escapeHtml(n.title)}</h3>
      <div class="notification-date">
        <i class="far fa-calendar-alt"></i>
        ${formatDate(n.created_at)}
      </div>
      <p>${escapeHtml(n.description)}</p>
      ${n.document_path ? `
        <a href="https://project-web-toio.onrender.com${escapeHtml(n.document_path)}" 
           class="notification-document" 
           target="_blank">
          <i class="fas fa-file-download"></i>
          Download Document
        </a>
      ` : ''}
    </div>
  `).join('');
}

document.addEventListener('DOMContentLoaded', fetchNotifications);
