// Database Initialization - LocalStorage or Default Data
let registeredUsers = JSON.parse(localStorage.getItem('mp_users')) || [
  { username: "KOROL_988", pass: "said9800", role: "Владелец сайта", isBlocked: false },
  { username: "Admin_Ali", pass: "ali1234", role: "Администратор", isBlocked: false },
  { username: "SimpleUser", pass: "1234", role: "Пользователь", isBlocked: false }
];

// Active User Persistence
let currentUser = JSON.parse(localStorage.getItem('mp_current_user')) || null;
let activeChatPartner = null;

// Load Global Products and Chats (Shared Across All Users)
let products = JSON.parse(localStorage.getItem('mp_products')) || [
  {
    id: 1,
    seller: "KOROL_988",
    title: "Тестовый Товар Владельца",
    type: "image",
    img: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500",
    desc: "Это пример товара, который видят все пользователи.",
    secretData: "Логин: admin | Пароль: secret_pass",
    passKey: "123"
  }
];

let chats = JSON.parse(localStorage.getItem('mp_chats')) || [];

// Save State Function
function saveData() {
  localStorage.setItem('mp_users', JSON.stringify(registeredUsers));
  localStorage.setItem('mp_products', JSON.stringify(products));
  localStorage.setItem('mp_chats', JSON.stringify(chats));
  
  if (currentUser) {
    localStorage.setItem('mp_current_user', JSON.stringify(currentUser));
  } else {
    localStorage.removeItem('mp_current_user');
  }
}

// DOM Elements
const tabMarketBtn = document.getElementById("tabMarketBtn");
const tabAddBtn = document.getElementById("tabAddBtn");
const tabProfileBtn = document.getElementById("tabProfileBtn");
const tabChatBtn = document.getElementById("tabChatBtn");

const marketSection = document.getElementById("marketSection");
const addSection = document.getElementById("addSection");
const profileSection = document.getElementById("profileSection");
const chatSection = document.getElementById("chatSection");

const marketGrid = document.getElementById("marketGrid");
const myProductsGrid = document.getElementById("myProductsGrid");
const sellForm = document.getElementById("sellForm");

const authModal = document.getElementById("authModal");
const openAuthModalBtn = document.getElementById("openAuthModalBtn");
const closeAuthModal = document.getElementById("closeAuthModal");

const showLoginBtn = document.getElementById("showLoginBtn");
const showRegisterBtn = document.getElementById("showRegisterBtn");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const navUsername = document.getElementById("navUsername");
const logoutBtn = document.getElementById("logoutBtn");
const loginError = document.getElementById("loginError");
const shareSiteBtn = document.getElementById("shareSiteBtn");

const adminPanel = document.getElementById("adminPanel");
const userRolesList = document.getElementById("userRolesList");
const blockedOverlay = document.getElementById("blockedOverlay");
const blockedLogoutBtn = document.getElementById("blockedLogoutBtn");

// Copy Direct URL
if (shareSiteBtn) {
  shareSiteBtn.onclick = () => {
    const cleanUrl = window.location.origin + window.location.pathname;
    navigator.clipboard.writeText(cleanUrl);
    alert("Ссылка на сайт скопирована!\n" + cleanUrl);
  };
}

// Check Blocked State
function checkBlockedState() {
  if (currentUser && currentUser.isBlocked) {
    blockedOverlay?.classList.remove("hidden");
  } else {
    blockedOverlay?.classList.add("hidden");
  }
}

if (blockedLogoutBtn) {
  blockedLogoutBtn.onclick = () => {
    currentUser = null;
    saveData();
    checkBlockedState();
    location.reload();
  };
}

// Navigation / Tabs
function resetTabs() {
  [marketSection, addSection, profileSection, chatSection].forEach(s => s?.classList.remove("active"));
  [tabMarketBtn, tabAddBtn, tabProfileBtn, tabChatBtn].forEach(b => b?.classList.remove("active"));
}

