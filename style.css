// LocalStorage Baza bilan ishlash
let users = JSON.parse(localStorage.getItem('users_db')) || [
  { username: 'admin', pass: 'admin123', role: 'owner', coins: 1000, isBlocked: false }
];

let products = JSON.parse(localStorage.getItem('products_db')) || [];
let currentUser = JSON.parse(localStorage.getItem('current_user')) || null;

// Saqlash funksiyasi
function saveData() {
  localStorage.setItem('users_db', JSON.stringify(users));
  localStorage.setItem('products_db', JSON.stringify(products));
  if (currentUser) {
    localStorage.setItem('current_user', JSON.stringify(currentUser));
  } else {
    localStorage.removeItem('current_user');
  }
}

// Sahifa yuklanganda ishga tushadigan qism
document.addEventListener('DOMContentLoaded', () => {
  initApp();
  setupTabs();
  setupAuth();
  setupProductForm();
  renderProducts();
});

function initApp() {
  if (currentUser) {
    // Joriy foydalanuvchini yangilash
    const updated = users.find(u => u.username === currentUser.username);
    if (updated) currentUser = updated;
    
    if (currentUser.isBlocked) {
      document.getElementById('blockedOverlay').classList.remove('hidden');
    } else {
      document.getElementById('navUsername').innerHTML = `<i class="fa-solid fa-circle-user"></i> ${currentUser.username}`;
      document.getElementById('openAuthModalBtn').classList.add('hidden');
      document.getElementById('logoutBtn').classList.remove('hidden');
      document.getElementById('navCoins').classList.remove('hidden');
      document.getElementById('userCoinsCount').innerText = currentUser.coins || 0;
    }
  }
  renderAdminPanel();
}

// Navigatsiya (Tablar)
function setupTabs() {
  const tabs = {
    tabMarketBtn: 'marketSection',
    tabKeysBtn: 'keysSection',
    tabAddBtn: 'addSection',
    tabChatBtn: 'chatSection',
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

// Auth Sistemasi
function setupAuth() {
  const modal = document.getElementById('authModal');
  document.getElementById('openAuthModalBtn').onclick = () => modal.style.display = 'flex';
  document.getElementById('closeAuthModal').onclick = () => modal.style.display = 'none';

  // Login
  document.getElementById('loginForm').onsubmit = (e) => {
    e.preventDefault();
    const u = document.getElementById('loginUser').value;
    const p = document.getElementById('loginPass').value;

    const user = users.find(x => x.username === u && x.pass === p);
    if (user) {
      currentUser = user;
      saveData();
      location.reload(); // Sahifani yangilash va avto-login qilish
    } else {
      document.getElementById('loginError').classList.remove('hidden');
    }
  };

  // Register
  document.getElementById('registerForm').onsubmit = (e) => {
    e.preventDefault();
    const u = document.getElementById('regUser').value;
    const p = document.getElementById('regPass').value;

    if (users.some(x => x.username === u)) {
      alert('Bunday foydalanuvchi mavjud!');
      return;
    }

    const newUser = { username: u, pass: p, role: 'user', coins: 0, isBlocked: false };
    users.push(newUser);
    currentUser = newUser;
    saveData();
    location.reload();
  };

  // Logout
  document.getElementById('logoutBtn').onclick = () => {
    currentUser = null;
    saveData();
    location.reload();
  };

  document.getElementById('blockedLogoutBtn').onclick = () => {
    currentUser = null;
    saveData();
    location.reload();
  };
}

// Tovar joylash formasi
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
    if (!currentUser) return alert('Avval akkauntga kiring!');

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
    alert('Eʼlon joylashtirildi!');
    renderProducts();
    document.getElementById('sellForm').reset();
  };
}

