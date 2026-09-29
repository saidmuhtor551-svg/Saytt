// ==========================================
// 1. DATABASE & LOCALSTORAGE INITIALIZATION
// ==========================================

let registeredUsers = JSON.parse(localStorage.getItem("registeredUsers")) || [
  { username: "KOROL_988", pass: "said9800", role: "Владелец сайта", isBlocked: false },
  { username: "Admin_Ali", pass: "ali1234", role: "Администратор", isBlocked: false },
  { username: "SimpleUser", pass: "1234", role: "Пользователь", isBlocked: false }
];

let products = JSON.parse(localStorage.getItem("products")) || [];
let chats = JSON.parse(localStorage.getItem("chats")) || [];

let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
let activeChatPartner = null;

function saveUsers() { localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers)); }
function saveProducts() { localStorage.setItem("products", JSON.stringify(products)); }
function saveChats() { localStorage.setItem("chats", JSON.stringify(chats)); }
function saveCurrentUser() { 
  if (currentUser) {
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
  } else {
    localStorage.removeItem("currentUser");
  }
}

// ==========================================
// 2. DOM ELEMENTS
// ==========================================
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

const chatUsersList = document.getElementById("chatUsersList");
const chatHeader = document.getElementById("chatHeader");
const chatMessages = document.getElementById("chatMessages");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const sendMsgBtn = document.getElementById("sendMsgBtn");

// ==========================================
// 3. TAB SWITCHING WITH PERSISTENCE (F5 FIX)
// ==========================================

function switchTab(tabName) {
  [marketSection, addSection, profileSection, chatSection].forEach(s => s?.classList.remove("active"));
  [tabMarketBtn, tabAddBtn, tabProfileBtn, tabChatBtn].forEach(b => b?.classList.remove("active"));

  localStorage.setItem("activeTab", tabName);

  if (tabName === "add") {
    addSection?.classList.add("active");
    tabAddBtn?.classList.add("active");
  } else if (tabName === "profile") {
    profileSection?.classList.add("active");
    tabProfileBtn?.classList.add("active");
    renderProfile();
  } else if (tabName === "chat") {
    chatSection?.classList.add("active");
    tabChatBtn?.classList.add("active");
    renderChatList();
  } else {
    marketSection?.classList.add("active");
    tabMarketBtn?.classList.add("active");
    renderMarket();
  }
}

if (tabMarketBtn) tabMarketBtn.onclick = () => switchTab("market");
if (tabAddBtn) tabAddBtn.onclick = () => switchTab("add");
if (tabProfileBtn) tabProfileBtn.onclick = () => switchTab("profile");
if (tabChatBtn) tabChatBtn.onclick = () => switchTab("chat");

// ==========================================
// 4. INITIAL APP LOAD
// ==========================================

function initApp() {
  if (currentUser) {
    navUsername.textContent = currentUser.username;
    openAuthModalBtn.classList.add("hidden");
    logoutBtn.classList.remove("hidden");
  } else {
    navUsername.textContent = "Гость";
    openAuthModalBtn.classList.remove("hidden");
    logoutBtn.classList.add("hidden");
  }
  
  checkBlockedState();

  // Восстановление активной вкладки после обновления страницы (F5)
  const savedTab = localStorage.getItem("activeTab") || "market";
  switchTab(savedTab);
}

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
    saveCurrentUser();
    checkBlockedState();
    location.reload();
  };
}

if (shareSiteBtn) {
  shareSiteBtn.onclick = () => {
    const cleanUrl = window.location.origin + window.location.pathname;
    navigator.clipboard.writeText(cleanUrl);
    alert("Ссылка на сайт скопирована!\n" + cleanUrl);
  };
}

// Auth Modal Handlers
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

// Register
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
    saveUsers();

    alert(`Аккаунт успешно создан! Ваш ник: ${u}`);
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
      saveCurrentUser();
      checkBlockedState();
      
      if (currentUser.isBlocked) return;

      navUsername.textContent = currentUser.username;
      openAuthModalBtn.classList.add("hidden");
      logoutBtn.classList.remove("hidden");
      if (loginError) loginError.classList.add("hidden");
      authModal.style.display = "none";
      loginForm.reset();
      
      alert(`Добро пожаловать, ${currentUser.username}!`);
      
      const currentTab = localStorage.getItem("activeTab") || "market";
      switchTab(currentTab);
    } else {
      if (loginError) loginError.classList.remove("hidden");
    }
  };
}

