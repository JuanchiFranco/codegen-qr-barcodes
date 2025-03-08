import React from "react";
import { useNavigate } from "react-router-dom";
import "./App.css"; // Asegúrate de importar los estilos

function App() {
  const navigate = useNavigate();

  return (
    <div className="app-container">
      <div className="intro-container">
        <h1>Bienvenido a CodeGen</h1>
        <p>
          Una aplicación para generar códigos QR y códigos de barras de manera
          rápida y sencilla. Guarda tu historial, exporta e imprime con un clic.
        </p>
        <div className="button-group">
          <button onClick={() => navigate("/login")}>Iniciar Sesión</button>
          <button className="register-btn" onClick={() => navigate("/register")}>
            Registrarse
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;