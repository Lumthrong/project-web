document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('notificationContainer');

    fetch('https://project-web-toio.onrender.com/api/notifications')
        .then(res => res.json())
        .then(notifications => {
            if (notifications.length === 0) {
                container.innerHTML = '<p>No notifications available.</p>';
                return;
            }

            notifications.forEach(n => {
                const card = document.createElement('div');
                card.className = 'notification-card';
                card.innerHTML = `
                    <h3>${n.title}</h3>
                    <p>${n.description}</p>
                    ${n.link ? `<a href="${n.link}" target="_blank">Read more</a>` : ''}
                `;
                container.appendChild(card);
            });
        })
        .catch(err => {
            container.innerHTML = '<p>Failed to load notifications.</p>';
            console.error(err);
        });
});
