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
    const [logo, setLogo] = useState(null);
    const navigate = useNavigate();
    const qrRef = useRef(null);

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if(file){
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogo(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const exportAsImage = (id) => {
        const element = document.getElementById(`qr-${id}`);
        htmlToImage.toPng(element)
            .then((dataUrl) => {
                download(dataUrl, `code_${id}.png`);
            })
            .catch((err) => {
                alert('Error to export image');
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
                alert('Error to print image');
            });
    };

    const removeLogo = () => {
        setLogo(null);
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
            alert('Error to fetch history');
        }
    };

    const generateCode = async () => {
        try{
            const token = localStorage.getItem('token');
            if(type === 'Barcode'){
                await axios.post(
                    `${API_URL}/codes/generate/barcode`,
                    { data },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }else if(type === 'QR'){
                await axios.post(
                    `${API_URL}/codes/generate/qr`,
                    { data },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }else{
                alert('Invalid type');
            }
            fetchHistory();
        }catch(err){
            alert('Error to generate code');
        }
    };

    const deleteCode = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/codes/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchHistory();
        } catch (err) {
            alert('Error to delete code');
        }
    };

    return (
        <div className={styles.container}>
            <h2 style={{ display: 'flex', justifyContent: 'center'}}>Generar Código</h2>
            <div style={{ display: 'flex', justifyContent: 'center'}}>
                <input type="text" placeholder="Texto o URL" onChange={(e) => setData(e.target.value)} />
                <select value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="QR">QR</option>
                    <option value="Barcode">Barcode</option>
                </select>
                <button onClick={generateCode}>Generar</button>
            </div>

            <h3 style={{ display: 'flex', justifyContent: 'center'}}>Historial</h3>
            
            <div style={{ display: 'flex', justifyContent: 'center'}}>
                <input type="file" accept="image/*" onChange={handleLogoUpload} />
                {logo && <button onClick={removeLogo}>Eliminar Logo</button>}
            </div>

            <ul className={styles.list}>
                {history.map((code) => (
                    <li key={code.id} className={styles.listItem}>
                        
                        
                        <div style={{display: 'flex', justifyContent: 'center'}}>{code.type === 'QR' ? (code.data.split("//")[1].split(".")[1]) : code.type}</div>
                        <div id={`qr-${code.id}`} ref={qrRef} className={styles.qrContainer}>
                            {code.type === 'QR' ? (
                                <div style={{ width: '150px', height: '150px' }}>
                                    <QRCode value={code.data} size={150} />
                                    {logo && (
                                        <img
                                        src={logo}
                                        alt="Logo"
                                        style={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            width: '30%',
                                            height: '30%',
                                            maxWidth: '40px',
                                            maxHeight: '40px',
                                            borderRadius: '10px',
                                            background: 'white',
                                            padding: '2px'
                                        }}
                                        />
                                    )}
                                </div>
                            ) : (
                                <Barcode value={code.data} width={2} height={100} />
                            )}
                        </div>
                        <div className={styles.actions}>
                            <button onClick={() => exportAsImage(code.id)}>Export</button>
                            <button onClick={() => printCode(code.id)}>Print</button>
                            <button onClick={() => deleteCode(code.id)}>Delete</button>
                        </div>
                    </li>
                ))}
            </ul>
            <div className={styles.actions}>
                <button onClick={() => navigate('/')}>Logout</button>
            </div>
        </div>
    );
};

export default Dashboard;