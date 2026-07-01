console.log("🚀 Smart City Portal");

// ===============================
// GLOBAL STATE
// ===============================
let editingReportId = null;
let chart = null;

// ================= STATUS =================
const STATUS = {
    DRAFT: 20,
    REPORTED: 40,
    VERIFIED: 60,
    IN_PROGRESS: 80,
    RESOLVED: 100
};

const STATUS_COLORS = {
    DRAFT: { badge: '#94a3b8', bg: 'rgba(100,116,139,0.2)', bar: '#94a3b8' },
    REPORTED: { badge: '#60a5fa', bg: 'rgba(59,130,246,0.2)', bar: '#3b82f6' },
    VERIFIED: { badge: '#818cf8', bg: 'rgba(99,102,241,0.2)', bar: '#6366f1' },
    IN_PROGRESS: { badge: '#fbbf24', bg: 'rgba(245,158,11,0.2)', bar: '#f59e0b' },
    RESOLVED: { badge: '#34d399', bg: 'rgba(16,185,129,0.2)', bar: '#10b981' }
};

// ================= HELPERS =================
const progress = s => STATUS[s] || 0;
const badgeStatus = s => {
    const c = STATUS_COLORS[s] || STATUS_COLORS.DRAFT;
    return `<span class="badge-status" style="background:${c.bg};color:${c.badge}">
        <span style="width:6px;height:6px;border-radius:50%;background:${c.badge};display:inline-block"></span>
        ${s.replace('_', ' ')}
    </span>`;
};

// ================= TOAST NOTIFICATIONS =================
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const icons = { success:'bi-check-circle-fill', error:'bi-x-circle-fill', warning:'bi-exclamation-triangle-fill', info:'bi-info-circle-fill' };
    const toast = document.createElement('div');
    toast.className = 'toast-notif ' + type;
    toast.innerHTML = '<span class="toast-icon"><i class="bi ' + (icons[type] || icons.info) + '"></i></span> ' + message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

// ================= ANIMATED COUNTER =================
function animateCounter(el, target, duration = 800) {
    if (!el) return;
    const start = parseInt(el.innerText) || 0;
    if (start === target) return;
    const startTime = performance.now();
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        const current = Math.round(start + (target - start) * eased);
        el.innerText = current;
        if (progress < 1) requestAnimationFrame(update);
        else el.innerText = target;
    }
    requestAnimationFrame(update);
}

// ================= CUSTOM CONFIRM =================
function showConfirm(message) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'confirm-overlay';
        overlay.innerHTML = `
            <div class="confirm-box">
                <h5><i class="bi bi-exclamation-triangle-fill" style="color:var(--warning);font-size:2rem;display:block;margin-bottom:12px;"></i></h5>
                <p>${message}</p>
                <div class="confirm-actions">
                    <button class="confirm-btn confirm-btn-cancel" id="confirmNo">Batal</button>
                    <button class="confirm-btn confirm-btn-danger" id="confirmYes">Ya, Hapus</button>
                </div>
            </div>`;
        document.body.appendChild(overlay);
        const cleanup = () => { overlay.remove(); document.removeEventListener('keydown', escHandler); };
        document.getElementById('confirmYes').onclick = () => { cleanup(); resolve(true); };
        document.getElementById('confirmNo').onclick = () => { cleanup(); resolve(false); };
        overlay.onclick = (e) => { if (e.target === overlay) { cleanup(); resolve(false); } };
        const escHandler = (e) => { if (e.key === 'Escape') { cleanup(); resolve(false); } };
        document.addEventListener('keydown', escHandler);
    });
}

