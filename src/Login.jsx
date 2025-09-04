    import React, { useState } from 'react';

    const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
        const response = await fetch('https://novacodefc.com/users/login', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (response.ok && data.access_token && data.refresh_token) {
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('refresh_token', data.refresh_token);
            // Redirigir al dashboard o página principal
            window.location.href = '/';
        } else {
            setError(data.message || 'Credenciales incorrectas');
        }
        } catch (err) {
        setError('Error de conexión' + err.message);
        }
        setLoading(false);
    };

    return (
        <div className="login-container">
        <h2>Iniciar sesión</h2>
        <form onSubmit={handleSubmit}>
            <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            />
            <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            />
            <button type="submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
            {error && <p className="error">{error}</p>}
        </form>
        </div>
    );
    };

    export default Login;
