// js/auth.js

// ===============================
// LOGIN
// ===============================
function setupLoginForm() {
    const form = document.getElementById("loginForm");
    if (!form) return;

    document.getElementById("loginUsername")?.focus();

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        try {
            const username = document.getElementById("loginUsername").value;
            const password = document.getElementById("loginPassword").value;

            const response = await requestAPI(
                "/api/token/",
                "POST",
                {
                    username,
                    password
                }
            );

            if (response.ok) {
                localStorage.setItem("access_token", response.data.access);
                localStorage.setItem("refresh_token", response.data.refresh);
                localStorage.setItem("username", username);
                localStorage.setItem("is_admin", "false");

                showToast(`✅ Selamat datang, ${username}!`, "success");

                window.location.hash = "#dashboard";
            } else {
                showToast(
                    response.data.detail || "Username atau password salah",
                    "error"
                );
            }

        } catch (error) {
            console.error(error);
            showToast(
                "Terjadi kesalahan. Periksa koneksi Anda.",
                "error"
            );
        }
    });
}


// ===============================
// REGISTER
// ===============================
function setupRegisterForm() {
    const form = document.getElementById("registerForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        try {
            const username = document.getElementById("registerUsername").value.trim();
            const email = document.getElementById("registerEmail").value.trim();
            const password = document.getElementById("registerPassword").value;

            // Validasi
            if (!username) {
                showToast("Username tidak boleh kosong", "warning");
                return;
            }

            if (!email.includes("@")) {
                showToast("Email tidak valid", "warning");
                return;
            }

            if (password.length < 8) {
                showToast(
                    "Password harus minimal 8 karakter",
                    "warning"
                );
                return;
            }

            // Request Register
            const response = await requestAPI(
                "/api/register/",
                "POST",
                {
                    username,
                    email,
                    password
                }
            );

            if (response.ok) {
                showToast(
                    "✅ Registrasi berhasil! Silakan login.",
                    "success"
                );

                window.location.hash = "#login";
            } else {
                let message = "Registrasi gagal";

                if (response.data) {
                    message = Object.values(response.data)
                        .flat()
                        .join("\n");
                }

                showToast(message, "error");
            }

        } catch (error) {
            console.error(error);
            showToast(
                "Server tidak dapat dihubungi",
                "error"
            );
        }
    });
}


// ===============================
// LOGOUT
// ===============================
function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("username");
    localStorage.removeItem("is_admin");
    localStorage.removeItem("email");

    showToast("👋 Berhasil logout!", "info");

    window.location.hash = "#login";
}


// ===============================
// AUTH CHECK
// ===============================
function isAuthenticated() {
    return !!localStorage.getItem("access_token");
}