// Logout
if (logoutBtn) {
  logoutBtn.onclick = () => {
    currentUser = null;
    saveCurrentUser();
    navUsername.textContent = "Гость";
    openAuthModalBtn.classList.remove("hidden");
    logoutBtn.classList.add("hidden");
    checkBlockedState();
    switchTab("market");
  };
}

// ==========================================
// 5. PRODUCTS (WITH PASSWORD PROTECTION)
// ==========================================

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
    const accessPass = document.getElementById("prodAccessPass") ? document.getElementById("prodAccessPass").value.trim() : "";

    const newProd = {
      id: Date.now(),
      seller: currentUser.username,
      title,
      type,
      img,
      desc,
      secretData,
      accessPass: accessPass // Пароль доступа к товару
    };

    products.unshift(newProd);
    saveProducts();

    alert("Товар успешно выставлен на продажу!");
    sellForm.reset();
    switchTab("market");
  };
}

function renderMarket() {
  if (!marketGrid) return;
  marketGrid.innerHTML = "";

  if (products.length === 0) {
    marketGrid.innerHTML = "<p style='color:#9ca3af; grid-column: 1/-1; text-align: center; padding: 40px;'>Товаров пока нет.</p>";
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
        <i class="fa-solid fa-trash"></i>
      </button>
    ` : '';

    let passInputHTML = p.accessPass ? `
      <div style="margin-bottom: 8px;">
        <input type="password" id="passInput_${p.id}" placeholder="Введите пароль товара" style="width:100%; padding: 6px; font-size:0.8rem; background:#0f172a; border:1px solid #334155; color:#fff; border-radius:4px;">
      </div>
    ` : '';

    card.innerHTML = `
      ${mediaHTML}
      <div class="card-body">
        <div>
          <div class="seller-info">
            <span><i class="fa-solid fa-user-tag"></i> ${p.seller}</span>
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
          ${passInputHTML}
          <button class="btn btn-primary btn-block" onclick="unlockProductDetails(${p.id})">Открыть товар</button>
          <div id="secretResult_${p.id}" class="hidden"></div>
        </div>
      </div>
    `;
    marketGrid.appendChild(card);
  });
}

// Unlock Product with Password
window.unlockProductDetails = function(id) {
  const prod = products.find(p => p.id === id);
  const resDiv = document.getElementById(`secretResult_${id}`);

  if (prod.accessPass) {
    const enteredPass = document.getElementById(`passInput_${id}`).value.trim();
    if (enteredPass !== prod.accessPass) {
      alert("Неверный пароль доступа к товару!");
      return;
    }
  }

  if (resDiv) {
    resDiv.className = "unlocked-data";
    resDiv.innerHTML = `<b>Секретные данные:</b><br>${prod.secretData}`;
    resDiv.classList.remove("hidden");
  }
};

window.deleteProduct = function(id) {
  if (confirm("Вы действительно хотите удалить этот товар?")) {
    products = products.filter(p => p.id !== id);
    saveProducts();
    alert("Товар удален!");
    renderMarket();
  }
};

// ==========================================
// 6. PROFILE & ADMIN PANEL
// ==========================================

function renderProfile() {
  const profName = document.getElementById("profName");
  const profRoleBadge = document.getElementById("profRoleBadge");

  if (!currentUser) {
    if (profName) profName.textContent = "Гость";
    if (profRoleBadge) {
      profRoleBadge.textContent = "Вы не авторизованы";
      profRoleBadge.className = "role-tag role-user";
    }
    adminPanel?.classList.add("hidden");
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

  if (currentUser.role === "Владелец сайта" || currentUser.role === "Администратор") {
    adminPanel?.classList.remove("hidden");
    renderAdminUserList();
  } else {
    adminPanel?.classList.add("hidden");
  }

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
            <p style="font-size:0.75rem; color:#f59e0b;">Пароль: ${p.accessPass || "Без пароля"}</p>
          </div>
        `;
        myProductsGrid.appendChild(card);
      });
    }
  }
}

