// js/auth.js

function setupLoginForm() {

    const form = document.getElementById('loginForm');

    if (!form) return;

    form.addEventListener('submit', async (e) => {

        e.preventDefault();

        const username =
            document.getElementById('loginUsername').value;

        const password =
            document.getElementById('loginPassword').value;

        const response = await requestAPI(
            '/api/token/',
            'POST',
            {
                username,
                password
            }
        );

        if (response.ok) {

            localStorage.setItem(
                'access_token',
                response.data.access
            );

            localStorage.setItem(
                'refresh_token',
                response.data.refresh
            );

            alert('Login berhasil');

            window.location.hash = '#dashboard';

        } else {

            alert(
                response.data.detail ||
                'Username atau password salah'
            );

        }

    });
}


// Register
function setupRegisterForm() {

    const form =
        document.getElementById('registerForm');

    if (!form) return;

    form.addEventListener('submit', async (e) => {

        e.preventDefault();

        const username =
            document.getElementById('registerUsername').value;

        const email =
            document.getElementById('registerEmail').value;

        const password =
            document.getElementById('registerPassword').value;

        const response = await requestAPI(
            '/api/register/',
            'POST',
            {
                username,
                email,
                password
            }
        );

        if (response.ok) {

            alert('Registrasi berhasil');

            window.location.hash = '#login';

        } else {

            let msg = 'Registrasi gagal';

            if (response.data) {

                msg = Object.values(
                    response.data
                ).flat().join('\n');

            }

            alert(msg);

        }

    });

}


// Logout
function logout() {

    localStorage.removeItem(
        'access_token'
    );

    localStorage.removeItem(
        'refresh_token'
    );

    window.location.hash = '#login';
}


// Cek login
function isAuthenticated() {

    return !!localStorage.getItem(
        'access_token'
    );

}