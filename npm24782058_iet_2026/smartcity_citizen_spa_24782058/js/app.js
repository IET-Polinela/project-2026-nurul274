// js/app.js

console.log("Smart City Citizen SPA Loaded");

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

// Logout
function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');

    window.location.hash = '#login';
}

// Ambil statistik dashboard
async function loadDashboardData() {
    const response = await requestAPI(
        '/api/report/?tab=my_reports&page_size=1000'
    );

    if (!response.ok) return;

    const reports = response.data.results || [];

    const stats = {
        DRAFT: 0,
        REPORTED: 0,
        VERIFIED: 0,
        IN_PROGRESS: 0,
        RESOLVED: 0
    };

    reports.forEach(report => {
        if (stats[report.status] !== undefined) {
            stats[report.status]++;
        }
    });

    console.log('Statistik:', stats);

    return stats;
}

// Feed publik
async function loadPublicFeed(page = 1) {

    const response = await requestAPI(
        `/api/report/?tab=feed&page=${page}`
    );

    if (!response.ok) return [];

    return response.data.results || [];
}

// Laporan saya
async function loadMyReports(page = 1) {

    const response = await requestAPI(
        `/api/report/?tab=my_reports&page=${page}`
    );

    if (!response.ok) return [];

    return response.data.results || [];
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

    return response;
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
        alert('Laporan berhasil dikirim');
    }

    return response;
}

// Profil
async function loadProfile() {

    try {

        const response = await requestAPI(
            '/profile/'
        );

        if (response.ok) {
            return response.data;
        }

    } catch (error) {
        console.log('Profile endpoint tidak tersedia');
    }

    return null;
}