// ================= DASHBOARD =================
async function loadDashboardData() {
    const res = await requestAPI('/api/report/?tab=my_reports&page_size=1000');
    if (!res.ok) return;

    const data = res.data.results || [];
    const s = { DRAFT:0, REPORTED:0, VERIFIED:0, IN_PROGRESS:0, RESOLVED:0 };
    data.forEach(r => s[r.status]++);

    // Animated counters
    animateCounter(document.getElementById('draftCount'), s.DRAFT);
    animateCounter(document.getElementById('reportedCount'), s.REPORTED);
    animateCounter(document.getElementById('verifiedCount'), s.VERIFIED);
    animateCounter(document.getElementById('progressCount'), s.IN_PROGRESS);
    animateCounter(document.getElementById('resolvedCount'), s.RESOLVED);
    animateCounter(document.getElementById('totalReport'), data.length);
    animateCounter(document.getElementById('resolvedReport'), s.RESOLVED);

    // Modern Chart
    const ctx = document.getElementById('reportChart');
    if (!ctx) return;

    chart?.destroy();
    chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Draft', 'Reported', 'Verified', 'In Progress', 'Resolved'],
            datasets: [{
                data: [s.DRAFT, s.REPORTED, s.VERIFIED, s.IN_PROGRESS, s.RESOLVED],
                backgroundColor: ['#94a3b8', '#3b82f6', '#6366f1', '#f59e0b', '#10b981'],
                borderColor: 'rgba(11,17,32,0.8)',
                borderWidth: 3,
                hoverOffset: 12
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            cutout: '68%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#94a3b8', padding: 16, usePointStyle: true, pointStyle: 'circle', font: { family: 'Inter', size: 12 } }
                }
            },
            animation: { duration: 1200, easing: 'easeOutQuart' }
        }
    });
}

// ================= RENDER =================
function renderReports(data) {
    const el = document.getElementById("reportContainer");
    if (!el) return;

    if (!data || !data.length)
        return el.innerHTML = `<div class="glass" style="padding:48px;text-align:center;">
            <i class="bi bi-inbox" style="font-size:3rem;color:var(--text-muted);display:block;margin-bottom:12px;"></i>
            <p style="color:var(--text-muted);margin:0;">Tidak ada laporan</p>
        </div>`;

    const isAdmin = localStorage.getItem("is_admin") === "true";

    el.innerHTML = data.map(r => {
        const c = STATUS_COLORS[r.status] || STATUS_COLORS.DRAFT;
        let btn = "";

        // USER ACTION
        if (r.status === "DRAFT") {
            btn += `
                <button class="btn-action btn-action-edit" onclick="editDraft(${r.id})"><i class="bi bi-pencil"></i> Edit</button>
                <button class="btn-action btn-action-submit" onclick="submitDraft(${r.id})"><i class="bi bi-send"></i> Kirim</button>
                <button class="btn-action btn-action-delete" onclick="deleteReport(${r.id})"><i class="bi bi-trash"></i> Hapus</button>
            `;
        }

        // ADMIN ACTION
        if (isAdmin) {
            if (r.status === "REPORTED")
                btn += `<button class="btn-action btn-action-verify" onclick="updateStatus(${r.id},'VERIFIED')"><i class="bi bi-check-lg"></i> Verifikasi</button>`;

            if (r.status === "VERIFIED")
                btn += `<button class="btn-action btn-action-process" onclick="updateStatus(${r.id},'IN_PROGRESS')"><i class="bi bi-gear"></i> Proses</button>`;

            if (r.status === "IN_PROGRESS")
                btn += `<button class="btn-action btn-action-resolve" onclick="updateStatus(${r.id},'RESOLVED')"><i class="bi bi-check-all"></i> Selesai</button>`;
        }

        return `
        <div class="glass report-item">
            <div class="left">
                <div class="title">
                    <span>${r.title}</span>
                    ${badgeStatus(r.status)}
                </div>
                <div class="desc">${r.description || 'Tidak ada deskripsi'}</div>
                <div class="meta">
                    <span><i class="bi bi-tag me-1"></i>${r.category || '-'}</span>
                    <span><i class="bi bi-geo-alt me-1"></i>${r.location || '-'}</span>
                    <span><i class="bi bi-person me-1"></i>${r.reporter || '-'}</span>
                </div>
                <div class="progress-track">
                    <div class="bar" style="width:${progress(r.status)}%;background:${c.bar}"></div>
                </div>
            </div>
            <div class="actions">${btn}</div>
        </div>`;
    }).join("");
}

