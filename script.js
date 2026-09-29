// Baza ma'lumotlari
let users = JSON.parse(localStorage.getItem('users_db')) || [
  { username: 'owner', pass: 'owner123', role: 'owner', coins: 5000 }
];

let products = JSON.parse(localStorage.getItem('products_db')) || [];
let activeUser = localStorage.getItem('active_username') || null;
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
    currentUser = users.find(u => u.username === activeUser) || null;
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

    document.getElementById('profName').innerText = currentUser.username;
    document.getElementById('profBalance').innerText = currentUser.coins || 0;

    // Admin/Owner panelini chiqarish
    renderAdminPanel();
  } else {
    document.getElementById('navUsername').innerHTML = `<i class="fa-solid fa-circle-user"></i> Гость`;
    document.getElementById('openAuthModalBtn').classList.remove('hidden');
    document.getElementById('logoutBtn').classList.add('hidden');
    document.getElementById('navCoins').classList.add('hidden');
    document.getElementById('adminPanel').classList.add('hidden');
  }
}

// Tablar aralashuvi
function setupTabs() {
  const tabs = {
    tabMarketBtn: 'marketSection',
    tabKeysBtn: 'keysSection',
    tabAddBtn: 'addSection',
    tabProfileBtn: 'profileSection'
  };

  Object.keys(tabs).forEach(btnId => {
    document.getElementById(btnId).addEventListener('click', () => {
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      
      document.getElementById(btnId).classList.add('active');
      document.getElementById(tabs[btnId]).classList.add('active');
    });
  });
}

