const routes = {
    '#login': `
        <div class="d-flex justify-content-center align-items-center min-vh-100">
            <div class="card p-4 shadow-sm" style="width: 350px;">
                <h4 class="text-center fw-bold mb-4">Login Warga</h4>
                <form id="loginForm">
                    <input type="text" id="loginUsername" class="form-control mb-3" placeholder="Username" required>
                    <input type="password" id="loginPassword" class="form-control mb-3" placeholder="Password" required>
                    <button type="submit" class="btn btn-primary w-100 fw-bold">Masuk</button>
                </form>
            </div>
        </div>
    `,
    '#dashboard': `
        <h3>Dashboard Warga</h3>
        <div class="row g-4 mt-2">
            <div class="col-md-6"><div class="card bg-primary text-white p-4 shadow-sm"><h6>Total Laporan Anda</h6><h3>12</h3></div></div>
            <div class="col-md-6"><div class="card bg-success text-white p-4 shadow-sm"><h6>Laporan Selesai</h6><h3>8</h3></div></div>
        </div>
        <div class="card mt-4 shadow-sm p-4">
            <h5>Monitoring Laporan</h5>
            <table class="table table-hover mt-3">
                <thead class="table-light"><tr><th>No</th><th>Jenis Laporan</th><th>Status</th></tr></thead>
                <tbody><tr><td>1</td><td>Jalan Rusak</td><td><span class="badge bg-warning text-dark">Diproses</span></td></tr></tbody>
            </table>
        </div>
    `
};

function handleRouting() {
    const hash = window.location.hash || '#login';
    const sidebar = document.getElementById('sidebar');
    const content = document.getElementById('app-content');
    
    if (!localStorage.getItem('access_token') && hash !== '#login') {
        window.location.hash = '#login';
    } else if (localStorage.getItem('access_token') && hash === '#login') {
        window.location.hash = '#dashboard';
    }

    sidebar.style.display = localStorage.getItem('access_token') ? 'block' : 'none';
    content.innerHTML = routes[hash] || routes['#login'];
    if (hash === '#login') setupLoginForm();
}

window.addEventListener('hashchange', handleRouting);
window.addEventListener('DOMContentLoaded', handleRouting);