function switchTab(tabName) {
  resetTabs();
  if (tabName === 'market') {
    marketSection?.classList.add("active");
    tabMarketBtn?.classList.add("active");
    renderMarket();
  } else if (tabName === 'add') {
    addSection?.classList.add("active");
    tabAddBtn?.classList.add("active");
  } else if (tabName === 'profile') {
    profileSection?.classList.add("active");
    tabProfileBtn?.classList.add("active");
    renderProfile();
  } else if (tabName === 'chat') {
    chatSection?.classList.add("active");
    tabChatBtn?.classList.add("active");
    renderChatList();
  }
  localStorage.setItem('mp_active_tab', tabName);
}

if (tabMarketBtn) tabMarketBtn.onclick = () => switchTab('market');
if (tabAddBtn) tabAddBtn.onclick = () => switchTab('add');
if (tabProfileBtn) tabProfileBtn.onclick = () => switchTab('profile');
if (tabChatBtn) tabChatBtn.onclick = () => switchTab('chat');

// Auth Modals
if (openAuthModalBtn) openAuthModalBtn.onclick = () => authModal.style.display = "flex";
if (closeAuthModal) closeAuthModal.onclick = () => authModal.style.display = "none";

if (showLoginBtn && showRegisterBtn) {
  showLoginBtn.onclick = () => {
    showLoginBtn.classList.add("active"); showRegisterBtn.classList.remove("active");
    loginForm.classList.add("active"); registerForm.classList.remove("active");
  };
  showRegisterBtn.onclick = () => {
    showRegisterBtn.classList.add("active"); showLoginBtn.classList.remove("active");
    registerForm.classList.add("active"); loginForm.classList.remove("active");
  };
}

// Registration
if (registerForm) {
  registerForm.onsubmit = (e) => {
    e.preventDefault();
    let u = document.getElementById("regUser").value.trim();
    const preset = document.getElementById("presetNick").value;
    const p = document.getElementById("regPass").value.trim();

    if (preset) u = u + preset;

    if (registeredUsers.some(user => user.username === u)) {
      alert("Этот логин уже занят!");
      return;
    }

    const newUser = { username: u, pass: p, role: "Пользователь", isBlocked: false };
    registeredUsers.push(newUser);
    saveData();

    alert(`Аккаунт создался! Ваш логин: ${u}`);
    registerForm.reset();
    showLoginBtn.click();
  };
}

// Login
if (loginForm) {
  loginForm.onsubmit = (e) => {
    e.preventDefault();
    const u = document.getElementById("loginUser").value.trim();
    const p = document.getElementById("loginPass").value.trim();

    const userFound = registeredUsers.find(user => user.username === u && user.pass === p);

    if (userFound) {
      currentUser = userFound;
      saveData();
      checkBlockedState();

      if (currentUser.isBlocked) return;

      updateUserNavUI();
      authModal.style.display = "none";
      loginForm.reset();

      alert(`Добро пожаловать, ${currentUser.username}!`);
      renderMarket();
      renderProfile();
    } else {
      if (loginError) loginError.classList.remove("hidden");
    }
  };
}

// Logout
if (logoutBtn) {
  logoutBtn.onclick = () => {
    currentUser = null;
    saveData();
    updateUserNavUI();
    checkBlockedState();
    renderMarket();
    renderProfile();
  };
}

// Update Top Bar User Info
function updateUserNavUI() {
  if (currentUser) {
    navUsername.innerHTML = `<i class="fa-solid fa-circle-user"></i> ${currentUser.username}`;
    openAuthModalBtn.classList.add("hidden");
    logoutBtn.classList.remove("hidden");
    if (loginError) loginError.classList.add("hidden");
  } else {
    navUsername.innerHTML = `<i class="fa-solid fa-circle-user"></i> Гость`;
    openAuthModalBtn.classList.remove("hidden");
    logoutBtn.classList.add("hidden");
  }
}

// Add Product
if (sellForm) {
  sellForm.onsubmit = (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert("Для публикации товара необходимо войти в аккаунт!");
      authModal.style.display = "flex";
      return;
    }

    const title = document.getElementById("prodTitle").value.trim();
    const type = document.getElementById("prodType").value;
    const img = document.getElementById("prodImgUrl").value.trim() || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500";
    const desc = document.getElementById("prodDesc").value.trim();
    const secretData = document.getElementById("prodSecretData").value.trim();
    const passKey = document.getElementById("prodSecretPassword").value.trim();

    const newProd = {
      id: Date.now(),
      seller: currentUser.username,
      title,
      type,
      img,
      desc,
      secretData,
      passKey
    };

    products.unshift(newProd);
    saveData();
    alert("Товар успешно опубликован!");
    sellForm.reset();
    switchTab('market');
  };
}

