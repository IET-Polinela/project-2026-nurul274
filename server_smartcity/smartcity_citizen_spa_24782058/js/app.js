console.log("SPA Loaded");

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

const BADGE = {
    DRAFT: "secondary",
    REPORTED: "primary",
    VERIFIED: "info",
    IN_PROGRESS: "warning",
    RESOLVED: "success"
};

// ================= HELPERS =================
const progress = s => STATUS[s] || 0;
const badge = s => `<span class="badge bg-${BADGE[s] || 'dark'}">${s}</span>`;

// ================= DASHBOARD =================
async function loadDashboardData() {
    const res = await requestAPI('/api/report/?tab=my_reports&page_size=1000');
    if (!res.ok) return;

    const data = res.data.results || [];
    const s = { DRAFT:0, REPORTED:0, VERIFIED:0, IN_PROGRESS:0, RESOLVED:0 };

    data.forEach(r => s[r.status]++);

    if(document.getElementById("draftCount")){
        document.getElementById("draftCount").innerText = s.DRAFT;
    }
    document.getElementById("reportedCount")?.replaceChildren(document.createTextNode(s.REPORTED));
    document.getElementById("verifiedCount")?.replaceChildren(document.createTextNode(s.VERIFIED));
    document.getElementById("progressCount")?.replaceChildren(document.createTextNode(s.IN_PROGRESS));
    document.getElementById("resolvedCount")?.replaceChildren(document.createTextNode(s.RESOLVED));
    document.getElementById("totalReport")?.replaceChildren(document.createTextNode(data.length));
    document.getElementById("resolvedReport")?.replaceChildren(document.createTextNode(s.RESOLVED));

    const ctx = document.getElementById("reportChart");
    if (!ctx) return;

    chart?.destroy();
    chart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: Object.keys(s),
            datasets: [{ data: Object.values(s) }]
        }
    });
}

// ================= RENDER =================
function renderReports(data) {
    const el = document.getElementById("reportContainer");
    if (!el) return;

    if (!data.length)
        return el.innerHTML = `<div class="alert alert-info">Tidak ada laporan</div>`;

    const isAdmin = localStorage.getItem("is_admin") === "true";

    el.innerHTML = data.map(r => {
        let btn = "";

        // USER ACTION
        if (r.status === "DRAFT") {
            btn += `
                <button class="btn btn-warning btn-sm" onclick="editDraft(${r.id})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteReport(${r.id})">Hapus</button>
                <button class="btn btn-success btn-sm" onclick="submitDraft(${r.id})">Kirim</button>
            `;
        }

        // ADMIN ACTION
        if (isAdmin) {
            if (r.status === "REPORTED")
                btn += `<button class="btn btn-primary btn-sm" onclick="updateStatus(${r.id},'VERIFIED')">Verifikasi</button>`;

            if (r.status === "VERIFIED")
                btn += `<button class="btn btn-warning btn-sm" onclick="updateStatus(${r.id},'IN_PROGRESS')">Proses</button>`;

            if (r.status === "IN_PROGRESS")
                btn += `<button class="btn btn-success btn-sm" onclick="updateStatus(${r.id},'RESOLVED')">Selesai</button>`;
        }

        return `
        <div class="card mb-2">
            <div class="card-body">
                <h6>ID: ${r.id}<br>${r.title}</h6>
                <small>${r.description}</small>
                <div class="mt-2">${badge(r.status)}</div>
                <div class="progress mt-2">
                    <div class="progress-bar bg-primary" style="width:${progress(r.status)}%">
                        ${progress(r.status)}%
                    </div>
                </div>
                <div class="mt-2 d-flex gap-2 flex-wrap">
                    ${btn}
                </div>
            </div>
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

    container.innerHTML = (res.data.results || [])
        .slice(0,5)
        .map(r => `
            <div class="card mb-2 report-card">
                <div class="card-body">
                    <h6>${r.title}</h6>
                    <small>${r.location || ''}</small>
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
        await loadPublicFeed(); 
        await loadSubmittedReports();
        await loadDashboardData();
    } else {
        alert("Gagal update status: " + JSON.stringify(res.data));
    }
}

async function submitDraft(id){
    const res = await requestAPI(`/api/report/${id}/`, 'PATCH', { status: 'REPORTED' });

    if(res.ok){
        alert('Laporan berhasil dikirim');
        await loadSubmittedReports();
        await loadDashboardData();
        await loadPublicFeed();
        await loadDraftReports();
    } else {
        alert('Gagal mengirim laporan: ' + JSON.stringify(res.data));
    }
}

async function loadDraftReports(){
    const res = await requestAPI('/api/report/?tab=my_reports');
    if(!res.ok) return;

    renderReports(
        (res.data.results || []).filter(r => r.status === 'DRAFT')
    );
}

function loadProfile(){
    const container = document.getElementById('profileContainer');
    if(!container) return;

    container.innerHTML = `
        <h5>${localStorage.getItem('username')}</h5>
        <p>User Smart City Citizen</p>
    `;
}

async function editDraft(id){
    console.log("EDIT ID =", id);
    const res = await requestAPI(`/api/report/${id}/`);
    console.log("EDIT RESPONSE =", res);

    if(!res.ok){
        alert("Draft tidak ditemukan");
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
    if(!confirm('Hapus laporan ini?')) return;

    const res = await requestAPI(`/api/report/${id}/`, 'DELETE');

    if(res.ok){
        await loadDraftReports();
        await loadDashboardData();
        await loadPublicFeed();
    }else{
        alert('Gagal menghapus');
    }
}

function toggleRekap() {
    const content = document.getElementById('rekapContent');
    const arrow = document.getElementById('rekapArrow');
    if (!content) return;

    const isOpen = content.style.display === 'block';
    content.style.display = isOpen ? 'none' : 'block';
    arrow.innerHTML = isOpen ? '▼' : '▲';
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
            alert('Draft berhasil disimpan');
            bootstrap.Modal.getInstance(document.getElementById('reportModal'))?.hide();
            editingReportId = null;
            document.getElementById("reportForm").reset();
            await loadDraftReports();
            await loadDashboardData();
        } else {
            alert(JSON.stringify(res.data));
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
            alert('Laporan berhasil dikirim');
            bootstrap.Modal.getInstance(document.getElementById('reportModal'))?.hide();
            editingReportId = null;
            document.getElementById("reportForm").reset();
            await loadSubmittedReports();
            await loadDashboardData();
            await loadPublicFeed();
            await loadDraftReports();
        } else {
            alert(JSON.stringify(res.data));
        }
    }
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