// Tovarlarni ekranga chiqarish
function renderProducts() {
  const marketGrid = document.getElementById('marketGrid');
  const keysGrid = document.getElementById('keysGrid');
  const myProductsGrid = document.getElementById('myProductsGrid');

  marketGrid.innerHTML = '';
  keysGrid.innerHTML = '';
  myProductsGrid.innerHTML = '';

  products.forEach(p => {
    const isOwner = currentUser && (currentUser.username === p.seller || currentUser.role === 'owner' || currentUser.role === 'admin');
    const hasBought = currentUser && p.buyers.includes(currentUser.username);

    let cardHtml = `
      <div class="card">
        <img src="${p.img}" alt="img">
        <div class="card-body">
          <div class="seller-info">Sotuvchi: <b>${p.seller}</b></div>
          <h3>${p.title}</h3>
          <p>${p.desc}</p>
    `;

    // AGAR KLUCHLAR MARKETI BO'LSA
    if (p.category === 'key') {
      cardHtml += `<div style="color:#f59e0b; font-weight:bold; margin-bottom:10px;"><i class="fa-solid fa-coins"></i> Narxi: ${p.price} Koin</div>`;

      if (hasBought || isOwner) {
        cardHtml += `<div class="unlocked-data"><b>Kalit:</b> ${p.secret}</div>`;
      } else {
        cardHtml += `<button onclick="buyKey(${p.id})" class="btn btn-warning btn-block"><i class="fa-solid fa-cart-shopping"></i> Koin bilan sotib olish</button>`;
      }
    } 
    // AGAR ODDIY MARKET BO'LSA
    else {
      cardHtml += `
        <div class="access-zone">
          <input type="password" id="pass_${p.id}" placeholder="Parolni kiriting">
          <button onclick="unlockProduct(${p.id})" class="btn btn-primary btn-block" style="margin-top:5px;">Ochish</button>
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

// Kalitni Koin evaziga sotib olish mantiqi
window.buyKey = function(prodId) {
  if (!currentUser) return alert('Avval tizimga kiring!');

  const prod = products.find(p => p.id === prodId);
  if (!prod) return;

  if (currentUser.coins < prod.price) {
    return alert('Tangalaringiz yetarli emas! Admindan Koin soʻrang.');
  }

  // Hisob-kitob qilish
  currentUser.coins -= prod.price;
  
  // Sotuvchining balansiga tangani o'tkazish
  const seller = users.find(u => u.username === prod.seller);
  if (seller) {
    seller.coins = (seller.coins || 0) + prod.price;
  }

  prod.buyers.push(currentUser.username);
  saveData();
  alert('Kalit muvaffaqiyatli sotib olindi!');
  initApp();
  renderProducts();
};

// Oddiy parolli mahsulotni ochish
window.unlockProduct = function(prodId) {
  const inputPass = document.getElementById(`pass_${prodId}`).value;
  const prod = products.find(p => p.id === prodId);

  if (inputPass === prod.pass) {
    const secretBox = document.getElementById(`secret_${prodId}`);
    secretBox.innerHTML = `<b>Ma'lumot:</b> ${prod.secret}`;
    secretBox.classList.remove('hidden');
  } else {
    alert('Parol notoʻgʻri!');
  }
};

// ADMIN PANEL: Koin berish va Bloklash
function renderAdminPanel() {
  if (!currentUser || (currentUser.role !== 'owner' && currentUser.role !== 'admin')) return;

  const adminPanel = document.getElementById('adminPanel');
  const userRolesList = document.getElementById('userRolesList');
  adminPanel.classList.remove('hidden');
  userRolesList.innerHTML = '';

  users.forEach(u => {
    if (u.username === currentUser.username) return;

    userRolesList.innerHTML += `
      <div class="user-role-row">
        <span><b>${u.username}</b> (${u.coins || 0} koin)</span>
        <div style="display:flex; gap:5px;">
          <button onclick="addCoins('${u.username}')" class="btn btn-warning" style="padding:2px 6px;">+Koin</button>
          <button onclick="toggleBlock('${u.username}')" class="btn ${u.isBlocked ? 'btn-success' : 'btn-danger'}" style="padding:2px 6px;">
            ${u.isBlocked ? 'Unblock' : 'Block'}
          </button>
        </div>
      </div>
    `;
  });
}

// Adminga koin qo'shish imkoniyati
window.addCoins = function(username) {
  const amount = prompt(`${username} ga qancha koin qo'shmoqchisiz?`);
  if (amount && !isNaN(amount)) {
    const user = users.find(u => u.username === username);
    if (user) {
      user.coins = (user.coins || 0) + parseInt(amount);
      saveData();
      renderAdminPanel();
      alert('Koinlar berildi!');
    }
  }
};

// Foydalanuvchini bloklash
window.toggleBlock = function(username) {
  const user = users.find(u => u.username === username);
  if (user) {
    user.isBlocked = !user.isBlocked;
    saveData();
    renderAdminPanel();
  }
};
