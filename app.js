const storage = {
  get(key, fallback) {
    const value = localStorage.getItem(key);
    try {
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
};

const els = {
  chatList: document.getElementById("chatList"),
  chatTitle: document.getElementById("chatTitle"),
  chatMeta: document.getElementById("chatMeta"),
  messages: document.getElementById("messages"),
  messageForm: document.getElementById("messageForm"),
  messageInput: document.getElementById("messageInput"),
  modalOverlay: document.getElementById("modalOverlay"),
  modalContent: document.getElementById("modalContent"),
  modalClose: document.getElementById("modalClose"),
  btnCreateChat: document.getElementById("btnCreateChat"),
  btnJoinChat: document.getElementById("btnJoinChat"),
  btnToggleSidebar: document.getElementById("btnToggleSidebar"),
  chatView: document.getElementById("chatView"),
};

const state = {
  chats: storage.get("simpleChat_chats", {}),
  userChats: storage.get("simpleChat_userChats", []),
  activeChatId: storage.get("simpleChat_activeChat", null),
};

function createId(length = 8) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function createJoinCode() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function persist() {
  storage.set("simpleChat_chats", state.chats);
  storage.set("simpleChat_userChats", state.userChats);
  storage.set("simpleChat_activeChat", state.activeChatId);
}

function getActiveChat() {
  return state.chats[state.activeChatId] || null;
}

function ensureChatState(chatId) {
  if (!state.chats[chatId]) {
    state.chats[chatId] = { id: chatId, name: "Unbenannter Chat", code: createJoinCode(), messages: [] };
  }
  return state.chats[chatId];
}

function setActiveChat(chatId) {
  state.activeChatId = chatId;
  persist();
  render();
}

function addChatToList(chatId) {
  if (!state.userChats.includes(chatId)) {
    state.userChats.push(chatId);
    persist();
  }
}

function createChat(name) {
  const id = createId();
  const code = createJoinCode();
  state.chats[id] = { id, name, code, messages: [] };
  addChatToList(id);
  setActiveChat(id);
  persist();
  showToast(`Chat "${name}" erstellt!`);
}

function joinChatByCode(code) {
  const match = Object.values(state.chats).find((chat) => chat.code === code.trim().toUpperCase());
  if (!match) {
    showToast("Kein Chat mit diesem Code gefunden.", true);
    return;
  }

  addChatToList(match.id);
  setActiveChat(match.id);
  showToast(`Dem Chat "${match.name}" beigetreten!`);
}

function addMessage(text) {
  const chat = getActiveChat();
  if (!chat) return;

  const msg = {
    id: crypto.randomUUID ? crypto.randomUUID() : createId(16),
    sender: "Du",
    text: text.trim(),
    createdAt: Date.now(),
  };

  chat.messages.push(msg);
  persist();
  renderMessages();
  scrollMessagesToBottom();
}

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function renderChatList() {
  const current = state.activeChatId;
  els.chatList.innerHTML = "";

  if (!state.userChats.length) {
    els.chatList.innerHTML = '<p class="empty">Keine Chats. Erstelle einen neuen oder trete einem bei.</p>';
    return;
  }

  state.userChats.forEach((chatId) => {
    const chat = state.chats[chatId];
    if (!chat) return;

    const item = document.createElement("button");
    item.type = "button";
    item.className = "chat-item";
    if (chatId === current) item.classList.add("active");
    item.innerHTML = `
      <div>
        <p class="chat-item__title">${escapeHtml(chat.name)}</p>
        <p class="chat-item__meta">Code: <span class="chat-item__code">${escapeHtml(chat.code)}</span></p>
      </div>
      <div class="chat-item__meta">${chat.messages.length} Nachrichten</div>
    `;

    item.addEventListener("click", () => setActiveChat(chatId));
    els.chatList.appendChild(item);
  });
}

function renderMessages() {
  const chat = getActiveChat();
  els.messages.innerHTML = "";

  const hasChat = Boolean(chat);
  els.messageInput.disabled = !hasChat;
  els.messageInput.placeholder = hasChat ? "Nachricht schreiben..." : "Wähle einen Chat...";
  const submitBtn = els.messageForm.querySelector("button[type=submit]");
  if (submitBtn) submitBtn.disabled = !hasChat;

  if (!chat) {
    els.chatTitle.textContent = "Wähle einen Chat";
    els.chatMeta.textContent = "Erstelle oder trete einem Chat bei, um hier Nachrichten zu schreiben.";
    return;
  }

  els.chatTitle.textContent = chat.name;
  els.chatMeta.innerHTML = `Beitrittscode: <strong>${escapeHtml(chat.code)}</strong>`;

  if (!chat.messages.length) {
    els.messages.innerHTML = `<p class="empty">Noch keine Nachrichten. Schreibe etwas!</p>`;
    return;
  }

  chat.messages.forEach((msg) => {
    const item = document.createElement("article");
    item.className = `msg ${msg.sender === "Du" ? "you" : ""}`;
    item.innerHTML = `
      <div class="sender">${escapeHtml(msg.sender)}</div>
      <div class="text">${escapeHtml(msg.text)}</div>
      <div class="time">${escapeHtml(formatTime(msg.createdAt))}</div>
    `;
    els.messages.appendChild(item);
  });
}

function scrollMessagesToBottom() {
  requestAnimationFrame(() => {
    els.messages.scrollTop = els.messages.scrollHeight;
  });
}

function openModal(contentHtml) {
  els.modalContent.innerHTML = contentHtml;
  els.modalOverlay.classList.add("open");
  els.modalOverlay.hidden = false;

  const firstInput = els.modalOverlay.querySelector("input, button");
  if (firstInput) firstInput.focus();
}

function closeModal() {
  els.modalOverlay.classList.remove("open");
  els.modalOverlay.hidden = true;
  els.modalContent.innerHTML = "";
}

function showToast(message, isError = false) {
  const toast = document.createElement("div");
  toast.className = "toast" + (isError ? " toast--error" : "");
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("toast--visible"));
  setTimeout(() => {
    toast.classList.remove("toast--visible");
    toast.addEventListener("transitionend", () => toast.remove());
  }, 2500);
}

function escapeHtml(value) {
  const span = document.createElement("span");
  span.textContent = value;
  return span.innerHTML;
}

function toggleSidebar() {
  els.chatView.classList.toggle("sidebar-hidden");
}

function initEvents() {
  els.btnCreateChat.addEventListener("click", () => {
    openModal(`
      <h3>Neuen Chat erstellen</h3>
      <form id="createChatForm">
        <label>
          Name
          <input id="chatNameInput" type="text" placeholder="z. B. Freunde" required />
        </label>
        <button class="primary" type="submit">Erstellen</button>
      </form>
    `);

    const form = document.getElementById("createChatForm");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const nameInput = document.getElementById("chatNameInput");
      const name = nameInput.value.trim() || "Unbenannter Chat";
      createChat(name);
      closeModal();
    });
  });

  els.btnJoinChat.addEventListener("click", () => {
    openModal(`
      <h3>Chat beitreten</h3>
      <form id="joinChatForm">
        <label>
          Beitrittscode
          <input id="joinCodeInput" type="text" placeholder="ABC123" maxlength="8" required />
        </label>
        <button class="primary" type="submit">Beitreten</button>
      </form>
      <p class="hint">Gib den Code aus dem Chat ein, um beizutreten.</p>
    `);

    const form = document.getElementById("joinChatForm");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const code = document.getElementById("joinCodeInput").value.trim();
      joinChatByCode(code);
      closeModal();
    });
  });

  els.messageForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = els.messageInput.value.trim();
    if (!value) return;
    addMessage(value);
    els.messageInput.value = "";
  });

  els.modalClose.addEventListener("click", closeModal);
  els.modalOverlay.addEventListener("click", (event) => {
    if (event.target === els.modalOverlay) closeModal();
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !els.modalOverlay.hidden) {
      closeModal();
    }
  });

  els.btnToggleSidebar.addEventListener("click", () => {
    document.querySelector(".sidebar").classList.toggle("collapsed");
  });
}

function init() {
  initEvents();

  // Ensure the active chat is part of the list.
  if (state.activeChatId && !state.userChats.includes(state.activeChatId)) {
    state.userChats.unshift(state.activeChatId);
    persist();
  }

  render();
  if (getActiveChat()) scrollMessagesToBottom();
}

function render() {
  renderChatList();
  renderMessages();
}

init();
