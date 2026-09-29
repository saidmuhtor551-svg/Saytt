window.addEventListener('firebase-ready', () => {
  let currentUser = JSON.parse(localStorage.getItem('mp_current_user')) || null;
  let products = [];
  let registeredUsers = [];
  let onlineUsers = [];

  const marketGrid = document.getElementById("marketGrid");
  const myProductsGrid = document.getElementById("myProductsGrid");
  const sellForm = document.getElementById("sellForm");
  const authModal = document.getElementById("authModal");
  const openAuthModalBtn = document.getElementById("openAuthModalBtn");
  const closeAuthModal = document.getElementById("closeAuthModal");
  const logoutBtn = document.getElementById("logoutBtn");
  const navUsername = document.getElementById("navUsername");
  const adminPanel = document.getElementById("adminPanel");
  const userRolesList = document.getElementById("userRolesList");
  const onlineUsersList = document.getElementById("onlineUsersList");

  function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    if (tabName === 'market') {
      document.getElementById('marketSection').classList.add('active');
      document.getElementById('tabMarketBtn').classList.add('active');
    } else if (tabName === 'add') {
      document.getElementById('addSection').classList.add('active');
      document.getElementById('tabAddBtn').classList.add('active');
    } else if (tabName === 'profile') {
      document.getElementById('profileSection').classList.add('active');
      document.getElementById('tabProfileBtn').classList.add('active');
      renderProfile();
    }
  }

  document.getElementById('tabMarketBtn').onclick = () => switchTab('market');
  document.getElementById('tabAddBtn').onclick = () => switchTab('add');
  document.getElementById('tabProfileBtn').onclick = () => switchTab('profile');

  openAuthModalBtn.onclick = () => authModal.style.display = "flex";
  closeAuthModal.onclick = () => authModal.style.display = "none";

  const showLoginBtn = document.getElementById("showLoginBtn");
  const showRegisterBtn = document.getElementById("showRegisterBtn");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  showLoginBtn.onclick = () => {
    showLoginBtn.classList.add("active"); showRegisterBtn.classList.remove("active");
    loginForm.classList.add("active"); registerForm.classList.remove("active");
  };
  showRegisterBtn.onclick = () => {
    showRegisterBtn.classList.add("active"); showLoginBtn.classList.remove("active");
    registerForm.classList.add("active"); loginForm.classList.remove("active");
  };

  registerForm.onsubmit = async (e) => {
    e.preventDefault();
    const u = document.getElementById("regUser").value.trim();
    const p = document.getElementById("regPass").value.trim();
    try {
      let defaultRole = (u.toLowerCase() === "korol_988") ? "Владелец сайта" : "Пользователь";

      await window.addDoc(window.collection(window.db, "users"), { 
        username: u, 
        pass: p, 
        role: defaultRole, 
        isBlocked: false 
      });
      alert("Muvaffaqiyatli ro'yxatdan o'tdingiz!");
      registerForm.reset();
      showLoginBtn.click();
    } catch (err) {
      alert("Xatolik: " + err.message);
    }
  };

  loginForm.onsubmit = async (e) => {
    e.preventDefault();
    const u = document.getElementById("loginUser").value.trim();
    const p = document.getElementById("loginPass").value.trim();
    try {
      const querySnapshot = await window.getDocs(window.collection(window.db, "users"));
      let found = null;
      querySnapshot.forEach((docSnap) => {
        let data = docSnap.data();
        if (data.username === u && data.pass === p) {
          found = { id: docSnap.id, ...data };
        }
      });

      if (found) {
        if (found.isBlocked) {
          document.getElementById("loginError").textContent = "Sizning akkuntingiz bloklangan!";
          document.getElementById("loginError").classList.remove("hidden");
          return;
        }
        currentUser = found;
        localStorage.setItem('mp_current_user', JSON.stringify(currentUser));
        updateUserNavUI();
        authModal.style.display = "none";
        loginForm.reset();
        alert(`Xush kelibsiz, ${currentUser.username}!`);
        pingOnlineStatus();
        renderProfile();
      } else {
        document.getElementById("loginError").textContent = "Xato login yoki parol!";
        document.getElementById("loginError").classList.remove("hidden");
      }
    } catch (err) {
      alert("Xatolik: " + err.message);
    }
  };

  logoutBtn.onclick = async () => {
    if (currentUser) {
      try {
        await window.deleteDoc(window.doc(window.db, "online", currentUser.username));
      } catch(err) {}
    }
    currentUser = null;
    localStorage.removeItem('mp_current_user');
    updateUserNavUI();
    renderProfile();
  };

  function updateUserNavUI() {
    if (currentUser) {
      navUsername.innerHTML = `<i class="fa-solid fa-circle-user"></i> ${currentUser.username}`;
      openAuthModalBtn.classList.add("hidden");
      logoutBtn.classList.remove("hidden");
    } else {
      navUsername.innerHTML = `<i class="fa-solid fa-circle-user"></i> Гость`;
      openAuthModalBtn.classList.remove("hidden");
      logoutBtn.classList.add("hidden");
    }
  }

  async function pingOnlineStatus() {
    if (!currentUser) return;
    try {
      await window.setDoc(window.doc(window.db, "online", currentUser.username), {
        username: currentUser.username,
        lastActive: Date.now()
      });
    } catch (err) {}
  }

  setInterval(pingOnlineStatus, 10000);

  function listenOnlineUsers() {
    window.onSnapshot(window.collection(window.db, "online"), (snapshot) => {
      onlineUsers = [];
      const now = Date.now();
      snapshot.forEach((docSnap) => {
        let data = docSnap.data();
        if (now - data.lastActive < 30000) {
          onlineUsers.push(data.username);
        }
      });
      
      if (onlineUsers.length === 0) {
        onlineUsersList.textContent = "Hozircha hech kim yo'q (Faqat siz)";
      } else {
        onlineUsersList.innerHTML = onlineUsers.map(name => `<b>👤 ${name}</b>`).join(", ");
      }
    });
  }

  function listenUsersList() {
    window.onSnapshot(window.collection(window.db, "users"), (snapshot) => {
      registeredUsers = [];
      snapshot.forEach((docSnap) => {
        registeredUsers.push({ id: docSnap.id, ...docSnap.data() });
      });
      
      if (currentUser) {
        let freshMe = registeredUsers.find(u => u.id === currentUser.id);
        if (freshMe) {
          if (freshMe.isBlocked) {
            alert("Sizning akkuntingiz ma'muriyat tomonidan bloklandi!");
            logoutBtn.click();
            return;
          }
          currentUser = freshMe;
          localStorage.setItem('mp_current_user', JSON.stringify(currentUser));
        }
      }
      renderProfile();
    });
  }

  sellForm.onsubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert("Mahsulot qo'shish uchun oldin kiring!");
      authModal.style.display = "flex";
      return;
    }

    const title = document.getElementById("prodTitle").value.trim();
    const type = document.getElementById("prodType").value;
    const img = document.getElementById("prodImgUrl").value.trim() || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500";
    const desc = document.getElementById("prodDesc").value.trim();
    const secretData = document.getElementById("prodSecretData").value.trim();
    const passKey = document.getElementById("prodSecretPassword").value.trim();

    try {
      await window.addDoc(window.collection(window.db, "products"), {
        seller: currentUser.username,
        title, type, img, desc, secretData, passKey,
        createdAt: Date.now()
      });
      alert("Mahsulot onlayn bazaga qo'shildi!");
      sellForm.reset();
      switchTab('market');
    } catch (err) {
      alert("Xatolik: " + err.message);
    }
  };

  function listenProducts() {
    window.onSnapshot(window.collection(window.db, "products"), (snapshot) => {
      products = [];
      snapshot.forEach((docSnap) => {
        products.push({ id: docSnap.id, ...docSnap.data() });
      });
      renderMarket();
      if (currentUser) renderProfile();
    });
  }

  function renderMarket() {
    marketGrid.innerHTML = "";
    if (products.length === 0) {
      marketGrid.innerHTML = "<p style='color:#9ca3af; grid-column: 1/-1; text-align: center; padding: 40px;'>Hozircha onlayn mahsulotlar yo'q.</p>";
      return;
    }

    const canDeleteAny = currentUser && (currentUser.role === "Администратор" || currentUser.role === "Владелец сайта");

    products.forEach((p) => {
      const card = document.createElement("div");
      card.className = "card-item";
      let mediaHTML = p.type === "image" ? `<img src="${p.img}" alt="${p.title}">` : `<div class="text-type-badge"><i class="fa-solid fa-file-lines"></i> Matnli mahsulot</div>`;
      let deleteBtn = (canDeleteAny || (currentUser && currentUser.username === p.seller)) ? `<button class="btn btn-danger" style="padding: 2px 6px; font-size: 0.7rem;" onclick="window.deleteProduct('${p.id}')">O'chirish</button>` : '';

      card.innerHTML = `
        ${mediaHTML}
        <div class="card-body">
          <div>
            <div class="seller-info">
              <span>Sotuvchi: <b>${p.seller}</b></span>
              ${deleteBtn}
            </div>
            <h3>${p.title}</h3>
            <p>${p.desc}</p>
          </div>
          <div class="access-zone">
            <label style="font-size: 0.8rem; color:#9ca3af;">Parolni kiriting:</label>
            <div style="display:flex; gap:5px; margin-top:4px;">
              <input type="password" id="passInput_${p.id}" placeholder="Parol">
              <button class="btn btn-primary" onclick="window.unlockSecret('${p.id}', '${p.passKey}', '${p.secretData}')">Ochish</button>
            </div>
            <div id="secretResult_${p.id}" class="hidden"></div>
          </div>
        </div>
      `;
      marketGrid.appendChild(card);
    });
  }

  window.unlockSecret = function(id, realPass, secret) {
    const inputVal = document.getElementById(`passInput_${id}`).value.trim();
    const resDiv = document.getElementById(`secretResult_${id}`);
    if (inputVal === realPass) {
      resDiv.className = "unlocked-data";
      resDiv.innerHTML = `<b>Maxfiy ma'lumot:</b><br>${secret}`;
    } else {
      alert("Parol noto'g'ri!");
    }
  };

  function renderProfile() {
    const profName = document.getElementById("profName");
    const profRoleBadge = document.getElementById("profRoleBadge");
    
    if (!currentUser) {
      profName.textContent = "Гость";
      profRoleBadge.textContent = "Tizimda emassiz";
      adminPanel.classList.add("hidden");
      myProductsGrid.innerHTML = "<p style='color:#9ca3af;'>Tizimga kiring.</p>";
      return;
    }

    profName.textContent = currentUser.username;
    profRoleBadge.textContent = currentUser.role || "Foydalanuvchi";
    profRoleBadge.className = currentUser.role === "Владелец сайта" ? "role-tag role-owner" : (currentUser.role === "Администратор" ? "role-tag role-admin" : "role-tag role-user");

    if (currentUser.role === "Владелец сайта" || currentUser.role === "Администратор") {
      adminPanel.classList.remove("hidden");
      renderAdminUsersList();
    } else {
      adminPanel.classList.add("hidden");
    }

    myProductsGrid.innerHTML = "";
    const myProds = products.filter(p => p.seller === currentUser.username);
    if (myProds.length === 0) {
      myProductsGrid.innerHTML = "<p style='color:#9ca3af;'>Siz hali mahsulot qo'shmagansiz.</p>";
      return;
    }
    myProds.forEach(p => {
      const card = document.createElement("div");
      card.className = "card-item";
      card.innerHTML = `
        <div class="card-body">
          <h3>${p.title}</h3>
          <p>${p.desc}</p>
          <p style="color:#f59e0b; font-size:0.85rem;">Sizning parolingiz: <b>${p.passKey}</b></p>
          <button class="btn btn-danger" style="margin-top:8px; font-size:0.75rem;" onclick="window.deleteProduct('${p.id}')">O'chirish</button>
        </div>
      `;
      myProductsGrid.appendChild(card);
    });
  }

  function renderAdminUsersList() {
    userRolesList.innerHTML = "";
    const isOwner = currentUser.role === "Владелец сайта";

    registeredUsers.forEach(u => {
      if (u.username === currentUser.username) return;
      
      const row = document.createElement("div");
      row.className = "user-role-row";

      let blockBtnText = u.isBlocked ? "Banddan chiqarish" : "Bloklash";
      let blockBtnColor = u.isBlocked ? "btn-success" : "btn-danger";

      let actionButtons = `<button class="btn ${blockBtnColor}" style="font-size:0.7rem; padding:4px 8px;" onclick="window.toggleBlockUser('${u.id}', ${!u.isBlocked})">${blockBtnText}</button>`;

      if (isOwner) {
        if (u.role === "Администратор") {
          actionButtons += ` <button class="btn btn-warning" style="font-size:0.7rem; padding:4px 8px;" onclick="window.changeUserRole('${u.id}', 'Пользователь')">Adminlikni olish</button>`;
        } else if (u.role === "Пользователь") {
          actionButtons += ` <button class="btn btn-primary" style="font-size:0.7rem; padding:4px 8px;" onclick="window.changeUserRole('${u.id}', 'Администратор')">Admin qilish</button>`;
        }
      }

      row.innerHTML = `
        <div>
          <b>${u.username}</b> <span class="role-tag">${u.role}</span>
          ${u.isBlocked ? '<span style="color:var(--danger); font-size:0.75rem; margin-left:6px;">[Bloklangan]</span>' : ''}
        </div>
        <div style="display:flex; gap:4px;">${actionButtons}</div>
      `;
      userRolesList.appendChild(row);
    });
  }

  window.toggleBlockUser = async function(userId, blockStatus) {
    try {
      await window.updateDoc(window.doc(window.db, "users", userId), { isBlocked: blockStatus });
      alert(blockStatus ? "Foydalanuvchi bloklandi!" : "Foydalanuvchi blokdan chiqarildi!");
    } catch (err) {
      alert("Xatolik: " + err.message);
    }
  };

  window.changeUserRole = async function(userId, newRole) {
    try {
      await window.updateDoc(window.doc(window.db, "users", userId), { role: newRole });
      alert("Foydalanuvchi roli o'zgartirildi: " + newRole);
    } catch (err) {
      alert("Xatolik: " + err.message);
    }
  };

  window.deleteProduct = async function(id) {
    if (confirm("Mahsulotni o'chirishni xohlaysizmi?")) {
      try {
        await window.deleteDoc(window.doc(window.db, "products", id));
        alert("O'chirildi!");
      } catch (err) {
        alert("Xatolik: " + err.message);
      }
    }
  };

  document.getElementById("shareSiteBtn").onclick = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Havola nusxalandi!");
  };

  updateUserNavUI();
  if (currentUser) pingOnlineStatus();
  listenOnlineUsers();
  listenUsersList();
  listenProducts();
});
