// Sayt bazasi (Siz avtomatik Sayt Egasiz)
let defaultUsers = [
  { username: 'KOROL_988', pass: 'said9800', role: 'owner', coins: 10000 }
];

let users = JSON.parse(localStorage.getItem('users_db'));
if (!users || users.length === 0) {
  users = defaultUsers;
  localStorage.setItem('users_db', JSON.stringify(users));
}

let products = JSON.parse(localStorage.getItem('products_db')) || [];
let activeUser = localStorage.getItem('active_username') || 'KOROL_988'; // Avtomatik sizning akkaunt kirgan bo'ladi
let currentUser = null;

// Saqlash mexanizmi
function saveData() {
  localStorage.setItem('users_db', JSON.stringify(users));
  localStorage.setItem('products_db', JSON.stringify(products));
  if (currentUser) {
    localStorage.setItem('active_username', currentUser.username);
  } else {
    localStorage.removeItem('active_username');
  }
}

// Sahifa yuklanganda ishga tushish
document.addEventListener('DOMContentLoaded', () => {
  if (activeUser) {
    currentUser = users.find(u => u.username === activeUser) || users[0];
  }
  
  initUI();
  setupTabs();
  setupAuth();
  setupProductForm();
  renderProducts();
});

function initUI() {
  if (currentUser) {
    document.getElementById('navUsername').innerHTML = `<i class="fa-solid fa-circle-user"></i> ${currentUser.username}`;
    document.getElementById('openAuthModalBtn').classList.add('hidden');
    document.getElementById('logoutBtn').classList.remove('hidden');
    
    document.getElementById('navCoins').classList.remove('hidden');
    document.getElementById('userCoinsCount').innerText = currentUser.coins || 0;

    document.getElementById('profName').innerText = currentUser.username + (currentUser.role === 'owner' ? " (Sayt Egasi)" : "");
    document.getElementById('profBalance').innerText = currentUser.coins || 0;

    renderAdminPanel();
  } else {
    document.getElementById('navUsername').innerHTML = `<i class="fa-solid fa-circle-user"></i> Mehmonda`;
    document.getElementById('openAuthModalBtn').classList.remove('hidden');
    document.getElementById('logoutBtn').classList.add('hidden');
    document.getElementById('navCoins').classList.add('hidden');
    document.getElementById('adminPanel').classList.add('hidden');
  }
}

// Tablar o'rtasida o'tish
function setupTabs() {
  const tabs = [
    { btn: 'tabMarketBtn', sec: 'marketSection' },
    { btn: 'tabKeysBtn', sec: 'keysSection' },
    { btn: 'tabAddBtn', sec: 'addSection' },
    { btn: 'tabProfileBtn', sec: 'profileSection' }
  ];

  tabs.forEach(t => {
    document.getElementById(t.btn).addEventListener('click', () => {
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      
      document.getElementById(t.btn).classList.add('active');
      document.getElementById(t.sec).classList.add('active');
    });
  });
}

// Kirish va Registratsiya
function setupAuth() {
  const modal = document.getElementById('authModal');
  const openBtn = document.getElementById('openAuthModalBtn');
  const closeBtn = document.getElementById('closeAuthModal');
  
  const showLoginBtn = document.getElementById('showLoginBtn');
  const showRegisterBtn = document.getElementById('showRegisterBtn');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  openBtn.onclick = () => modal.style.display = 'flex';
  closeBtn.onclick = () => modal.style.display = 'none';

  // Registratsiya tugmasini bosganda almashtirish
  showRegisterBtn.onclick = () => {
    showRegisterBtn.classList.add('active');
    showLoginBtn.classList.remove('active');
    registerForm.classList.add('active');
    loginForm.classList.remove('active');
  };

  showLoginBtn.onclick = () => {
    showLoginBtn.classList.add('active');
    showRegisterBtn.classList.remove('active');
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
  };

  // Login qilish
  loginForm.onsubmit = (e) => {
    e.preventDefault();
    const u = document.getElementById('loginUser').value.trim();
    const p = document.getElementById('loginPass').value.trim();

    const user = users.find(x => x.username === u && x.pass === p);
    if (user) {
      currentUser = user;
      saveData();
      modal.style.display = 'none';
      initUI();
      renderProducts();
    } else {
      alert('Login yoki parol xato!');
    }
  };

  // Registratsiya qilish
  registerForm.onsubmit = (e) => {
    e.preventDefault();
    const u = document.getElementById('regUser').value.trim();
    const p = document.getElementById('regPass').value.trim();

    if (users.some(x => x.username === u)) {
      return alert('Bunday login allaqachon mavjud!');
    }

    const newUser = { username: u, pass: p, role: 'user', coins: 0 };
    users.push(newUser);
    currentUser = newUser;
    saveData();
    modal.style.display = 'none';
    initUI();
    renderProducts();
    alert('Muvaffaqiyatli ro‘yxatdan o‘tdingiz!');
  };

  // Chiqish
  document.getElementById('logoutBtn').onclick = () => {
    currentUser = null;
    saveData();
    initUI();
    renderProducts();
  };
}

