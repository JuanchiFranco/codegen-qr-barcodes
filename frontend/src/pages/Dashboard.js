import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import * as htmlToImage from 'html-to-image';
import download from 'downloadjs'; 
import QRCode from 'react-qr-code';
import Barcode from 'react-barcode';
import styles from '../styles/Dashboard.module.css';

const API_URL = process.env.REACT_APP_API_URL;

const Dashboard = () => {
    const [data, setData] = useState('');
    const [type, setType] = useState('QR');
    const [history, setHistory] = useState([]);
    const [logos, setLogos] = useState({});
    const navigate = useNavigate();
    const qrRef = useRef(null);
    const fileInputRef = useRef(null);

    const handleLogoUpload = (e, codeId) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogos(prevLogos => ({
                    ...prevLogos,
                    [codeId]: reader.result
                }));
            };
            reader.readAsDataURL(file);
            e.target.value = null;
        }
    };

    const removeLogo = (codeId) => {
        setLogos(prevLogos => {
            const newLogos = { ...prevLogos };
            delete newLogos[codeId];
            return newLogos;
        });
    };

    const exportAsImage = (id) => {
        const element = document.getElementById(`qr-${id}`);
        htmlToImage.toPng(element)
            .then((dataUrl) => {
                download(dataUrl, `code_${id}.png`);
            })
            .catch((err) => {
                alert('Error al exportar la imagen');
            });
    };

    const printCode = (id) => {
        const element = document.getElementById(`qr-${id}`);
        htmlToImage.toPng(element)
            .then((dataUrl) => {
                let printWindow = window.open('', '_blank');
                printWindow.document.write('<img src="' + dataUrl + '" width="200"/>');
                printWindow.document.close();
                printWindow.print();
            })
            .catch((err) => {
                alert('Error al imprimir la imagen');
            });
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/codes/history`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setHistory(res.data);
        } catch (err) {
            alert('Error al cargar el historial');
        }
    };

    const generateCode = async () => {
        try {
            const token = localStorage.getItem('token');
            if (type === 'Barcode') {
                await axios.post(
                    `${API_URL}/codes/generate/barcode`,
                    { data },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else if (type === 'QR') {
                await axios.post(
                    `${API_URL}/codes/generate/qr`,
                    { data },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                alert('Tipo de código no válido');
            }
            fetchHistory();
        } catch (err) {
            alert('Error al generar el código');
        }
    };

    const deleteCode = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/codes/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchHistory();
        } catch (err) {
            alert('Error al eliminar el código');
        }
    };

    return (
        <div className={styles.container}>
            <h2>Generar Código</h2>
            <div className={styles.form}>
                <div className={styles.formControl}>
                    <input
                        type="text"
                        placeholder="Texto o URL"
                        value={data}
                        onChange={(e) => setData(e.target.value)}
                    />
                </div>
                <div className={styles.formControl}>
                    <select value={type} onChange={(e) => setType(e.target.value)}>
                        <option value="QR">Código QR</option>
                        <option value="Barcode">Código de Barras</option>
                    </select>
                </div>
                <div className={styles.formControl}>
                    <button className={styles.formButton} onClick={generateCode}>
                        Generar
                    </button>
                </div>
            </div>

            <h3>Historial</h3>
            <ul className={styles.list}>
                {history.map((code) => (
                    <li key={code.id} className={styles.listItem}>
                        <div style={{
                            textAlign: 'center',
                            fontSize: '14px',
                            color: '#333',
                            width: '200px',
                            margin: '0 auto 10px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            padding: '0 5px'
                        }}>
                            {code.type === 'QR' ? (
                                <a 
                                    href={code.data.startsWith('http') ? code.data : `https://${code.data}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    style={{
                                        color: '#0277bd',
                                        textDecoration: 'none'
                                    }}
                                >
                                    {code.data.length > 30 ? `${code.data.substring(0, 30)}...` : code.data}
                                </a>
                            ) : 'Código de Barras'}
                        </div>
                        <div id={`qr-${code.id}`} ref={qrRef} className={styles.qrContainer}>
                            {code.type === 'QR' ? (
                                <div style={{
                                    position: 'relative',
                                    width: '150px',
                                    height: '150px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0
                                    }}>
                                        <QRCode
                                            value={code.data}
                                            size={150}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'contain'
                                            }}
                                        />
                                    </div>
                                    {logos[code.id] && (
                                        <div style={{
                                            position: 'absolute',
                                            width: '20%',
                                            height: '20%',
                                            maxWidth: '30px',
                                            maxHeight: '30px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: 'white',
                                            borderRadius: '4px',
                                            padding: '2px',
                                            zIndex: 2
                                        }}>
                                            <img
                                                src={logos[code.id]}
                                                alt="Logo"
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'contain',
                                                    display: 'block'
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Barcode value={code.data} width={2} height={100} />
                            )}
                        </div>
                        <div className={styles.actions}>
                            {code.type === 'QR' && (
                                <div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleLogoUpload(e, code.id)}
                                        style={{ display: 'none' }}
                                        ref={fileInputRef}
                                        id={`logo-upload-${code.id}`}
                                    />
                                    <button
                                        onClick={() => document.getElementById(`logo-upload-${code.id}`).click()}
                                        className={styles.logoButton}
                                    >
                                        {logos[code.id] ? 'Cambiar Logo' : 'Añadir Logo'}
                                    </button>
                                    {logos[code.id] && (
                                        <button
                                            onClick={() => removeLogo(code.id)}
                                            className={styles.logoButton}
                                            style={{ backgroundColor: '#f44336' }}
                                        >
                                            Quitar Logo
                                        </button>
                                    )}
                                </div>
                            )}
                            <div className={styles.actionButtons}>
                                <button onClick={() => exportAsImage(code.id)}>Exportar</button>
                                <button onClick={() => printCode(code.id)}>Imprimir</button>
                                <button onClick={() => deleteCode(code.id)}>Eliminar</button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
            <div className={styles.logoutContainer}>
                <button className={styles.logoutButton} onClick={() => navigate('/')}>Cerrar Sesión</button>
            </div>
        </div>
    );
};

export default Dashboard;