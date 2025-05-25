document.querySelectorAll('.filter-btn').forEach(button => {
  button.addEventListener('click', () => {
    const category = button.dataset.category;
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    document.querySelectorAll('.gallery-item').forEach(item => {
      item.style.display = (category === 'all' || item.dataset.category === category) ? 'block' : 'none';
    });
  });
});

 const modal = document.getElementById("lightbox-modal");
  const modalImg = document.getElementById("lightbox-img");
  const closeBtn = document.querySelector(".lightbox-close");

  document.querySelectorAll(".lightbox-trigger").forEach(imgLink => {
    imgLink.addEventListener("click", function (e) {
      e.preventDefault();
      modal.style.display = "block";
      modalImg.src = this.href;
    });
  });

  closeBtn.onclick = () => modal.style.display = "none";

  window.onclick = e => {
    if (e.target === modal) modal.style.display = "none";
  };