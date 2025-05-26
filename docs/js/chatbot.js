let chatHistory = JSON.parse(localStorage.getItem("chatHistory") || "[]");

function saveMessage(role, content) {
  chatHistory.push({ role, content });
  localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
}

function loadHistory() {
  const chatBox = document.getElementById("chat-box");
  chatBox.innerHTML = `
    <div id="typing-indicator" style="display: none;">
      <span class="dot"></span><span class="dot"></span><span class="dot"></span>
    </div>
  `;

  // Add welcome message at the top if no history exists
  if (chatHistory.length === 0) {
    const welcomeDiv = document.createElement("div");
    welcomeDiv.className = "bot-msg";
    welcomeDiv.innerHTML = `<strong>Martin</strong> Hi, how can I assist you today?`;
    chatBox.insertBefore(welcomeDiv, document.getElementById("typing-indicator"));
  }

  // Load existing history below welcome message
  for (let msg of chatHistory) {
    const div = document.createElement("div");
    div.className = msg.role === "user" ? "user-msg" : "bot-msg";
    div.innerHTML = `<strong>${msg.role === "user" ? "You" : "Martin"}<br></strong> ${msg.role === "user" ? msg.content : marked.parse(msg.content)}`;
    chatBox.insertBefore(div, document.getElementById("typing-indicator"));
  }
  
  chatBox.scrollTop = chatBox.scrollHeight;
}

function clearHistory() {
  localStorage.removeItem("chatHistory");
  chatHistory = [];
  loadHistory();
}

function showTypingIndicator() {
  const indicator = document.getElementById("typing-indicator");
  if (indicator) indicator.style.display = "flex";
}

function removeTypingIndicator() {
  const indicator = document.getElementById("typing-indicator");
  if (indicator) indicator.style.display = "none";
}
function handlePageLinks() {
  document.querySelectorAll('.page-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const pageName = link.dataset.pagename || link.textContent.replace(' Page', '');
      const page = resources.find(r => r.displayName === pageName);
      if (page) window.open(page.url, '_blank');
    });
  });
}

// Modified sendMessage
async function sendMessage() {
  const input = document.getElementById("user-input");
  const chatBox = document.getElementById("chat-box");
  const message = input.value.trim();
  if (!message) return;

  // Add user message
  const userMsgEl = document.createElement("div");
  userMsgEl.className = "user-msg";
  userMsgEl.innerHTML = message;
  chatBox.insertBefore(userMsgEl, document.getElementById("typing-indicator"));
  chatBox.scrollTop = chatBox.scrollHeight;
  saveMessage("user", message);
  input.value = "";
  showTypingIndicator();

  try {
    const response = await fetch("https://project-web-toio.onrender.com/get_response", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history: chatHistory })
    });
    
    if (!response.ok) throw new Error('Server error');
    
    const data = await response.json();
    removeTypingIndicator();

    // Add bot response
    const botMsgEl = document.createElement("div");
    botMsgEl.className = "bot-msg";
    botMsgEl.innerHTML = marked.parse(data.response);
    chatBox.insertBefore(botMsgEl, document.getElementById("typing-indicator"));
    
    // Enable page links
    handlePageLinks();
    
    chatBox.scrollTop = chatBox.scrollHeight;
    saveMessage("assistant", data.response);
  } catch (err) {
    removeTypingIndicator();
    const errorEl = document.createElement("div");
    errorEl.className = "bot-msg error";
    errorEl.textContent = "Connection error. Please check your network.";
    chatBox.insertBefore(errorEl, document.getElementById("typing-indicator"));
    chatBox.scrollTop = chatBox.scrollHeight;
    saveMessage("assistant", "Connection error.");
  }
}

document.addEventListener("click", function (e) {
  const chat = document.getElementById("chat-container");
  const icon = document.getElementById("chat-icon");
  if (chat.style.display === "flex" && !chat.contains(e.target) && !icon.contains(e.target)) {
    chat.style.display = "none";
  }
});

document.getElementById("user-input").addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

function toggleChat() {
  const chat = document.getElementById("chat-container");
  const isOpen = chat.style.display === "flex";

  if (!isOpen) {
    chat.style.display = "flex";
    loadHistory();
    setTimeout(() => {
      document.getElementById("user-input").focus();
    }, 0);
  } else {
    chat.style.display = "none";
  }
}
