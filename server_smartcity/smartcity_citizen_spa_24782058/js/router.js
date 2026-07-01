const routes = {
  '#home': '<section class="hero-section"><div class="container"><h1 class="hero-title">Wujudkan Kota yang Lebih Baik Bersama</h1><p class="hero-sub">Laporkan permasalahan fasilitas umum, lingkungan, dan pelayanan publik secara cepat, transparan, dan terintegrasi.</p><div class="hero-actions"><a href="#login" class="btn-glow btn-glow-primary"><i class="bi bi-shield-check"></i> Laporkan Sekarang</a><a href="#register" class="btn-glow btn-glow-secondary"><i class="bi bi-person-plus"></i> Daftar Akun</a></div></div></section><div class="container"><div class="feature-grid"><div class="glass-card feature-card"><div class="feature-icon">\uD83D\uDEA7</div><h4>Infrastruktur</h4><p>Laporkan jalan rusak, lampu mati, dan fasilitas umum lainnya.</p></div><div class="glass-card feature-card"><div class="feature-icon">\uD83C\uDF31</div><h4>Lingkungan</h4><p>Sampaikan laporan mengenai kebersihan dan kondisi lingkungan.</p></div><div class="glass-card feature-card"><div class="feature-icon">\uD83D\uDCC8</div><h4>Monitoring</h4><p>Pantau status laporan secara real-time dari Draft hingga Selesai.</p></div></div><div class="stats-row"><div class="glass stat-card"><h2>24/7</h2><p>Layanan Pelaporan</p></div><div class="glass stat-card"><h2>Real-Time</h2><p>Monitoring Status</p></div><div class="glass stat-card"><h2>Digital</h2><p>Pelayanan Modern</p></div></div><div id="publicFeedPreview" class="mt-5"><div class="loading-dots"><span></span><span></span><span></span></div></div></div>',
  '#login': '<div class="auth-wrapper"><div class="glass auth-card"><h4><i class="bi bi-shield-lock me-2"></i>Login Warga</h4><p class="subtitle">Masuk ke portal Smart City</p><form id="loginForm"><div class="floating-group"><input type="text" id="loginUsername" class="form-control" placeholder=" " required /><label for="loginUsername" class="floating-label">Username</label></div><div class="floating-group"><input type="password" id="loginPassword" class="form-control" placeholder=" " required /><label for="loginPassword" class="floating-label">Password</label></div><button type="submit" class="btn-auth"><i class="bi bi-box-arrow-in-right me-2"></i>Masuk</button></form><hr class="auth-divider" /><a href="#register" class="auth-link">Belum punya akun? <strong>Daftar sekarang</strong> <i class="bi bi-arrow-right ms-1"></i></a></div></div>',
  '#register': '<div class="auth-wrapper"><div class="glass auth-card"><h4><i class="bi bi-person-plus me-2"></i>Daftar Akun</h4><p class="subtitle">Buat akun baru untuk mulai melapor</p><form id="registerForm"><div class="floating-group"><input type="text" id="registerUsername" class="form-control" placeholder=" " required /><label for="registerUsername" class="floating-label">Username</label></div><div class="floating-group"><input type="email" id="registerEmail" class="form-control" placeholder=" " required /><label for="registerEmail" class="floating-label">Email</label></div><div class="floating-group"><input type="password" id="registerPassword" class="form-control" placeholder=" " required /><label for="registerPassword" class="floating-label">Password</label></div><button type="submit" class="btn-auth" style="background:linear-gradient(135deg,var(--success),#06b6d4);"><i class="bi bi-person-check me-2"></i>Daftar</button></form><hr class="auth-divider" /><a href="#login" class="auth-link">Sudah punya akun? <strong>Masuk</strong> <i class="bi bi-arrow-right ms-1"></i></a></div></div>',
  '#dashboard': '<div class="dash-header"><h2><i class="bi bi-speedometer2 me-2" style="color:var(--primary-light)"></i>Dashboard Warga</h2><p>Pantau semua aktivitas pelaporan Anda</p></div><div class="dash-grid"><div class="glass dash-card stagger-fade" style="border-left:3px solid var(--primary-light)"><div class="icon-bg" style="background:var(--primary-light)"></div><h6><i class="bi bi-file-text me-1"></i> Total Laporan</h6><div class="value" id="totalReport">0</div><div class="label">Semua laporan Anda</div></div><div class="glass dash-card stagger-fade" style="border-left:3px solid var(--success)"><div class="icon-bg" style="background:var(--success)"></div><h6><i class="bi bi-check-circle me-1"></i> Selesai</h6><div class="value" id="resolvedReport">0</div><div class="label">Laporan terselesaikan</div></div><div class="glass dash-card stagger-fade" style="border-left:3px solid var(--warning)"><div class="icon-bg" style="background:var(--warning)"></div><h6><i class="bi bi-clock me-1"></i> Dalam Proses</h6><div class="value" id="progressCount">0</div><div class="label">Sedang diproses</div></div><div class="glass dash-card stagger-fade" style="border-left:3px solid var(--info)"><div class="icon-bg" style="background:var(--info)"></div><h6><i class="bi bi-patch-check me-1"></i> Terverifikasi</h6><div class="value" id="verifiedCount">0</div><div class="label">Telah diverifikasi</div></div><div class="glass dash-card stagger-fade" style="border-left:3px solid #f87171"><div class="icon-bg" style="background:#f87171"></div><h6><i class="bi bi-send me-1"></i> Dilaporkan</h6><div class="value" id="reportedCount">0</div><div class="label">Menunggu verifikasi</div></div><div class="glass dash-card stagger-fade" style="border-left:3px solid var(--text-muted)"><div class="icon-bg" style="background:var(--text-muted)"></div><h6><i class="bi bi-pencil me-1"></i> Draft</h6><div class="value" id="draftCount">0</div><div class="label">Belum dikirim</div></div></div><div class="glass chart-container stagger-fade"><h5><i class="bi bi-pie-chart-fill" style="color:var(--primary-light)"></i> Statistik Status Laporan</h5><canvas id="reportChart" style="max-height:320px;"></canvas></div>',
  '#laporan': '<div class="reports-header"><div><h2><i class="bi bi-file-earmark-text me-2" style="color:var(--primary-light)"></i>Laporan Warga</h2><p>Kelola laporan, draft, dan feed publik Anda</p></div><button onclick="openReportModal()" class="btn-glow btn-glow-primary" style="padding:12px 28px;"><i class="bi bi-plus-circle me-2"></i>Tambah Laporan</button></div><div class="filter-tabs"><button class="filter-tab active" onclick="switchReportTab(&#39;feed&#39;, this)"><i class="bi bi-globe me-1"></i> Feed Publik</button><button class="filter-tab" onclick="switchReportTab(&#39;submitted&#39;, this)"><i class="bi bi-send me-1"></i> Laporan Saya</button><button class="filter-tab" onclick="switchReportTab(&#39;draft&#39;, this)"><i class="bi bi-pencil me-1"></i> Draft</button></div><div id="reportContainer"><div class="loading-dots"><span></span><span></span><span></span></div></div>',
  '#profil': '<div class="dash-header"><h2><i class="bi bi-person me-2" style="color:var(--primary-light)"></i>Profil Saya</h2></div><div id="profileContainer"><div class="glass profile-card"><div class="avatar" id="avatarInitial">U</div><h5 id="profileName">Username</h5><p class="role"><i class="bi bi-person-badge me-1"></i> Warga Smart City</p></div></div>'
};

