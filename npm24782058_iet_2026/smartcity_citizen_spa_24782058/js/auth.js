function setupLoginForm() {
    const form = document.getElementById('loginForm');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const response = await requestAPI('/api/token/', 'POST', {
            username: document.getElementById('loginUsername').value,
            password: document.getElementById('loginPassword').value
        });
        if (response.status === 200) {
            const data = await response.json();
            localStorage.setItem('access_token', data.access);
            window.location.hash = '#dashboard';
            location.reload();
        } else { alert('Gagal login!'); }
    });
}

function logout() {
    localStorage.removeItem('access_token');
    window.location.hash = '#login';
    location.reload();
}