// ================= API WRAPPER =================
const loadMyReports = async () =>
    (await requestAPI('/api/report/?tab=my_reports')).data.results || [];

const loadPublicFeed = async () =>
    renderReports((await requestAPI('/api/report/?tab=feed')).data.results || []);

async function loadPublicFeedPreview(){
    const res = await requestAPI('/api/report/?tab=feed');
    if(!res.ok) return;

    const container = document.getElementById('publicFeedPreview');
    if(!container) return;

    const items = (res.data.results || []).slice(0,5);
    if (!items.length) { container.innerHTML = ''; return; }

    container.innerHTML = '<h5 style="font-weight:700;margin-bottom:16px;display:flex;align-items:center;gap:8px;"><i class="bi bi-newspaper" style="color:var(--primary-light)"></i> Laporan Terbaru</h5>' +
        items.map(r => `
            <div class="glass report-item" style="padding:14px 18px;margin-bottom:8px;">
                <div style="flex:1;">
                    <div style="font-weight:600;font-size:0.95rem;margin-bottom:4px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                        ${r.title} ${badgeStatus(r.status)}
                    </div>
                    <div style="font-size:0.8rem;color:var(--text-muted);display:flex;gap:12px;">
                        <span><i class="bi bi-geo-alt me-1"></i>${r.location || '-'}</span>
                        <span><i class="bi bi-person me-1"></i>${r.reporter || 'Warga'}</span>
                    </div>
                </div>
            </div>
        `).join('');
}

async function loadSubmittedReports(){
    const res = await requestAPI('/api/report/?tab=my_reports');
    if(!res.ok) return;

    renderReports(
        (res.data.results || []).filter(r => r.status !== 'DRAFT')
    );
}

// ================= STATUS UPDATE =================
async function updateStatus(id, status) {
    const res = await requestAPI(`/api/report/${id}/`, "PATCH", { status });

    if (res.ok) {
        showToast('Status berhasil diupdate!', 'success');
        await loadPublicFeed(); 
        await loadSubmittedReports();
        await loadDashboardData();
    } else {
        showToast('Gagal update status: ' + JSON.stringify(res.data), 'error');
    }
}

async function submitDraft(id){
    const res = await requestAPI(`/api/report/${id}/`, 'PATCH', { status: 'REPORTED' });
    if(res.ok){
        showToast('✅ Laporan berhasil dikirim!', 'success');
        await loadSubmittedReports();
        await loadDashboardData();
        await loadPublicFeed();
        await loadDraftReports();
    } else {
        showToast('Gagal mengirim: ' + JSON.stringify(res.data), 'error');
    }
}

async function loadDraftReports(){
    const res = await requestAPI('/api/report/?tab=my_reports');
    if(!res.ok) return;
    renderReports((res.data.results || []).filter(r => r.status === 'DRAFT'));
}

function loadProfile(){
    const container = document.getElementById('profileContainer');
    if(!container) return;
    const username = localStorage.getItem('username') || 'User';
    const initial = username.charAt(0).toUpperCase();
    container.innerHTML = `
        <div class="glass profile-card">
            <div class="avatar">${initial}</div>
            <h5>${username}</h5>
            <p class="role">Warga Smart City</p>
        </div>
    `;
}