// Render Market Products (Visible to EVERYONE)
function renderMarket() {
  if (!marketGrid) return;
  marketGrid.innerHTML = "";

  // Always sync with latest storage
  products = JSON.parse(localStorage.getItem('mp_products')) || [];

  if (products.length === 0) {
    marketGrid.innerHTML = "<p style='color:#9ca3af; grid-column: 1/-1; text-align: center; padding: 40px;'>Товаров пока нет. Вы можете добавить первый товар!</p>";
    return;
  }

  const canDelete = currentUser && (currentUser.role === "Администратор" || currentUser.role === "Владелец сайта");

  products.forEach((p) => {
    const card = document.createElement("div");
    card.className = "card-item card";

    let mediaHTML = p.type === "image"
      ? `<img src="${p.img}" alt="${p.title}">`
      : `<div class="text-type-badge"><i class="fa-solid fa-file-lines"></i> Текстовый Товар</div>`;

    let deleteBtnHTML = canDelete ? `
      <button class="btn btn-danger" style="padding: 4px 8px; font-size: 0.75rem; margin-left: 5px;" onclick="deleteProduct(${p.id})">
        <i class="fa-solid fa-trash"></i> Удалить
      </button>
    ` : '';

    card.innerHTML = `
      ${mediaHTML}
      <div class="card-body">
        <div>
          <div class="seller-info">
            <span><i class="fa-solid fa-user-tag"></i> <b>${p.seller}</b></span>
            <div>
              <button class="btn btn-warning" style="padding: 4px 8px; font-size: 0.75rem;" onclick="openChatWithSeller('${p.seller}')">
                <i class="fa-solid fa-paper-plane"></i> Чат
              </button>
              ${deleteBtnHTML}
            </div>
          </div>
          <h3>${p.title}</h3>
          <p>${p.desc}</p>
        </div>
        
        <div class="access-zone">
          <label style="font-size: 0.8rem; color:#9ca3af;">Введите пароль для просмотра контента:</label>
          <div style="display:flex; gap:5px; margin-top:4px;">
            <input type="password" id="passInput_${p.id}" placeholder="Пароль">
            <button class="btn btn-primary" onclick="unlockSecret(${p.id})">Открыть</button>
          </div>
          <div id="secretResult_${p.id}" class="hidden"></div>
        </div>
      </div>
    `;
    marketGrid.appendChild(card);
  });
}

// Delete Product
window.deleteProduct = function(id) {
  if (confirm("Вы действительно хотите удалить этот товар?")) {
    products = products.filter(p => p.id !== id);
    saveData();
    alert("Товар успешно удален!");
    renderMarket();
  }
};

// Unlock Secret
window.unlockSecret = function(id) {
  const prod = products.find(p => p.id === id);
  const inputEl = document.getElementById(`passInput_${id}`);
  const resDiv = document.getElementById(`secretResult_${id}`);

  if (inputEl && inputEl.value.trim() === prod.passKey) {
    resDiv.className = "unlocked-data";
    resDiv.innerHTML = `<i class="fa-solid fa-lock-open"></i> <b>Секретная информация:</b><br>${prod.secretData}`;
  } else {
    alert("Неверный пароль!");
  }
};