function renderAdminUserList() {
  if (!userRolesList) return;
  userRolesList.innerHTML = "";
  const isOwner = currentUser.role === "Владелец сайта";

  registeredUsers.forEach(u => {
    if (u.username === currentUser.username) return;

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
      <div>
        <b>${u.username}</b> 
        <span class="role-tag ${roleBadgeClass}" style="margin-left: 6px;">${u.role}</span>
        ${u.isBlocked ? '<b style="color:#ef4444; font-size:0.8rem; margin-left:5px;">[ЗАБЛОКИРОВАН]</b>' : ''}
      </div>
      <div style="display:flex; gap:5px; align-items:center;">
        ${roleActionBtns}
        ${blockBtn}
      </div>
    `;
    userRolesList.appendChild(row);
  });
}

window.changeRole = function(username, newRole) {
  if (currentUser.role !== "Владелец сайта") {
    alert("Только Владелец сайта может назначать или снимать Администраторов!");
    return;
  }
  const targetUser = registeredUsers.find(u => u.username === username);
  if (targetUser) {
    targetUser.role = newRole;
    saveUsers();
    alert(`Пользователю ${username} присвоена роль: ${newRole}`);
    renderAdminUserList();
  }
};

window.toggleBlockUser = function(username) {
  const targetUser = registeredUsers.find(u => u.username === username);
  if (targetUser) {
    if (targetUser.role === "Владелец сайта") {
      alert("Нельзя заблокировать Владельца сайта!");
      return;
    }
    targetUser.isBlocked = !targetUser.isBlocked;
    saveUsers();
    alert(`Пользователь ${username} ${targetUser.isBlocked ? "заблокирован" : "разблокирован"}!`);
    renderAdminUserList();
  }
};

// ==========================================
// 7. CHAT SYSTEM
// ==========================================

window.openChatWithSeller = function(sellerName) {
  if (!currentUser) {
    alert("Для общения с продавцом необходимо авторизоваться!");
    authModal.style.display = "flex";
    return;
  }
  if (sellerName === currentUser.username) {
    alert("Вы не можете написать самому себе!");
    return;
  }

  switchTab("chat");
  selectChatPartner(sellerName);
};

function renderChatList() {
  if (!chatUsersList) return;
  chatUsersList.innerHTML = "";

  if (!currentUser) {
    chatUsersList.innerHTML = "<p style='color:#9ca3af; font-size:0.8rem;'>Войдите, чтобы пользоваться чатом.</p>";
    if (chatMessages) chatMessages.innerHTML = "<div class='empty-chat-msg'>Авторизуйтесь для доступа к сообщениям</div>";
    if (chatInput) chatInput.disabled = true;
    if (sendMsgBtn) sendMsgBtn.disabled = true;
    return;
  }

  const availableUsers = registeredUsers.filter(u => u.username !== currentUser.username);

  if (availableUsers.length === 0) {
    chatUsersList.innerHTML = "<p style='color:#9ca3af; font-size:0.8rem;'>Нет доступных пользователей.</p>";
    return;
  }

  availableUsers.forEach(u => {
    const btn = document.createElement("button");
    btn.className = `chat-user-btn ${activeChatPartner === u.username ? "active" : ""}`;
    btn.innerHTML = `<i class="fa-solid fa-user"></i> ${u.username}`;
    btn.onclick = () => selectChatPartner(u.username);
    chatUsersList.appendChild(btn);
  });
}

function selectChatPartner(partnerUsername) {
  activeChatPartner = partnerUsername;
  if (chatHeader) chatHeader.textContent = `Чат с: ${partnerUsername}`;
  
  if (chatInput) chatInput.disabled = false;
  if (sendMsgBtn) sendMsgBtn.disabled = false;
  
  renderChatList();
  renderMessages();
}

function renderMessages() {
  if (!chatMessages) return;
  chatMessages.innerHTML = "";

  if (!currentUser || !activeChatPartner) {
    chatMessages.innerHTML = "<div class='empty-chat-msg'>Выберите чат из списка</div>";
    return;
  }

  const conversation = chats.filter(m => 
    (m.sender === currentUser.username && m.receiver === activeChatPartner) ||
    (m.sender === activeChatPartner && m.receiver === currentUser.username)
  );

  if (conversation.length === 0) {
    chatMessages.innerHTML = "<div class='empty-chat-msg'>Сообщений пока нет. Напишите первым!</div>";
    return;
  }

  conversation.forEach(msg => {
    const bubble = document.createElement("div");
    const isMe = msg.sender === currentUser.username;
    
    bubble.className = `msg-bubble ${isMe ? "msg-me" : "msg-other"}`;
    bubble.textContent = msg.text;
    chatMessages.appendChild(bubble);
  });

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

if (chatForm) {
  chatForm.onsubmit = (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();

    if (!text || !currentUser || !activeChatPartner) return;

    chats.push({
      sender: currentUser.username,
      receiver: activeChatPartner,
      text: text
    });
    saveChats();

    chatInput.value = "";
    renderMessages();
  };
}

// Run
initApp();
