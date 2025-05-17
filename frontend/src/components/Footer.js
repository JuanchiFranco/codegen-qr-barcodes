import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import styles from '../styles/Footer.module.css';

const Footer = () => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!mounted) return null;

    return ReactDOM.createPortal(
        <footer className={styles.footer}>
            <div className={styles.container}>
                <p>© {new Date().getFullYear()} QR & Barcode Generator. Todos los derechos reservados.</p>
            </div>
        </footer>,
        document.body
    );
};

export default Footer;