// Render Profile & Admin Panel
function renderProfile() {
  const profName = document.getElementById("profName");
  const profRoleBadge = document.getElementById("profRoleBadge");

  if (!currentUser) {
    if (profName) profName.textContent = "Гость";
    if (profRoleBadge) {
      profRoleBadge.textContent = "Вы не авторизованы";
      profRoleBadge.className = "role-tag role-user";
    }
    if (adminPanel) adminPanel.classList.add("hidden");
    if (myProductsGrid) myProductsGrid.innerHTML = "<p style='color:#9ca3af;'>Вы не вошли в систему.</p>";
    return;
  }

  if (profName) profName.textContent = currentUser.username;

  if (profRoleBadge) {
    profRoleBadge.textContent = currentUser.role;
    if (currentUser.role === "Владелец сайта") profRoleBadge.className = "role-tag role-owner";
    else if (currentUser.role === "Администратор") profRoleBadge.className = "role-tag role-admin";
    else profRoleBadge.className = "role-tag role-user";
  }

  // Show Admin Panel if Owner or Admin
  if (currentUser.role === "Владелец сайта" || currentUser.role === "Администратор") {
    if (adminPanel) adminPanel.classList.remove("hidden");
    renderAdminUserList();
  } else {
    if (adminPanel) adminPanel.classList.add("hidden");
  }

  // My Products list
  if (myProductsGrid) {
    myProductsGrid.innerHTML = "";
    const myProds = products.filter(p => p.seller === currentUser.username);
    if (myProds.length === 0) {
      myProductsGrid.innerHTML = "<p style='color:#9ca3af;'>Вы еще не выставили ни одного товара.</p>";
    } else {
      myProds.forEach(p => {
        const card = document.createElement("div");
        card.className = "card-item card";
        card.innerHTML = `
          <div class="card-body">
            <h3>${p.title}</h3>
            <p>${p.desc}</p>
            <p style="font-size:0.85rem; color:#f59e0b;">Ваш пароль к товару: <b>${p.passKey}</b></p>
          </div>
        `;
        myProductsGrid.appendChild(card);
      });
    }
  }
}

