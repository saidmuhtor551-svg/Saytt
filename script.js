document.addEventListener('DOMContentLoaded', () => {
  // === SAQLANGAN MA'LUMOTLAR ===
  let currentUser = JSON.parse(localStorage.getItem('mp_current_user')) || null;
  let products = JSON.parse(localStorage.getItem('mp_products')) || [];
  let users = JSON.parse(localStorage.getItem('mp_users')) || [];

  // Tab tugmalari va bo'limlar
  const tabs = {
    tabMarketBtn: 'marketSection',
    tabAddBtn: 'addSection',
    tabChatBtn: 'chatSection',
    tabProfileBtn: 'profileSection'
  };

  // === 1. OBNOVIT DANGI TABNI SAQLASH (TAB SWITCHING) ===
  function activateTab(sectionId) {
    // Barcha bo'limlarni va tugmalarni nofaol qilish
    document.querySelectorAll('.tab-content').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.bottom-nav .nav-item').forEach(b => b.classList.remove('active'));

    // Kerakli bo'limni ochish
    const targetSection = document.getElementById(sectionId);
    if (targetSection) targetSection.classList.add('active');

    // Kerakli tugmani belgilash
    Object.keys(tabs).forEach(btnId => {
      if (tabs[btnId] === sectionId) {
        const btn = document.getElementById(btnId);
        if (btn) btn.classList.add('active');
      }
    });

    // Brauzer xotirasiga saqlash
    localStorage.setItem('mp_active_tab', sectionId);
  }

  // Tugmalarga hodisa biriktirish
  Object.keys(tabs).forEach(btnId => {
    const btn = document.getElementById(btnId);
    if (btn) {
      btn.addEventListener('click', () => activateTab(tabs[btnId]));
    }
  });

  // Sahifa yuklanganda saqlangan tabni ochish
  const savedTab = localStorage.getItem('mp_active_tab') || 'marketSection';
  activateTab(savedTab);

  // === 2. AUTHENTICATION (KIRISH / RO'YXATDAN O'TISH) ===
  const authModal = document.getElementById('authModal');
  const openAuthModalBtn = document.getElementById('openAuthModalBtn');
  const closeAuthModal = document.getElementById('closeAuthModal');
  const logoutBtn = document.getElementById('logoutBtn');
  const navUsername = document.getElementById('navUsername');

  if (openAuthModalBtn) openAuthModalBtn.addEventListener('click', () => authModal.style.display = 'flex');
  if (closeAuthModal) closeAuthModal.addEventListener('click', () => authModal.style.display = 'none');

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

  // Ro'yxatdan o'tish
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const rawUser = document.getElementById('regUser').value.trim();
      const preset = document.getElementById('presetNick').value;
      const pass = document.getElementById('regPass').value;

      const username = rawUser + preset;

      if (users.some(u => u.username === username)) {
        alert('Bunday nikneym band!');
        return;
      }

      const newUser = {
        username,
        password: pass,
        role: users.length === 0 ? 'admin' : 'user'
      };

      users.push(newUser);
      localStorage.setItem('mp_users', JSON.stringify(users));

      currentUser = newUser;
      localStorage.setItem('mp_current_user', JSON.stringify(currentUser));

      authModal.style.display = 'none';
      updateUI();
    });
  }

  // Kirish
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
        const err = document.getElementById('loginError');
        if (err) err.classList.remove('hidden');
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

  // === 3. SOTISH (PRODAT) VA PAROL ===
  const sellForm = document.getElementById('sellForm');
  if (sellForm) {
    sellForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!currentUser) {
        alert('Tavar sotish uchun avval tizimga kiring!');
        return;
      }

      const passInput = document.getElementById('prodAccessPass');

      const newProd = {
        id: Date.now(),
        title: document.getElementById('prodTitle').value,
        type: document.getElementById('prodType').value,
        imgUrl: document.getElementById('prodImgUrl').value || 'https://via.placeholder.com/150',
        desc: document.getElementById('prodDesc').value,
        secretData: document.getElementById('prodSecretData').value,
        accessPass: passInput ? passInput.value.trim() : '',
        owner: currentUser.username
      };

      products.push(newProd);
      localStorage.setItem('mp_products', JSON.stringify(products));
      sellForm.reset();
      alert('Tavar joylandi!');
      activateTab('marketSection');
    });
  }

  // === 4. TAVARLARNI CHIQARISH VA PAROL BN OCHISH ===
  function renderProducts() {
    const marketGrid = document.getElementById('marketGrid');
    if (!marketGrid) return;

    if (products.length === 0) {
      marketGrid.innerHTML = '<p class="empty-text">Товаров пока нет.</p>';
      return;
    }

    marketGrid.innerHTML = '';
    products.forEach(p => {
      const card = document.createElement('div');
      card.className = 'card-form';
      card.style.maxWidth = '100%';
      card.innerHTML = `
        ${p.type === 'image' && p.imgUrl ? `<img src="${p.imgUrl}" style="width:100%; height:140px; object-fit:cover; border-radius:6px;">` : ''}
        <h3>${p.title}</h3>
        <p style="color:#a0aec0; font-size:0.9rem;">${p.desc}</p>
        <p style="font-size:0.8rem; color:#6b7280;">Продавец: ${p.owner}</p>
        <button class="btn btn-primary btn-block open-prod-btn" data-id="${p.id}">Открыть секрет</button>
      `;
      marketGrid.appendChild(card);
    });

    document.querySelectorAll('.open-prod-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const prodId = Number(e.target.dataset.id);
        const prod = products.find(p => p.id === prodId);

        if (prod) {
          if (prod.accessPass) {
            const userPass = prompt('Введите пароль для доступа к товару:');
            if (userPass !== prod.accessPass) {
              alert('Неверный пароль!');
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
      item.style.padding = '6px 0';
      item.style.borderBottom = '1px solid #2a354d';
      item.innerHTML = `<span>${u.username}</span> — <strong style="color:#2563eb;">${u.role}</strong>`;
      userRolesList.appendChild(item);
    });
  }

  // Dastlabki ishga tushirish
  updateUI();
});
