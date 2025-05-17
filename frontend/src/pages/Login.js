import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import styles from "../styles/Login.module.css";
import Footer from '../components/Footer';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            alert('Inicio de sesión exitoso');
            navigate('/dashboard');
        } catch (err) {
            alert('Error al iniciar sesión');
        }
    };

    return (
        <div className={styles.loginContainer}>
            <div className={styles.loginBox}>
                <h2>Iniciar Sesión</h2>
                <form className={styles.loginForm} onSubmit={handleLogin}>
                    <input
                        type="email"
                        placeholder="Email"
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
                    <button type="submit" className={styles.loginButton}>
                        Iniciar sesión
                    </button>
                    <Link to="/register" className={styles.loginLink}>
                        ¿No tienes una cuenta? Regístrate
                    </Link>
                </form>
            </div>
            <Footer />
        </div>
    );
};

export default Login;