// Render Admin User List (FIXED FOR NAMES SHOWING PROPERLY)
function renderAdminUserList() {
  if (!userRolesList) return;
  userRolesList.innerHTML = "";

  registeredUsers = JSON.parse(localStorage.getItem('mp_users')) || [];
  const isOwner = currentUser && currentUser.role === "Владелец сайта";

  registeredUsers.forEach(u => {
    if (currentUser && u.username === currentUser.username) return;

    const row = document.createElement("div");
    row.className = "user-role-row";

    let blockBtn = u.isBlocked 
      ? `<button class="btn btn-success" style="padding:4px 8px; font-size:0.8rem;" onclick="toggleBlockUser('${u.username}')">Разблокировать</button>`
      : `<button class="btn btn-danger" style="padding:4px 8px; font-size:0.8rem;" onclick="toggleBlockUser('${u.username}')">Заблокировать</button>`;

    let roleActionBtns = "";
    if (isOwner) {
      if (u.role === "Администратор") {
        roleActionBtns = `<button class="btn btn-warning" style="padding:4px 8px; font-size:0.8rem;" onclick="changeRole('${u.username}', 'Пользователь')">Снять Админа</button>`;
      } else if (u.role === "Пользователь") {
        roleActionBtns = `<button class="btn btn-primary" style="padding:4px 8px; font-size:0.8rem;" onclick="changeRole('${u.username}', 'Администратор')">Сделать Админом</button>`;
      }
    }

    let roleBadgeClass = u.role === "Владелец сайта" ? "role-owner" : (u.role === "Администратор" ? "role-admin" : "role-user");

    row.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px;">
        <i class="fa-solid fa-user" style="color:#94a3b8;"></i>
        <b style="color:#f8fafc;">${u.username}</b> 
        <span class="role-tag ${roleBadgeClass}">${u.role}</span>
        ${u.isBlocked ? '<b style="color:#ef4444; font-size:0.8rem;">[ЗАБЛОКИРОВАН]</b>' : ''}
      </div>
      <div style="display:flex; gap:5px; align-items:center;">
        ${roleActionBtns}
        ${blockBtn}
      </div>
    `;
    userRolesList.appendChild(row);
  });
}

// Change Role
window.changeRole = function(username, newRole) {
  if (currentUser.role !== "Владелец сайта") {
    alert("Только Владелец сайта может назначать или снимать Администраторов!");
    return;
  }
  const targetUser = registeredUsers.find(u => u.username === username);
  if (targetUser) {
    targetUser.role = newRole;
    saveData();
    alert(`Пользователю ${username} присвоена роль: ${newRole}`);
    renderProfile();
  }
};

// Block/Unblock
window.toggleBlockUser = function(username) {
  const targetUser = registeredUsers.find(u => u.username === username);
  if (targetUser) {
    if (targetUser.role === "Владелец сайта") {
      alert("Нельзя заблокировать Владельца сайта!");
      return;
    }
    targetUser.isBlocked = !targetUser.isBlocked;
    saveData();
    alert(`Пользователь ${username} ${targetUser.isBlocked ? 'заблокирован' : 'разблокирован'}!`);
    renderAdminUserList();
  }
};

// Chat Functions
window.openChatWithSeller = function(sellerName) {
  if (!currentUser) {
    alert("Для общения с продавцом необходимо войти в аккаунт!");
    authModal.style.display = "flex";
    return;
  }
  if (currentUser.username === sellerName) {
    alert("Вы не можете написать самому себе!");
    return;
  }
  activeChatPartner = sellerName;
  switchTab('chat');
  renderChatMessages();
};

function renderChatList() {
  const chatUsersList = document.getElementById("chatUsersList");
  if (!chatUsersList) return;
  chatUsersList.innerHTML = "";

  if (!currentUser) {
    chatUsersList.innerHTML = "<p style='color:#64748b; font-size:0.8rem;'>Войдите в аккаунт</p>";
    return;
  }

  const userPartners = new Set();
  chats.forEach(c => {
    if (c.sender === currentUser.username) userPartners.add(c.receiver);
    if (c.receiver === currentUser.username) userPartners.add(c.sender);
  });

  if (userPartners.size === 0) {
    chatUsersList.innerHTML = "<p style='color:#64748b; font-size:0.8rem;'>Чатов пока нет</p>";
    return;
  }

  userPartners.forEach(partner => {
    const btn = document.createElement("button");
    btn.className = `chat-user-btn ${activeChatPartner === partner ? 'active' : ''}`;
    btn.innerHTML = `<i class="fa-solid fa-user"></i> ${partner}`;
    btn.onclick = () => {
      activeChatPartner = partner;
      renderChatList();
      renderChatMessages();
    };
    chatUsersList.appendChild(btn);
  });
}

function renderChatMessages() {
  const chatHeader = document.getElementById("chatHeader");
  const chatMessages = document.getElementById("chatMessages");
  const chatInput = document.getElementById("chatInput");
  const sendMsgBtn = document.getElementById("sendMsgBtn");

  if (!activeChatPartner || !currentUser) {
    if (chatHeader) chatHeader.textContent = "Выберите собеседника";
    if (chatMessages) chatMessages.innerHTML = "<div class='empty-chat-msg'>Выберите чат из списка</div>";
    if (chatInput) chatInput.disabled = true;
    if (sendMsgBtn) sendMsgBtn.disabled = true;
    return;
  }

  if (chatHeader) chatHeader.textContent = `Чат с ${activeChatPartner}`;
  if (chatInput) chatInput.disabled = false;
  if (sendMsgBtn) sendMsgBtn.disabled = false;

  const activeMsgs = chats.filter(c => 
    (c.sender === currentUser.username && c.receiver === activeChatPartner) ||
    (c.sender === activeChatPartner && c.receiver === currentUser.username)
  );

  if (chatMessages) {
    chatMessages.innerHTML = "";
    if (activeMsgs.length === 0) {
      chatMessages.innerHTML = "<div class='empty-chat-msg'>Напишите первое сообщение...</div>";
    } else {
      activeMsgs.forEach(m => {
        const bubble = document.createElement("div");
        bubble.className = `msg-bubble ${m.sender === currentUser.username ? 'msg-me' : 'msg-other'}`;
        bubble.textContent = m.text;
        chatMessages.appendChild(bubble);
      });
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }
}

// Send Message
const chatForm = document.getElementById("chatForm");
if (chatForm) {
  chatForm.onsubmit = (e) => {
    e.preventDefault();
    const chatInput = document.getElementById("chatInput");
    const text = chatInput.value.trim();

    if (text && currentUser && activeChatPartner) {
      chats.push({
        sender: currentUser.username,
        receiver: activeChatPartner,
        text
      });
      saveData();
      chatInput.value = "";
      renderChatMessages();
      renderChatList();
    }
  };
}

// Initial Load Handler
document.addEventListener("DOMContentLoaded", () => {
  saveData(); // Sync database
  updateUserNavUI();
  checkBlockedState();

  const savedTab = localStorage.getItem('mp_active_tab') || 'market';
  switchTab(savedTab);
});
