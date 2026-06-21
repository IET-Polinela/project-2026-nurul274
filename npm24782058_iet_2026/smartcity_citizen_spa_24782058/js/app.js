// js/app.js

console.log("Smart City Citizen SPA Loaded");
let editingReportId = null;
let reportChart = null;

async function editDraft(id) {

    const report =
        await getReport(id);

    editingReportId = id;

    document.getElementById(
        'title'
    ).value = report.title;

    document.getElementById(
        'category'
    ).value = report.category;

    document.getElementById(
        'location'
    ).value = report.location;

    document.getElementById(
        'description'
    ).value = report.description;

    openReportModal();

}

// Warna badge status
function getStatusBadge(status) {
    const badges = {
        DRAFT: 'secondary',
        REPORTED: 'primary',
        VERIFIED: 'info',
        IN_PROGRESS: 'warning',
        RESOLVED: 'success'
    };

    return `
        <span class="badge bg-${badges[status] || 'dark'}">
            ${status}
        </span>
    `;
}

// Ambil statistik dashboard
async function loadDashboardData() {

    const response =
        await requestAPI(
            '/api/report/?tab=my_reports&page_size=1000'
        );

    if (!response.ok) return;

    const reports =
        response.data.results || [];

    const stats = {

        DRAFT: 0,
        REPORTED: 0,
        VERIFIED: 0,
        IN_PROGRESS: 0,
        RESOLVED: 0

    };

    reports.forEach(report => {

        if (
            stats[report.status] !== undefined
        ) {

            stats[report.status]++;

        }

    });

    document.getElementById(
        'totalReport'
    ).innerText = reports.length;

    document.getElementById(
        'resolvedReport'
    ).innerText = stats.RESOLVED;

    const ctx =
        document.getElementById(
            'reportChart'
        );

    if (!ctx) return;

    if (reportChart) {
        reportChart.destroy();
    }

    if (!ctx) return;

    reportChart = new Chart(ctx, {

        type: 'doughnut',

        data: {

            labels: [
                'Draft',
                'Reported',
                'Verified',
                'In Progress',
                'Resolved'
            ],

            datasets: [{

                data: [

                    stats.DRAFT,
                    stats.REPORTED,
                    stats.VERIFIED,
                    stats.IN_PROGRESS,
                    stats.RESOLVED

                ]

            }]

        }

    });

}

function getProgress(status){

    const progress = {

        DRAFT:20,
        REPORTED:40,
        VERIFIED:60,
        IN_PROGRESS:80,
        RESOLVED:100

    };

    return progress[status] || 0;
}

// Feed publik
async function loadPublicFeed(page = 1) {

    const response = await requestAPI(
        `/api/report/?tab=feed&page=${page}`
    );

    if (!response.ok) return [];

    const reports = response.data.results || [];
    renderReports(reports);
    return reports;
}

// Laporan saya
async function loadMyReports(page = 1) {

    const response = await requestAPI(
        `/api/report/?tab=my_reports&page=${page}`
    );

    if (!response.ok) return [];

    const reports = response.data.results || [];
    renderReports(reports);
    return reports;

}

// Detail laporan
async function getReport(id) {

    const response = await requestAPI(
        `/api/report/${id}/`
    );

    return response.data;
}

// Tambah laporan
async function createReport(data) {

    return await requestAPI(
        '/api/report/',
        'POST',
        data
    );
}

function openReportModal() {

    document.getElementById('reportForm').reset();

    const modal = new bootstrap.Modal(
        document.getElementById('reportModal')
    );

    modal.show();

}

// Edit laporan
async function updateReport(id, data) {

    return await requestAPI(
        `/api/report/${id}/`,
        'PUT',
        data
    );
}

// Hapus laporan
async function deleteReport(id) {

    if (!confirm('Hapus laporan?')) return;

    const response = await requestAPI(
        `/api/report/${id}/`,
        'DELETE'
    );

    if (response.ok) {

        alert('Laporan berhasil dihapus');

    await Promise.all([
        loadMyReports(),
        loadDashboardData(),
        loadPublicFeed()
    ]);
        loadMyReports();
        loadDashboardData();

    } else {

        alert(
            JSON.stringify(
                response.data
            )
        );

    }

}

// Simpan draft
async function saveDraft(data) {

    data.status = 'DRAFT';

    return await createReport(data);
}

// Kirim draft
async function submitDraft(id) {

    const response = await requestAPI(
        `/reports/${id}/update-status/`,
        'POST',
        {
            status: 'REPORTED'
        }
    );

    if (response.ok) {

        alert(
            'Draft berhasil dikirim'
        );

    await Promise.all([
        loadMyReports(),
        loadDashboardData(),
    ]);
        await loadMyReports();
        await loadDashboardData();
       

    } else {

        alert(
            JSON.stringify(
                response.data
            )
        );

    }

}

