import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import styles from "../styles/Login.module.css";
import Footer from '../components/Footer';

const Register = () => {
    const [ email, setEmail ] = useState('');
    const [ password, setPassword ] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/auth/register', {
                email,
                password
            });
            alert("User registered successfully");
            navigate('/login');
        }catch(err) {
            alert("Error registering user");
        }
    }

    return (
        <div className={styles.loginContainer}>
            <div className={styles.loginBox}>
                <h2>Registrarse</h2>
                <form className={styles.loginForm} onSubmit={handleRegister}>
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
                        Registrarse
                    </button>
                    <Link to="/login" className={styles.loginLink}>
                        ¿Ya tienes una cuenta? Inicia sesión
                    </Link>
                </form>
            </div>
            <Footer />
        </div>
    );
};

export default Register;