function handleRouting() {
  const hash = window.location.hash || '#home';
  const sidebar = document.getElementById('sidebar');
  const content = document.getElementById('app-content');
  const token = localStorage.getItem('access_token');
  const guestNavbar = document.getElementById('guestNavbar');
  const userNavbar = document.getElementById('userNavbar');
  const footer = document.getElementById('mainFooter');

  if (token) {
    if (guestNavbar) guestNavbar.style.display = 'none';
    if (userNavbar) userNavbar.style.display = 'flex';
  } else {
    if (guestNavbar) guestNavbar.style.display = 'flex';
    if (userNavbar) userNavbar.style.display = 'none';
  }

  if (footer) footer.style.display = hash === '#home' ? 'block' : 'none';
  if (sidebar) sidebar.style.display = token ? 'flex' : 'none';

  if (!token && hash !== '#home' && hash !== '#login' && hash !== '#register') {
    window.location.hash = '#login'; return;
  }
  if (token && (hash === '#login' || hash === '#register')) {
    window.location.hash = '#dashboard'; return;
  }

  // Single render with fade transition
  if (content) {
    const isFirstRun = !content.innerHTML.trim();
    if (isFirstRun) {
      content.innerHTML = routes[hash] || routes['#home'];
      content.style.opacity = '1';
      initPage(hash);
      updateSidebarActive(hash);
      return;
    }
    content.style.opacity = '0';
    content.style.transform = 'translateY(8px)';
    setTimeout(() => {
      content.innerHTML = routes[hash] || routes['#home'];
      content.style.opacity = '1';
      content.style.transform = 'translateY(0)';
      content.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      initPage(hash);
    }, 150);
  }
}

function initPage(hash) {
  if (hash === '#home' && typeof loadPublicFeedPreview === 'function') loadPublicFeedPreview();
  if (hash === '#login') setupLoginForm();
  if (hash === '#register') setupRegisterForm();
  if (hash === '#dashboard') loadDashboardData();
  if (hash === '#profil') loadProfile();
  if (hash === '#laporan') {
    const container = document.getElementById('reportContainer');
    if (container) container.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';
    loadPublicFeed();
  }
  updateSidebarActive(hash);
}

function updateSidebarActive(hash) {
  document.querySelectorAll('.sidebar-link').forEach(link => link.classList.remove('active'));
  const activeLink = document.querySelector('.sidebar-link[href="' + hash + '"]');
  if (activeLink) activeLink.classList.add('active');
}

// Tab switching
let currentTab = 'feed';
function switchReportTab(tab, btn) {
  currentTab = tab;
  document.querySelectorAll('.filter-tab').forEach(function(t) { t.classList.remove('active'); });
  btn.classList.add('active');
  const container = document.getElementById('reportContainer');
  if (!container) return;
  container.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';
  if (tab === 'feed') loadPublicFeed();
  else if (tab === 'submitted') loadSubmittedReports();
  else if (tab === 'draft') loadDraftReports();
}

window.addEventListener('hashchange', handleRouting);
window.addEventListener('DOMContentLoaded', handleRouting);
window.switchReportTab = switchReportTab;