// E'lon yaratish
function setupProductForm() {
  const categorySelect = document.getElementById('prodCategory');
  categorySelect.addEventListener('change', () => {
    if (categorySelect.value === 'key') {
      document.getElementById('priceGroup').classList.remove('hidden');
      document.getElementById('passGroup').classList.add('hidden');
    } else {
      document.getElementById('priceGroup').classList.add('hidden');
      document.getElementById('passGroup').classList.remove('hidden');
    }
  });

  document.getElementById('sellForm').onsubmit = (e) => {
    e.preventDefault();
    if (!currentUser) return alert('Avval akkauntga kiring!');

    const newProd = {
      id: Date.now(),
      seller: currentUser.username,
      category: document.getElementById('prodCategory').value,
      title: document.getElementById('prodTitle').value,
      price: parseInt(document.getElementById('prodPrice').value) || 0,
      img: document.getElementById('prodImgUrl').value || 'https://via.placeholder.com/300x180?text=Mahsulot',
      desc: document.getElementById('prodDesc').value,
      secret: document.getElementById('prodSecretData').value,
      pass: document.getElementById('prodSecretPassword').value,
      buyers: []
    };

    products.push(newProd);
    saveData();
    alert('Eʼlon qo‘shildi!');
    renderProducts();
    document.getElementById('sellForm').reset();
  };
}

// Mahsulot va kalitlarni chiqarish
function renderProducts() {
  const marketGrid = document.getElementById('marketGrid');
  const keysGrid = document.getElementById('keysGrid');
  const myProductsGrid = document.getElementById('myProductsGrid');

  marketGrid.innerHTML = '';
  keysGrid.innerHTML = '';
  myProductsGrid.innerHTML = '';

  products.forEach(p => {
    const isOwner = currentUser && (currentUser.username === p.seller || currentUser.role === 'owner');
    const hasBought = currentUser && p.buyers && p.buyers.includes(currentUser.username);

    let cardHtml = `
      <div class="card">
        <img src="${p.img}" alt="img">
        <div class="card-body">
          <div class="seller-info">Sotuvchi: <b>${p.seller}</b></div>
          <h3>${p.title}</h3>
          <p>${p.desc}</p>
    `;

    if (p.category === 'key') {
      cardHtml += `<div class="key-price"><i class="fa-solid fa-coins"></i> Narxi: ${p.price} Koin</div>`;

      if (hasBought || isOwner) {
        cardHtml += `<div class="unlocked-data"><b>Kalit:</b> ${p.secret}</div>`;
      } else {
        cardHtml += `<button onclick="buyKey(${p.id})" class="btn btn-warning btn-block"><i class="fa-solid fa-key"></i> Sotib olish</button>`;
      }
    } else {
      cardHtml += `
        <div class="access-zone">
          <input type="password" id="pass_${p.id}" placeholder="Parolni kiriting" style="width:100%; margin-bottom:5px; padding:5px;">
          <button onclick="unlockProduct(${p.id})" class="btn btn-primary btn-block">Ochish</button>
          <div id="secret_${p.id}" class="unlocked-data hidden"></div>
        </div>
      `;
    }

    cardHtml += `</div></div>`;

    if (p.category === 'key') {
      keysGrid.innerHTML += cardHtml;
    } else {
      marketGrid.innerHTML += cardHtml;
    }

    if (currentUser && p.seller === currentUser.username) {
      myProductsGrid.innerHTML += cardHtml;
    }
  });
}

// Kalit sotib olish
window.buyKey = function(prodId) {
  if (!currentUser) return alert('Avval akkauntga kiring!');

  const prod = products.find(p => p.id === prodId);
  if (!prod) return;

  if (currentUser.coins < prod.price) {
    return alert('Koiningiz yetarli emas!');
  }

  currentUser.coins -= prod.price;

  const seller = users.find(u => u.username === prod.seller);
  if (seller) {
    seller.coins = (seller.coins || 0) + prod.price;
  }

  if (!prod.buyers) prod.buyers = [];
  prod.buyers.push(currentUser.username);

  saveData();
  initUI();
  renderProducts();
  alert('Kalit xarid qilindi!');
};

// Oddiy maxsulotni ochish
window.unlockProduct = function(prodId) {
  const inputPass = document.getElementById(`pass_${prodId}`).value;
  const prod = products.find(p => p.id === prodId);

  if (inputPass === prod.pass) {
    const secretBox = document.getElementById(`secret_${prodId}`);
    secretBox.innerHTML = `<b>Ma'lumot:</b> ${prod.secret}`;
    secretBox.classList.remove('hidden');
  } else {
    alert('Parol xato!');
  }
};

// Sayt Egasi uchun Admin Panel (Koin Berish)
function renderAdminPanel() {
  const adminPanel = document.getElementById('adminPanel');
  const userRolesList = document.getElementById('userRolesList');

  if (currentUser && currentUser.role === 'owner') {
    adminPanel.classList.remove('hidden');
    userRolesList.innerHTML = '';

    users.forEach(u => {
      if (u.username === currentUser.username) return;

      userRolesList.innerHTML += `
        <div class="user-role-row">
          <span><b>${u.username}</b> (${u.coins || 0} koin)</span>
          <button onclick="addCoins('${u.username}')" class="btn btn-warning" style="padding:4px 8px; font-size:0.75rem;">+ Koin berish</button>
        </div>
      `;
    });
  } else {
    adminPanel.classList.add('hidden');
  }
}

// Koin berish funksiyasi
window.addCoins = function(username) {
  const amount = prompt(`${username} ga qancha Koin bermoqchisiz?`);
  if (amount && !isNaN(amount)) {
    const user = users.find(u => u.username === username);
    if (user) {
      user.coins = (user.coins || 0) + parseInt(amount);
      saveData();
      renderAdminPanel();
      initUI();
      alert('Koin taqdim etildi!');
    }
  }
};
