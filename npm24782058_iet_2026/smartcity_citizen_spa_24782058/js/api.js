// js/api.js
async function requestAPI(endpoint, method = 'GET', bodyData = null) {
    const token = localStorage.getItem('access_token');
    const headers = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const options = { method, headers };
    if (bodyData) options.body = JSON.stringify(bodyData);

    const response = await fetch(`http://127.0.0.1:8000${endpoint}`, options);
    return response;
}