// Profil
async function loadProfile() {

    const username =
        localStorage.getItem(
            'username'
        ) || 'Warga';

    const email =
        localStorage.getItem(
            'email'
        ) || '-';

    const profileContainer =
        document.getElementById(
            'profileContainer'
        );

    profileContainer.innerHTML = `

        <div class="text-center">

            <i
                class="bi bi-person-circle"
                style="
                    font-size:120px;
                    color:#0d6efd;
                ">
            </i>

            <h3 class="mt-3">
                ${username}
            </h3>

            <p>
                ${email}
            </p>

            <p class="text-muted">

                Bergabung:
                ${new Date()
                    .toLocaleDateString(
                        'id-ID'
                    )}

            </p>

            <hr>

            <h5>
                Tentang Saya
            </h5>

            <p>

                Warga aktif pengguna
                Smart City Portal.

            </p>

        </div>

    `;
}

document.addEventListener(
    'DOMContentLoaded',
    () => {

        document
            .getElementById('btnDraft')
            ?.addEventListener(
                'click',
                async () => {

                    const data = {

                        title:
                            document.getElementById(
                                'title'
                            ).value,

                        category:
                            document.getElementById(
                                'category'
                            ).value,

                        location:
                            document.getElementById(
                                'location'
                            ).value,

                        description:
                            document.getElementById(
                                'description'
                            ).value
                    };

                    let response;

                    if (editingReportId) {
                        response =
                            await updateReport(
                                editingReportId,
                                {
                                    ...data,
                                    status: 'DRAFT'
                                }
                            );
                        
                        editingReportId = null; 
                        } else {
                            response = await saveDraft(data);
                        }
                    
                    console.log(data, response);


                    if (response.ok) {

                        alert(
                            'Draft berhasil disimpan'
                        );

                        bootstrap.Modal
                            .getInstance(
                                document.getElementById(
                                    'reportModal'
                                )
                            )
                            .hide();

                        loadMyReports();

                    } else {

                        alert(
                            JSON.stringify(
                                response.data
                            )
                        );

                    }

                }
            );

        document
            .getElementById('btnSubmit')
            ?.addEventListener(
                'click',
                submitReport
            );

    }
);
  

async function submitReport() {

    const data = {

        title:
            document.getElementById(
                'title'
            ).value,

        category:
            document.getElementById(
                'category'
            ).value,

        location:
            document.getElementById(
                'location'
            ).value,

        description:
            document.getElementById(
                'description'
            ).value,

        status: 'REPORTED'

    };

    let response;

    if (editingReportId) {
        response = 
            await updateReport(
                editingReportId,
                data
            );

        editingReportId = null;
    } else {
        response = await createReport(data);
    }

    if (response.ok) {

        alert(
            'Laporan berhasil dibuat'
        );

        bootstrap.Modal
            .getInstance(
                document.getElementById(
                    'reportModal'
                )
            )
            .hide();

    await Promise.all([
        loadMyReports(),
        loadDashboardData(),
        loadPublicFeed()
    ]);

    } else {

        alert(
            JSON.stringify(
                response.data
            )
        );

    }

}

function renderReports(reports) {

    const container =
        document.getElementById(
            'reportContainer'
        );

    if (reports.length === 0) {

        container.innerHTML = `
            <div class="alert alert-info">
                Belum ada laporan.
            </div>
        `;

        return;
    }

    container.innerHTML =
        reports.map(report => `

            <div class="card mb-3 shadow-sm">

                <div class="card-body">

                    <h5>${report.title}</h5>

                    <p>
                        ${report.description}
                    </p>

                    <p>
                        <b>Kategori:</b>
                        ${report.category}
                    </p>

                    <p>
                        <b>Lokasi:</b>
                        ${report.location}
                    </p>

                    ${getStatusBadge(
                        report.status
                    )}

                    <div class="progress mt-3">

                        <div
                            class="progress-bar
                            ${report.status === 'DRAFT' ? 'bg-secondary' : ''}
                            ${report.status === 'REPORTED' ? 'bg-primary' : ''}
                            ${report.status === 'VERIFIED' ? 'bg-info' : ''}
                            ${report.status === 'IN_PROGRESS' ? 'bg-warning' : ''}
                            ${report.status === 'RESOLVED' ? 'bg-success' : ''}"
                            role="progressbar"
                            style="width:${getProgress(report.status)}%">
                            ${getProgress(report.status)}%
                        </div>

                    </div>


                    <hr>

                    ${report.is_owner &&
                    report.status === 'DRAFT'
                    ? `
                        <button
                            class="btn btn-warning btn-sm"
                            onclick="editDraft(${report.id})">

                            Edit

                        </button>

                        <button
                            class="btn btn-danger btn-sm"
                            onclick="deleteReport(${report.id})">

                            Hapus

                        </button>

                        <button
                            class="btn btn-success btn-sm"
                            onclick="submitDraft(${report.id})">

                            Kirim

                        </button>
                    `
                    : ''}

                </div>

            </div>

        `).join('');
}

async function loadDraftReports() {

    const reports =
        await loadMyReports();

    const drafts =
        reports.filter(
            report =>
                report.status === 'DRAFT'
        );

    renderReports(drafts);
}

async function loadSubmittedReports() {

    const reports =
        await loadMyReports();

    const submitted =
        reports.filter(
            report =>
                report.status !== 'DRAFT'
        );

    renderReports(submitted);
}