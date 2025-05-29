async function fetchNotifications() {
  const container = document.getElementById('notificationList');
  try {
    const res = await fetch('https://project-web-toio.onrender.com/notifications');
    const notifications = await res.json();

    if (!notifications.length) {
      container.innerHTML = '<p>No notifications available.</p>';
      return;
    }

    container.innerHTML = notifications.map(n => `
      <div class="notification-item">
        <h3>${escapeHtml(n.title)}</h3>
        <p>${escapeHtml(n.description)}</p>
        ${n.link ? `<a href="${escapeHtml(n.link)}" target="_blank">Read more</a>` : ''}
      </div>
    `).join('');
  } catch {
    container.innerHTML = '<p>Failed to load notifications.</p>';
  }
}

// Same escapeHtml utility from above
function escapeHtml(text) {
  return text.replace(/[&<>"']/g, function(m) {
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];
  });
}

document.addEventListener('DOMContentLoaded', fetchNotifications);