async function editDraft(id){
    console.log("EDIT ID =", id);
    const res = await requestAPI(`/api/report/${id}/`);
    console.log("EDIT RESPONSE =", res);

    if(!res.ok){
        showToast('Draft tidak ditemukan', 'error');
        return;
    }
    const report = res.data;
    editingReportId = id;
    document.getElementById('title').value = report.title || '';
    document.getElementById('category').value = report.category || '';
    document.getElementById('location').value = report.location || '';
    document.getElementById('description').value = report.description || '';
    new bootstrap.Modal(document.getElementById('reportModal')).show();
}

async function deleteReport(id){
    const confirmed = await showConfirm('Apakah Anda yakin ingin menghapus laporan ini? Tindakan ini tidak dapat dibatalkan.');
    if (!confirmed) return;

    const res = await requestAPI(`/api/report/${id}/`, 'DELETE');

    if(res.ok){
        showToast('🗑️ Laporan berhasil dihapus', 'success');
        await loadDraftReports();
        await loadDashboardData();
        await loadPublicFeed();
    } else {
        showToast('Gagal menghapus', 'error');
    }
}

function toggleRekap() {
    const content = document.getElementById('rekapContent');
    const arrow = document.getElementById('rekapArrow');
    if (!content) return;
    content.classList.toggle('show');
    if (arrow) arrow.classList.toggle('open');
}

function openReportModal(){
    if(editingReportId === null){
        document.getElementById("reportForm").reset();
    }
    const modal = new bootstrap.Modal(document.getElementById("reportModal"));
    modal.show();
}

// ==========================================
// EVENT LISTENER (GLOBAL CLICK HANDLER)
// ==========================================
document.addEventListener('click', async function(e) {
    const btnDraft = e.target.closest('#btnDraft');
    const btnSubmit = e.target.closest('#btnSubmit');

    // 1. ACTION: SIMPAN DRAFT
    if (btnDraft) {
        const data = {
            title: document.getElementById('title').value,
            category: document.getElementById('category').value,
            location: document.getElementById('location').value,
            description: document.getElementById('description').value,
            status: 'DRAFT'
        };

        let res;
        if (editingReportId) {
            res = await requestAPI(`/api/report/${editingReportId}/`, 'PUT', data);
        } else {
            res = await requestAPI('/api/report/', 'POST', data);
        }

        if (res.ok) {
            showToast('💾 Draft berhasil disimpan!', 'success');
            bootstrap.Modal.getInstance(document.getElementById('reportModal'))?.hide();
            editingReportId = null;
            document.getElementById("reportForm").reset();
            await loadDraftReports();
            await loadDashboardData();
        } else {
            showToast('Gagal: ' + JSON.stringify(res.data), 'error');
        }
    }

    // 2. ACTION: AJUKAN LAPORAN (DARI MODAL FORM)
    if (btnSubmit) {
        const data = {
            title: document.getElementById('title').value,
            category: document.getElementById('category').value,
            location: document.getElementById('location').value,
            description: document.getElementById('description').value,
            status: 'REPORTED'
        };

        let res;
        if (editingReportId) {
            res = await requestAPI(`/api/report/${editingReportId}/`, 'PUT', data);
        } else {
            res = await requestAPI('/api/report/', 'POST', data);
        }

        if (res.ok) {
            showToast('📨 Laporan berhasil dikirim!', 'success');
            bootstrap.Modal.getInstance(document.getElementById('reportModal'))?.hide();
            editingReportId = null;
            document.getElementById("reportForm").reset();
            await loadSubmittedReports();
            await loadDashboardData();
            await loadPublicFeed();
            await loadDraftReports();
        } else {
            showToast('Gagal: ' + JSON.stringify(res.data), 'error');
        }
    }
});

// ==========================================
// ✨ NEW MODERN FEATURES
// ==========================================

/* ---- Floating Labels Auto-fill Detection ---- */
document.addEventListener('input', function(e) {
  if (e.target.classList.contains('form-control')) {
    if (e.target.value.trim()) {
      e.target.classList.add('filled');
    } else {
      e.target.classList.remove('filled');
    }
  }
});

