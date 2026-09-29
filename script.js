// Database Initialization
let registeredUsers = [
  { username: "KOROL_988", pass: "said9800", role: "Владелец сайта", isBlocked: false },
  { username: "Admin_Ali", pass: "ali1234", role: "Администратор", isBlocked: false },
  { username: "SimpleUser", pass: "1234", role: "Пользователь", isBlocked: false }
];

let currentUser = null;
let activeChatPartner = null;

// Test tovarlar olib tashlandi (Bo'sh massiv)
let products = [];

let chats = [
  { sender: "Admin_Ali", receiver: "KOROL_988", text: "Здравствуйте! У меня вопрос по поводу товара." },
  { sender: "KOROL_988", receiver: "Admin_Ali", text: "Приветствую! Задавайте, слушаю вас." }
];

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

// Copy Direct Clean URL
if (shareSiteBtn) {
  shareSiteBtn.onclick = () => {
    const cleanUrl = window.location.origin + window.location.pathname;
    navigator.clipboard.writeText(cleanUrl);
    alert("Ссылка на сайт скопирована!\n" + cleanUrl);
  };
}

// Blocked User Check
function checkBlockedState() {
  if (currentUser && currentUser.isBlocked) {
    blockedOverlay.classList.remove("hidden");
  } else {
    blockedOverlay.classList.add("hidden");
  }
}

if (blockedLogoutBtn) {
  blockedLogoutBtn.onclick = () => {
    currentUser = null;
    checkBlockedState();
    location.reload();
  };
}

// Tab Switching
function resetTabs() {
  [marketSection, addSection, profileSection, chatSection].forEach(s => s?.classList.remove("active"));
  [tabMarketBtn, tabAddBtn, tabProfileBtn, tabChatBtn].forEach(b => b?.classList.remove("active"));
}

if (tabMarketBtn) tabMarketBtn.onclick = () => { resetTabs(); marketSection.classList.add("active"); tabMarketBtn.classList.add("active"); renderMarket(); };
if (tabAddBtn) tabAddBtn.onclick = () => { resetTabs(); addSection.classList.add("active"); tabAddBtn.classList.add("active"); };
if (tabProfileBtn) tabProfileBtn.onclick = () => { resetTabs(); profileSection.classList.add("active"); tabProfileBtn.classList.add("active"); renderProfile(); };
if (tabChatBtn) tabChatBtn.onclick = () => { resetTabs(); chatSection.classList.add("active"); tabChatBtn.classList.add("active"); renderChatList(); };

// Auth Modal Controls
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

// Register Handle
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

    registeredUsers.push({ username: u, pass: p, role: "Пользователь", isBlocked: false });
    alert(`Аккаунт успешно создан! Ваш ник: ${u}`);
    registerForm.reset();
    showLoginBtn.click();
  };
}

// Login Handle
if (loginForm) {
  loginForm.onsubmit = (e) => {
    e.preventDefault();
    const u = document.getElementById("loginUser").value.trim();
    const p = document.getElementById("loginPass").value.trim();

    const userFound = registeredUsers.find(user => user.username === u && user.pass === p);

    if (userFound) {
      currentUser = userFound;
      checkBlockedState();
      
      if (currentUser.isBlocked) return;

      navUsername.textContent = currentUser.username;
      openAuthModalBtn.classList.add("hidden");
      logoutBtn.classList.remove("hidden");
      if (loginError) loginError.classList.add("hidden");
      authModal.style.display = "none";
      loginForm.reset();
      
      alert(`Добро пожаловать, ${currentUser.username}! Вы вошли как (${currentUser.role})`);
      renderMarket();
    } else {
      if (loginError) loginError.classList.remove("hidden");
    }
  };
}

// Logout
if (logoutBtn) {
  logoutBtn.onclick = () => {
    currentUser = null;
    navUsername.textContent = "Гость";
    openAuthModalBtn.classList.remove("hidden");
    logoutBtn.classList.add("hidden");
    checkBlockedState();
    renderMarket();
  };
}

// Add Product Handle
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
    alert("Товар успешно выставлен на продажу!");
    sellForm.reset();
    tabMarketBtn.click();
  };
}

