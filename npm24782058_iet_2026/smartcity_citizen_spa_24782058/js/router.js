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

                <hr>

                <a href="#register" class="text-center">
                    Belum punya akun? Register
                </a>
            </div>
        </div>
    `,

    '#register': `
        <div class="d-flex justify-content-center align-items-center min-vh-100">
            <div class="card p-4 shadow-sm" style="width: 350px;">
                <h4 class="text-center fw-bold mb-4">Register</h4>

                <form id="registerForm">

                    <input type="text"
                        id="registerUsername"
                        class="form-control mb-3"
                        placeholder="Username"
                        required>

                    <input type="email"
                        id="registerEmail"
                        class="form-control mb-3"
                        placeholder="Email"
                        required>

                    <input type="password"
                        id="registerPassword"
                        class="form-control mb-3"
                        placeholder="Password"
                        required>

                    <button type="submit"
                        class="btn btn-success w-100 fw-bold">
                        Register
                    </button>

                </form>

                <hr>

                <a href="#login" class="text-center">
                    Sudah punya akun? Login
                </a>

            </div>
        </div>
    `,

    '#dashboard': `
<h3>Dashboard Warga</h3>

<div class="row g-4 mt-2">

    <div class="col-md-6">
        <div class="card bg-primary text-white p-4 shadow-sm">
            <h6>Total Laporan Anda</h6>
            <h3 id="totalReport">0</h3>
        </div>
    </div>

    <div class="col-md-6">
        <div class="card bg-success text-white p-4 shadow-sm">
            <h6>Laporan Selesai</h6>
            <h3 id="resolvedReport">0</h3>
        </div>
    </div>

</div>

<div class="card mt-4 shadow-sm p-4">

    <h5>Statistik Status Laporan</h5>

    <canvas id="reportChart"></canvas>

</div>
`,

'#laporan': `
    <div class="d-flex justify-content-between align-items-center mb-4">

        <div>
            <h2 class="fw-bold mb-1">
                📋 Laporan Warga
            </h2>

            <p class="text-muted">
                Kelola laporan, draft, dan feed publik
            </p>
        </div>

        <button
            class="btn btn-primary shadow"
            onclick="openReportModal()">

            <i class="bi bi-plus-circle me-2"></i>
            Tambah Laporan

        </button>

    </div>


    <div class="row g-3 mb-4">

        <div class="col-md-4">

            <div class="card shadow-sm p-3 report-menu"
                onclick="loadPublicFeed()"
                style="cursor:pointer">

                <h5>📢 Feed Publik</h5>

                <small class="text-muted">
                    Semua laporan warga
                </small>

            </div>

        </div>


        <div class="col-md-4">

            <div class="card shadow-sm p-3 report-menu"
                onclick="loadSubmittedReports()"
                style="cursor:pointer">

                <h5>📄 Laporan Saya</h5>

                <small class="text-muted">
                    Laporan yang telah dikirim
                </small>

            </div>

        </div>


        <div class="col-md-4">

            <div class="card shadow-sm p-3 report-menu"
                onclick="loadDraftReports()"
                style="cursor:pointer">

                <h5>📝 Draft Saya</h5>

                <small class="text-muted">
                    Draft yang belum dikirim
                </small>

            </div>

        </div>

    </div>

    <div
        id="reportContainer"
        class="mt-3">
    </div>
`,

    '#profil': `

    <h3 class="mb-4">
        👤 Profil Saya
    </h3>

    <div
        id="profileContainer"
        class="card shadow-sm p-4 ">

        memuat data profil...
    </div>
    `
        
};

function handleRouting() {

    const hash =
        window.location.hash || '#login';

    const sidebar =
        document.getElementById('sidebar');

    const content =
        document.getElementById('app-content');

    const token =
        localStorage.getItem('access_token');

    if (!token &&
        hash !== '#login' &&
        hash !== '#register') {

        window.location.hash = '#login';
        return;

    }

    if (token &&
        (hash === '#login' ||
        hash === '#register')) {

        window.location.hash =
            '#dashboard';

        return;
    }

    if (sidebar) {
        sidebar.style.display =
            token ? 'block' : 'none';
    }

    content.innerHTML =
        routes[hash] ||
        routes['#login'];

    if (hash === '#login') {
        setupLoginForm();
    }

    if (hash === '#register') {
        setupRegisterForm();
    }

    if (hash === '#dashboard') {
        loadDashboardData();
    }

    if (hash === '#profil') {
        loadProfile();
    }

    if (hash === '#laporan') {
        loadPublicFeed();
    }
}

window.addEventListener(
    'hashchange',
    handleRouting
);

window.addEventListener(
    'DOMContentLoaded',
    handleRouting
);