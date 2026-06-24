// js/app.js
console.log("SPA Loaded");

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

    draftCount.innerText = s.DRAFT;
    reportedCount.innerText = s.REPORTED;
    verifiedCount.innerText = s.VERIFIED;
    progressCount.innerText = s.IN_PROGRESS;
    resolvedCount.innerText = s.RESOLVED;

    totalReport.innerText = data.length;
    resolvedReport.innerText = s.RESOLVED;

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

                <h6>${r.title}</h6>
                <small>${r.description}</small>

                <div class="mt-2">${badge(r.status)}</div>

                <div class="progress mt-2">
                    <div class="progress-bar bg-primary"
                        style="width:${progress(r.status)}%">
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

// ================= STATUS UPDATE =================
async function updateStatus(id, status) {

    const res = await requestAPI(
        `/reports/${id}/update-status/`,
        "POST",
        { status }
    );

    if (res.ok) {
        loadPublicFeed();
        loadDashboardData();
    } else {
        alert(JSON.stringify(res.data));
    }
}

function toggleRekap() {

    const content =
        document.getElementById(
            'rekapContent'
        );

    const arrow =
        document.getElementById(
            'rekapArrow'
        );

    if (!content) return;

    const isOpen =
        content.style.display === 'block';

    content.style.display =
        isOpen ? 'none' : 'block';

    arrow.innerHTML =
        isOpen ? '▼' : '▲';
}

function openReportModal() {

    editingReportId = null;

    document
        .getElementById(
            'reportForm'
        )
        .reset();

    const modal =
        new bootstrap.Modal(
            document.getElementById(
                'reportModal'
            )
        );

    modal.show();
}

window.loadPublicFeed = loadPublicFeed;

if (typeof loadSubmittedReports !== "undefined")
    window.loadSubmittedReports = loadSubmittedReports;

if (typeof loadDraftReports !== "undefined")
    window.loadDraftReports = loadDraftReports;

window.openReportModal = openReportModal;

window.toggleRekap = toggleRekap;

window.editDraft = editDraft;
window.deleteReport = deleteReport;
window.submitDraft = submitDraft;
window.updateStatus = updateStatus;