/* ---- Scroll Reveal Animations (Intersection Observer) ---- */
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale').forEach(el => {
    observer.observe(el);
  });
}

// Re-initialize after route changes
function refreshAfterRoute() {
  setTimeout(() => {
    initScrollReveal();
    document.querySelectorAll('.form-control').forEach(el => {
      if (el.value.trim()) el.classList.add('filled');
    });
  }, 300);
}

const contentObserver = new MutationObserver(refreshAfterRoute);
const mainContent = document.getElementById('app-content');
if (mainContent) {
  contentObserver.observe(mainContent, { childList: true, subtree: true });
}

/* ---- Mobile Sidebar Toggle ---- */
function toggleMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (!sidebar) return;

  const isOpen = sidebar.classList.contains('mobile-open');
  sidebar.classList.toggle('mobile-open');
  if (overlay) overlay.classList.toggle('show');
  document.body.style.overflow = isOpen ? '' : 'hidden';
}

// Close mobile sidebar on sidebar link click
document.addEventListener('click', function(e) {
  const link = e.target.closest('.sidebar-link');
  if (link && window.innerWidth <= 992) {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar?.classList.remove('mobile-open');
    overlay?.classList.remove('show');
    document.body.style.overflow = '';
  }
});

/* ---- FAB Show/Hide on Scroll ---- */
window.addEventListener('scroll', function() {
  const fab = document.getElementById('fabContainer');
  const backToTop = document.getElementById('backToTop');
  if (!fab) return;

  const token = localStorage.getItem('access_token');
  const scrollY = window.scrollY;

  // Show FAB only when logged in, on pages with content, and scrolled down
  if (token && scrollY > 200) {
    fab.style.display = 'block';
    fab.style.opacity = '1';
  } else {
    fab.style.display = 'none';
  }

  // Back to top
  if (backToTop) {
    if (scrollY > 400) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  }

});

/* ---- Scroll to Top ---- */
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ---- Cursor Glow Effect ---- */
document.addEventListener('mousemove', function(e) {
  const glow = document.getElementById('cursorGlow');
  if (!glow) return;
  // Only on desktop
  if (window.innerWidth > 992) {
    glow.style.transform = 'translate(' + (e.clientX - 150) + 'px, ' + (e.clientY - 150) + 'px)';
  }
});

/* ---- Skeleton Loading Helper ---- */
function showSkeleton(containerId, count = 3) {
  const container = document.getElementById(containerId);
  if (!container) return;
  let html = '';
  for (let i = 0; i < count; i++) {
    html += '<div class="glass skeleton-card">' +
      '<div class="skeleton-line skeleton"></div>' +
      '<div class="skeleton-line skeleton"></div>' +
      '<div class="skeleton-line skeleton"></div>' +
      '<div style="margin-top:12px;">' +
        '<span class="skeleton-badge skeleton"></span>' +
      '</div>' +
    '</div>';
  }
  container.innerHTML = html;
}

// Init on load
setTimeout(initScrollReveal, 500);

// Init floating labels on any form control on page load
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.form-control').forEach(el => {
    if (el.value.trim()) el.classList.add('filled');
  });
});

// EXPOSE TO WINDOW FOR INLINE ONCLICK OPTIONS
window.loadPublicFeed = loadPublicFeed;
window.loadPublicFeedPreview = loadPublicFeedPreview;
window.loadDraftReports = loadDraftReports;
window.loadSubmittedReports = loadSubmittedReports;
window.editDraft = editDraft;
window.deleteReport = deleteReport;
window.submitDraft = submitDraft;
window.openReportModal = openReportModal;
window.toggleRekap = toggleRekap;
window.loadDashboardData = loadDashboardData;
window.showToast = showToast;
window.toggleMobileSidebar = toggleMobileSidebar;
window.scrollToTop = scrollToTop;
window.initScrollReveal = initScrollReveal;
window.showSkeleton = showSkeleton;