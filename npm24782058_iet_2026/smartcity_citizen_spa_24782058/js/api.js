// js/api.js

const BASE_URL = 'http://127.0.0.1:8000';

async function requestAPI(endpoint, method = 'GET', bodyData = null) {
    const token = localStorage.getItem('access_token');

    const headers = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
        method,
        headers
    };

    if (bodyData) {
        options.body = JSON.stringify(bodyData);
    }

    try {
        const response = await fetch(
            `${BASE_URL}${endpoint}`,
            options
        );

        // Token expired
        if (response.status === 401) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');

            alert('Session habis. Silakan login kembali.');

            window.location.hash = '#login';

            throw new Error('Unauthorized');
        }

        const data = await response.json().catch(() => ({}));

        return {
            ok: response.ok,
            status: response.status,
            data: data
        };

    } catch (error) {
        console.error('API Error:', error);

        return {
            ok: false,
            status: 500,
            data: {
                detail: 'Terjadi kesalahan koneksi.'
            }
        };
    }
}