// Render Market
function renderMarket() {
  if (!marketGrid) return;
  marketGrid.innerHTML = "";

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

// Delete Product Function
window.deleteProduct = function(id) {
  if (confirm("Вы действительно хотите удалить этот товар?")) {
    products = products.filter(p => p.id !== id);
    alert("Товар успешно удален!");
    renderMarket();
  }
};

// Unlock Secret Content
window.unlockSecret = function(id) {
  const prod = products.find(p => p.id === id);
  const inputEl = document.getElementById(`passInput_${id}`);
  const resDiv = document.getElementById(`secretResult_${id}`);

  if (inputEl.value.trim() === prod.passKey) {
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
    adminPanel.classList.add("hidden");
    myProductsGrid.innerHTML = "<p style='color:#9ca3af;'>Вы не вошли в систему.</p>";
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
    adminPanel.classList.remove("hidden");
    renderAdminUserList();
  } else {
    adminPanel.classList.add("hidden");
  }

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

// Render Admin Management List
function renderAdminUserList() {
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

// Change Role (Owner Only)
window.changeRole = function(username, newRole) {
  if (currentUser.role !== "Владелец сайта") {
    alert("Только Владелец сайта может назначать или снимать Администраторов!");
    return;
  }
  const targetUser = registeredUsers.find(u => u.username === username);
  if (targetUser) {
    targetUser.role = newRole;
    alert(`Пользователю ${username} присвоена роль: ${newRole}`);
    renderProfile();
  }
};

// Block / Unblock User
window.toggleBlockUser = function(username) {
  const targetUser = registeredUsers.find(u => u.username === username);
  if (targetUser) {
    if (targetUser.role === "Владелец сайта") {
      alert("Нельзя заблокировать Владельца сайта!");
      return;
    }
    targetUser.isBlocked = !targetUser.isBlocked;
    alert(`Пользователь ${username} ${targetUser.isBlocked ? "заблокирован" : "разблокирован"}!`);
    renderProfile();
  }
};

// Open Direct Chat
window.openChatWithSeller = function(sellerName) {
  if (!currentUser) {
    alert("Для использования чата войдите в аккаунт!");
    authModal.style.display = "flex";
    return;
  }
  if (sellerName === currentUser.username) {
    alert("Вы не можете писать самому себе!");
    return;
  }
  activeChatPartner = sellerName;
  tabChatBtn.click();
  renderChatList();
  loadChatMessages();
};

function renderChatList() {
  const chatUsersList = document.getElementById("chatUsersList");
  if (!chatUsersList) return;
  chatUsersList.innerHTML = "";

  const partners = registeredUsers.filter(u => currentUser && u.username !== currentUser.username);
  partners.forEach(p => {
    const btn = document.createElement("button");
    btn.className = `chat-user-btn ${activeChatPartner === p.username ? 'active' : ''}`;
    btn.innerHTML = `<i class="fa-solid fa-user"></i> ${p.username}`;
    btn.onclick = () => {
      activeChatPartner = p.username;
      renderChatList();
      loadChatMessages();
    };
    chatUsersList.appendChild(btn);
  });
}

function loadChatMessages() {
  const chatHeader = document.getElementById("chatHeader");
  const chatMessages = document.getElementById("chatMessages");
  const chatInput = document.getElementById("chatInput");
  const sendMsgBtn = document.getElementById("sendMsgBtn");

  if (!activeChatPartner) return;

  chatHeader.textContent = `Собеседник: ${activeChatPartner}`;
  chatInput.disabled = false;
  sendMsgBtn.disabled = false;

  const activeMessages = chats.filter(m => 
    (m.sender === currentUser.username && m.receiver === activeChatPartner) ||
    (m.sender === activeChatPartner && m.receiver === currentUser.username)
  );

  chatMessages.innerHTML = "";
  if (activeMessages.length === 0) {
    chatMessages.innerHTML = `<div class="empty-chat-msg">Сообщений нет. Напишите первым!</div>`;
    return;
  }

  activeMessages.forEach(m => {
    const msgDiv = document.createElement("div");
    msgDiv.className = `msg-bubble ${m.sender === currentUser.username ? 'msg-me' : 'msg-other'}`;
    msgDiv.textContent = m.text;
    chatMessages.appendChild(msgDiv);
  });
}

const chatForm = document.getElementById("chatForm");
if (chatForm) {
  chatForm.onsubmit = (e) => {
    e.preventDefault();
    const chatInput = document.getElementById("chatInput");
    const txt = chatInput.value.trim();

    if (txt && activeChatPartner && currentUser) {
      chats.push({ sender: currentUser.username, receiver: activeChatPartner, text: txt });
      chatInput.value = "";
      loadChatMessages();
    }
  };
}

// Initial Run
renderMarket();
