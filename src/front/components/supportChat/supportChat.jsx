import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './supportChat.css';
const apiUrl = import.meta.env.VITE_BACKEND_URL;



export const SupportChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sugerencias, setSugerencias] = useState([]);
  const [filtradas, setFiltradas] = useState([]);

  // Obtener sugerencias al cargar
  useEffect(() => {
    const fetchSugerencias = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/support/sugerencias`);
        setSugerencias(res.data);
      } catch (err) {
        console.error('Error al cargar sugerencias', err);
      }
    };

    fetchSugerencias();
  }, []);

  // Enviar mensaje al backend
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setFiltradas([]);

    try {
      const res = await axios.post(`${apiUrl}/api/support/chat`, {
        message: input
      });
      const botMsg = { sender: 'bot', text: res.data.respuesta };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      const botMsg = { sender: 'bot', text: 'Error del servidor. Intenta más tarde.' };
      setMessages(prev => [...prev, botMsg]);
    }
  };

  // Manejo de input y filtrado de sugerencias
  const handleInputChange = (e) => {
    const valor = e.target.value;
    setInput(valor);

    if (valor.length > 1) {
      const coincidencias = sugerencias.filter(pregunta =>
        pregunta.toLowerCase().includes(valor.toLowerCase())
      );
      setFiltradas(coincidencias);
    } else {
      setFiltradas([]);
    }
  };

  // Selección de sugerencia
  const seleccionarSugerencia = (texto) => {
    setInput(texto);
    setFiltradas([]);
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.sender} d-block`} >
            {msg.text.includes(".png") || msg.text.includes(".jpg") || msg.text.includes(".jpeg") || msg.text.includes(".gif") ? (
              <img
                src={msg.text}
                alt="Imagen enviada"
                style={{ maxWidth: '200px', borderRadius: '10px' }}
              />
            ) : msg.text.includes(".mp4") || msg.text.includes(".webm") || msg.text.includes(".ogg") ? (
              <video
                controls
                style={{ maxWidth: '200px', borderRadius: '10px' }}
              >
                <source src={msg.text} type={`video/${msg.text.split('.').pop()}`} />
                Tu navegador no soporta la reproducción de video.
              </video>
            ) : (
              <span>{msg.text}</span>
            )}
            
          
          </div>
        ))}
      </div>
      <div className="input-box">
        <div className="input-wrapper">
          <input
            type="text"
            placeholder="Escribe tu pregunta..."
            value={input}
            onChange={handleInputChange}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
          />
          {filtradas.length > 0 && (
            <div className="autocomplete">
              {filtradas.map((s, i) => (
                <div key={i} className="suggestion" onClick={() => seleccionarSugerencia(s)}>
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>
        <button onClick={sendMessage}>Enviar</button>
      </div>
    </div>
  );
};