// Auth modal
function setupAuth() {
  const modal = document.getElementById('authModal');
  document.getElementById('openAuthModalBtn').onclick = () => modal.style.display = 'flex';
  document.getElementById('closeAuthModal').onclick = () => modal.style.display = 'none';

  document.getElementById('showLoginBtn').onclick = () => {
    document.getElementById('showLoginBtn').classList.add('active');
    document.getElementById('showRegisterBtn').classList.remove('active');
    document.getElementById('loginForm').classList.add('active');
    document.getElementById('registerForm').classList.remove('active');
  };

  document.getElementById('showRegisterBtn').onclick = () => {
    document.getElementById('showRegisterBtn').classList.add('active');
    document.getElementById('showLoginBtn').classList.remove('active');
    document.getElementById('registerForm').classList.add('active');
    document.getElementById('loginForm').classList.remove('active');
  };

  // Login
  document.getElementById('loginForm').onsubmit = (e) => {
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

  // Register
  document.getElementById('registerForm').onsubmit = (e) => {
    e.preventDefault();
    const u = document.getElementById('regUser').value.trim();
    const p = document.getElementById('regPass').value.trim();

    if (users.some(x => x.username === u)) {
      return alert('Bunday foydalanuvchi bor!');
    }

    const newUser = { username: u, pass: p, role: 'user', coins: 0 };
    users.push(newUser);
    currentUser = newUser;
    saveData();
    modal.style.display = 'none';
    initUI();
    renderProducts();
  };

  // Logout
  document.getElementById('logoutBtn').onclick = () => {
    currentUser = null;
    saveData();
    initUI();
    renderProducts();
  };
}

// Tovar/Kalit qo'shish
function setupProductForm() {
  const categorySelect = document.getElementById('prodCategory');
  categorySelect.addEventListener('change', () => {
    if (categorySelect.value === 'key') {
      document.getElementById('priceGroup').style.display = 'block';
      document.getElementById('passGroup').style.display = 'none';
    } else {
      document.getElementById('priceGroup').style.display = 'none';
      document.getElementById('passGroup').style.display = 'block';
    }
  });

  document.getElementById('sellForm').onsubmit = (e) => {
    e.preventDefault();
    if (!currentUser) return alert('Avval tizimga kiring!');

    const newProd = {
      id: Date.now(),
      seller: currentUser.username,
      category: document.getElementById('prodCategory').value,
      title: document.getElementById('prodTitle').value,
      price: parseInt(document.getElementById('prodPrice').value) || 0,
      img: document.getElementById('prodImgUrl').value || 'https://via.placeholder.com/300x180',
      desc: document.getElementById('prodDesc').value,
      secret: document.getElementById('prodSecretData').value,
      pass: document.getElementById('prodSecretPassword').value,
      buyers: []
    };

    products.push(newProd);
    saveData();
    alert('Eʼlon qilindi!');
    renderProducts();
    document.getElementById('sellForm').reset();
  };
}

// Kalitlarni va Tovarlarni chiqarish
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

    // KALITLAR MARKЕTI
    if (p.category === 'key') {
      cardHtml += `<div class="key-price"><i class="fa-solid fa-coins"></i> Narxi: ${p.price} Koin</div>`;

      if (hasBought || isOwner) {
        cardHtml += `<div class="unlocked-data"><b>Kalit:</b> ${p.secret}</div>`;
      } else {
        cardHtml += `<button onclick="buyKey(${p.id})" class="btn btn-warning btn-block"><i class="fa-solid fa-key"></i> Sotib olish</button>`;
      }
    } 
    // ODDIY MARKET
    else {
      cardHtml += `
        <div class="access-zone">
          <input type="password" id="pass_${p.id}" placeholder="Parolni kiriting" style="width:100%; margin-bottom:5px;">
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

// KALIT SOTIB OLISH MANТIQI
window.buyKey = function(prodId) {
  if (!currentUser) return alert('Sotib olish uchun akkauntga kiring!');

  const prod = products.find(p => p.id === prodId);
  if (!prod) return;

  if (currentUser.coins < prod.price) {
    return alert('Koiningiz yetarli emas! Sayt egasidan Koin soʻrang.');
  }

  // Tanga yechish
  currentUser.coins -= prod.price;

  // Sotuvchining hisobiga Koin tushirish
  const seller = users.find(u => u.username === prod.seller);
  if (seller) {
    seller.coins = (seller.coins || 0) + prod.price;
  }

  if (!prod.buyers) prod.buyers = [];
  prod.buyers.push(currentUser.username);

  saveData();
  initUI();
  renderProducts();
  alert('Kalit muvaffaqiyatli sotib olindi!');
};

// ODDIY MAHSULOT PAROLINI OCHISH
window.unlockProduct = function(prodId) {
  const inputPass = document.getElementById(`pass_${prodId}`).value;
  const prod = products.find(p => p.id === prodId);

  if (inputPass === prod.pass) {
    const secretBox = document.getElementById(`secret_${prodId}`);
    secretBox.innerHTML = `<b>Sirlar:</b> ${prod.secret}`;
    secretBox.classList.remove('hidden');
  } else {
    alert('Parol xato!');
  }
};

// ADMIN PANEL (Faqat Sayt Egasi uchun)
function renderAdminPanel() {
  const adminPanel = document.getElementById('adminPanel');
  const userRolesList = document.getElementById('userRolesList');

  // Faqat 'owner' Koin bera oladi
  if (currentUser && currentUser.role === 'owner') {
    adminPanel.classList.remove('hidden');
    userRolesList.innerHTML = '';

    users.forEach(u => {
      if (u.username === currentUser.username) return;

      userRolesList.innerHTML += `
        <div class="user-role-row">
          <span><b>${u.username}</b> (${u.coins || 0} koin)</span>
          <button onclick="addCoins('${u.username}')" class="btn btn-warning" style="padding:3px 8px;">+ Koin berish</button>
        </div>
      `;
    });
  } else {
    adminPanel.classList.add('hidden');
  }
}

// SAYT EGASI KOIN BERISHI
window.addCoins = function(username) {
  const amount = prompt(`${username} ga qancha Koin beramiz?`);
  if (amount && !isNaN(amount)) {
    const user = users.find(u => u.username === username);
    if (user) {
      user.coins = (user.coins || 0) + parseInt(amount);
      saveData();
      renderAdminPanel();
      initUI();
      alert('Koinlar berildi!');
    }
  }
};
