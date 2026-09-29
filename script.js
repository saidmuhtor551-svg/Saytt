document.addEventListener('DOMContentLoaded', () => {
  // === STATE & STORAGE ===
  let currentUser = JSON.parse(localStorage.getItem('mp_current_user')) || null;
  let products = JSON.parse(localStorage.getItem('mp_products')) || [];
  let users = JSON.parse(localStorage.getItem('mp_users')) || [];

  // DOM Elements
  const tabBtns = {
    marketSection: document.getElementById('tabMarketBtn'),
    addSection: document.getElementById('tabAddBtn'),
    chatSection: document.getElementById('tabChatBtn'),
    profileSection: document.getElementById('tabProfileBtn')
  };

  const tabSections = {
    marketSection: document.getElementById('marketSection'),
    addSection: document.getElementById('addSection'),
    chatSection: document.getElementById('chatSection'),
    profileSection: document.getElementById('profileSection')
  };

  // === 1. TAB/PAGINATION FIX (Obnovit qilganda o'sha tabda qolish) ===
  function switchTab(targetTabId) {
    Object.keys(tabSections).forEach(id => {
      if (tabSections[id]) tabSections[id].classList.remove('active');
      if (tabBtns[id]) tabBtns[id].classList.remove('active');
    });

    if (tabSections[targetTabId]) tabSections[targetTabId].classList.add('active');
    if (tabBtns[targetTabId]) tabBtns[targetTabId].classList.add('active');

    // Joriy tabni saqlash
    localStorage.setItem('mp_active_tab', targetTabId);
  }

  // Event listenerlarni ulash
  Object.keys(tabBtns).forEach(tabId => {
    if (tabBtns[tabId]) {
      tabBtns[tabId].addEventListener('click', () => switchTab(tabId));
    }
  });

  // Sahifa yangilanganda saqlangan tabni ochish
  const savedTab = localStorage.getItem('mp_active_tab') || 'marketSection';
  switchTab(savedTab);

  // === 2. AUTHENTICATION (KIRISH / RO'YXATDAN O'TISH) ===
  const authModal = document.getElementById('authModal');
  const openAuthModalBtn = document.getElementById('openAuthModalBtn');
  const closeAuthModal = document.getElementById('closeAuthModal');
  const logoutBtn = document.getElementById('logoutBtn');
  const navUsername = document.getElementById('navUsername');

  if (openAuthModalBtn) openAuthModalBtn.addEventListener('click', () => authModal.style.display = 'flex');
  if (closeAuthModal) closeAuthModal.addEventListener('click', () => authModal.style.display = 'none');

  // Auth Tab Switch
  const showLoginBtn = document.getElementById('showLoginBtn');
  const showRegisterBtn = document.getElementById('showRegisterBtn');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  if (showLoginBtn && showRegisterBtn) {
    showLoginBtn.addEventListener('click', () => {
      showLoginBtn.classList.add('active');
      showRegisterBtn.classList.remove('active');
      loginForm.classList.add('active');
      registerForm.classList.remove('active');
    });

    showRegisterBtn.addEventListener('click', () => {
      showRegisterBtn.classList.add('active');
      showLoginBtn.classList.remove('active');
      registerForm.classList.add('active');
      loginForm.classList.remove('active');
    });
  }

  // Register
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const rawUser = document.getElementById('regUser').value.trim();
      const preset = document.getElementById('presetNick').value;
      const pass = document.getElementById('regPass').value;

      const username = rawUser + preset;

      if (users.some(u => u.username === username)) {
        alert('Bunday foydalanuvchi mavjud!');
        return;
      }

      const newUser = {
        username,
        password: pass,
        role: users.length === 0 ? 'admin' : 'user' // Birinchi odam admin bo'ladi
      };

      users.push(newUser);
      localStorage.setItem('mp_users', JSON.stringify(users));

      currentUser = newUser;
      localStorage.setItem('mp_current_user', JSON.stringify(currentUser));

      authModal.style.display = 'none';
      updateUI();
    });
  }

  // Login
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const userVal = document.getElementById('loginUser').value.trim();
      const passVal = document.getElementById('loginPass').value;

      const foundUser = users.find(u => u.username === userVal && u.password === passVal);

      if (foundUser) {
        currentUser = foundUser;
        localStorage.setItem('mp_current_user', JSON.stringify(currentUser));
        authModal.style.display = 'none';
        updateUI();
      } else {
        document.getElementById('loginError').classList.remove('hidden');
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      currentUser = null;
      localStorage.removeItem('mp_current_user');
      updateUI();
    });
  }

  // UI statusini yangilash
  function updateUI() {
    if (currentUser) {
      if (navUsername) navUsername.textContent = currentUser.username;
      if (openAuthModalBtn) openAuthModalBtn.classList.add('hidden');
      if (logoutBtn) logoutBtn.classList.remove('hidden');
      
      const profName = document.getElementById('profName');
      const profRoleBadge = document.getElementById('profRoleBadge');
      if (profName) profName.textContent = currentUser.username;
      if (profRoleBadge) profRoleBadge.textContent = currentUser.role === 'admin' ? 'Администратор' : 'Пользователь';

      // Admin panel
      const adminPanel = document.getElementById('adminPanel');
      if (adminPanel) {
        if (currentUser.role === 'admin') {
          adminPanel.classList.remove('hidden');
          renderAdminUsers();
        } else {
          adminPanel.classList.add('hidden');
        }
      }
    } else {
      if (navUsername) navUsername.textContent = 'Гость';
      if (openAuthModalBtn) openAuthModalBtn.classList.remove('hidden');
      if (logoutBtn) logoutBtn.classList.add('hidden');
      const adminPanel = document.getElementById('adminPanel');
      if (adminPanel) adminPanel.classList.add('hidden');
    }
    renderProducts();
  }

  // === 3. SOTISH VA PAROL (PRODAT) ===
  const sellForm = document.getElementById('sellForm');
  if (sellForm) {
    sellForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!currentUser) {
        alert('Avval hisobingizga kiring!');
        return;
      }

      const newProd = {
        id: Date.now(),
        title: document.getElementById('prodTitle').value,
        type: document.getElementById('prodType').value,
        imgUrl: document.getElementById('prodImgUrl').value || 'https://via.placeholder.com/150',
        desc: document.getElementById('prodDesc').value,
        secretData: document.getElementById('prodSecretData').value,
        accessPass: document.getElementById('prodAccessPass').value.trim(), // PAROL
        owner: currentUser.username
      };

      products.push(newProd);
      localStorage.setItem('mp_products', JSON.stringify(products));
      sellForm.reset();
      alert('Tavar muvaffaqiyatli qo\'shildi!');
      switchTab('marketSection');
    });
  }

  // === 4. TAVARLARNI RENDER QILISH VA PAROL SO'RASH ===
  function renderProducts() {
    const marketGrid = document.getElementById('marketGrid');
    if (!marketGrid) return;

    marketGrid.innerHTML = '';

    products.forEach(p => {
      const card = document.createElement('div');
      card.className = 'card-item';
      card.innerHTML = `
        ${p.type === 'image' ? `<img src="${p.imgUrl}" alt="${p.title}">` : ''}
        <h3>${p.title}</h3>
        <p>${p.desc}</p>
        <p><small>Sotuvchi: ${p.owner}</small></p>
        <button class="btn btn-primary btn-block open-prod-btn" data-id="${p.id}">Открыть секрет</button>
      `;
      marketGrid.appendChild(card);
    });

    // Kod/Parol bilan ochish
    document.querySelectorAll('.open-prod-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const prodId = Number(e.target.dataset.id);
        const prod = products.find(p => p.id === prodId);

        if (prod) {
          if (prod.accessPass) {
            const userPass = prompt('Bu tavar uchun parolni kiriting:');
            if (userPass !== prod.accessPass) {
              alert('Noto\'g\'ri parol!');
              return;
            }
          }
          alert(`Секретные данные:\n${prod.secretData}`);
        }
      });
    });
  }

  // === 5. ADMIN PANEL ===
  function renderAdminUsers() {
    const userRolesList = document.getElementById('userRolesList');
    if (!userRolesList) return;

    userRolesList.innerHTML = '';
    users.forEach(u => {
      const item = document.createElement('div');
      item.style.padding = '5px 0';
      item.innerHTML = `<strong>${u.username}</strong> — <i>${u.role}</i>`;
      userRolesList.appendChild(item);
    });
  }

  // Dastlabki ishga tushirish
  updateUI();
});
