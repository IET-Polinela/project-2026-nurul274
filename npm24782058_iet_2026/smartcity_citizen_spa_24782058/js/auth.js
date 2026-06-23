// js/auth.js

function setupLoginForm() {

    const form =
        document.getElementById(
            'loginForm'
        );

    if (!form) return;

    document
        .getElementById(
            'loginUsername'
        )
        ?.focus();

    form.addEventListener(
        'submit',
        async (e) => {

            try {

                e.preventDefault();

                const username =
                    document.getElementById(
                        'loginUsername'
                    ).value;

                const password =
                    document.getElementById(
                        'loginPassword'
                    ).value;

                const response =
                    await requestAPI(
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

                    localStorage.setItem(
                        'username',
                        username
                    );
                
                    if(username === 'nurul'
                    ) {
                        localStorage.setItem(
                            'is_admin',
                            'true'
                        );
                    } else {
                        localStorage.setItem(
                            'is_admin',
                            'false'
                        );
                    }

                    alert(
                        'Login berhasil'
                    );

                    window.location.hash =
                        '#dashboard';

                } else {

                    alert(
                        response.data.detail ||
                        'Username atau password salah'
                    );

                }

            } catch(error) {

                console.error(error);

                alert(
                    'Periksa Kembali Password dan Username Anda'
                );

            }

        }
    );

}

// Register
function setupRegisterForm() {

    const form =
        document.getElementById('registerForm');

    if (!form) return;

    form.addEventListener('submit', async (e) => {

        try {

            e.preventDefault();

            const username =
                document.getElementById('registerUsername').value;

            if (!username.trim()) {
                alert('Username tidak boleh kosong');
                return;
            }

            const email =
                document.getElementById('registerEmail').value;

            if (!email.includes('@')) {
                alert('Email tidak valid');
                return;
            }

            const password =
                document.getElementById('registerPassword').value;

            if (password.length < 8) {
                alert('Password harus minimal 8 karakter');
                return;
            }

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

                alert('Registrasi berhasil. Silakan login.');

                window.location.hash = '#login';

            } else {

                let msg = 'Registrasi gagal';

                if (response.data) {
                    msg = Object.values(response.data).flat().join('\n');
                }

                alert(msg);
            }

        } catch (error) {

            console.error(error);

            alert('Server tidak dapat dihubungi');
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

    localStorage.removeItem(
        'username'
    );

    localStorage.removeItem(
        'is_admin'
    );

    localStorage.removeItem(
        'email'
    );

    window.location.hash = '#login';
}


// Cek login
function isAuthenticated() {

    return !!localStorage.getItem(
        'access_token' 
    );
}