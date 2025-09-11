import React, { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";

// Componente único: conecta, lista chats, crea chats, carga historial con paginación, envía mensajes,
// indicadores de escritura y acuses de lectura efímeros. UI simple lista para copiar/pegar.
export default function ChatPage() {
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";
    const token = localStorage.getItem("token");

    // --- Socket ---
    const socket = useMemo(() => {
        return io(BACKEND_URL, {
            path: "/socket.io",
            transports: ["websocket"],
            autoConnect: false,
        });
    }, [BACKEND_URL]);

    const [connected, setConnected] = useState(false);
    const [userId, setUserId] = useState(null);
    const [errors, setErrors] = useState([]);

    // --- Chats y mensajes ---
    const [chats, setChats] = useState([]); // [{id,user_one,user_two,post_id}]
    const [activeChatId, setActiveChatId] = useState(null);

    // mensajes por chat: { [chatId]: [{id,chat_id,user_id,content}] }
    const [messagesByChat, setMessagesByChat] = useState({});
    // paginación: next_before_id por chat
    const [nextBeforeByChat, setNextBeforeByChat] = useState({});
    // writing indicators por chat: Set de user_ids escribiendo
    const [typingByChat, setTypingByChat] = useState({});

    // input mensaje actual
    const [text, setText] = useState("");
    const typingRef = useRef(false);
    const typingTimeout = useRef(null);
    const listRef = useRef(null);

    // --- Helpers ---
    const pushError = (msg) => setErrors((prev) => [...prev.slice(-3), String(msg)]);

    const ensureChatState = (chatId) => {
        setMessagesByChat((prev) => prev[chatId] ? prev : { ...prev, [chatId]: [] });
        setTypingByChat((prev) => prev[chatId] ? prev : { ...prev, [chatId]: new Set() });
    };

    const loadChats = () => socket.emit("list_chats");

    const joinChat = (chatId) => {
        socket.emit("join_chat", { chat_id: chatId });
    };

    const loadMessages = (chatId, beforeId = null, limit = 30) => {
        ensureChatState(chatId);
        const payload = { chat_id: chatId, limit };
        if (beforeId) payload.before_id = beforeId;
        socket.emit("get_messages", payload);
    };

    const sendMessage = () => {
        const content = text.trim();
        if (!content || !activeChatId) return;
        socket.emit("private_message", { chat_id: activeChatId, content });
        setText("");
        stopTyping();
    };

    const startTyping = () => {
        if (!activeChatId || typingRef.current) return;
        typingRef.current = true;
        socket.emit("typing", { chat_id: activeChatId, is_typing: true });
        if (typingTimeout.current) clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(stopTyping, 1500);
    };

    const stopTyping = () => {
        if (!activeChatId) return;
        typingRef.current = false;
        if (typingTimeout.current) clearTimeout(typingTimeout.current);
        socket.emit("typing", { chat_id: activeChatId, is_typing: false });
    };

    const emitReadUpTo = (chatId) => {
        const arr = messagesByChat[chatId] || [];
        if (!arr.length) return;
        // último mensaje del otro usuario
        const foreign = [...arr].reverse().find((m) => m.user_id !== userId);
        if (foreign) socket.emit("read_messages", { chat_id: chatId, up_to_id: foreign.id });
    };

    // --- Conexión y listeners ---
    useEffect(() => {
        function onConnect() {
            setConnected(true);
            socket.emit("identify", { token });
        }
        function onDisconnect() {
            setConnected(false);
        }

        function onError(e) {
            pushError(e?.msg || e || "Error desconocido");
        }

        function onIdentified(data) {
            setUserId(data?.user_id ?? null);
            loadChats();
        }

        function onChats(payload) {
            setChats(Array.isArray(payload) ? payload : []);
            // seleccionar primero si no hay activo
            if (!activeChatId && payload?.length) {
                const first = payload[0].id;
                setActiveChatId(first);
                joinChat(first);
                loadMessages(first);
            }
        }

        function onJoinedChat({ chat_id }) {
            // opcional feedback
        }

        function onChatCreated(chat) {
            setChats((prev) => [chat, ...prev]);
            setActiveChatId(chat.id);
            joinChat(chat.id);
            loadMessages(chat.id);
        }

        function onChatExists(chat) {
            // si ya existe, lo seleccionamos
            setActiveChatId(chat.id);
            joinChat(chat.id);
            loadMessages(chat.id);
        }

        function onNewMessage(m) {
            setMessagesByChat((prev) => {
                const list = prev[m.chat_id] || [];
                return { ...prev, [m.chat_id]: [...list, m] };
            });
            // auto-scroll si estamos en el chat activo
            if (m.chat_id === activeChatId && listRef.current) {
                listRef.current.scrollTop = listRef.current.scrollHeight;
            }
        }

        function onMessages({ chat_id, items, next_before_id }) {
            setMessagesByChat((prev) => {
                const cur = prev[chat_id] || [];
                const merged = [...items, ...cur];
                // evitar duplicados por id
                const seen = new Set();
                const dedup = merged.filter((x) => (seen.has(x.id) ? false : (seen.add(x.id), true)));
                return { ...prev, [chat_id]: dedup };
            });
            setNextBeforeByChat((prev) => ({ ...prev, [chat_id]: next_before_id }));
            // marcar leídos
            emitReadUpTo(chat_id);
            // si es primera carga del chat activo, bajar al final
            if (chat_id === activeChatId && listRef.current) {
                requestAnimationFrame(() => {
                    listRef.current.scrollTop = listRef.current.scrollHeight;
                });
            }
        }

        function onTyping({ chat_id, user_id: uid, is_typing }) {
            setTypingByChat((prev) => {
                const set = new Set(prev[chat_id] || []);
                if (is_typing) set.add(uid); else set.delete(uid);
                return { ...prev, [chat_id]: set };
            });
        }

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on("error", onError);

        socket.on("identified", onIdentified);
        socket.on("chats", onChats);
        socket.on("joined_chat", onJoinedChat);
        socket.on("chat_created", onChatCreated);
        socket.on("chat_exists", onChatExists);

        socket.on("new_message", onNewMessage);
        socket.on("messages", onMessages);
        socket.on("typing", onTyping);

        socket.connect();

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off("error", onError);
            socket.off("identified", onIdentified);
            socket.off("chats", onChats);
            socket.off("joined_chat", onJoinedChat);
            socket.off("chat_created", onChatCreated);
            socket.off("chat_exists", onChatExists);
            socket.off("new_message", onNewMessage);
            socket.off("messages", onMessages);
            socket.off("typing", onTyping);
            if (typingTimeout.current) clearTimeout(typingTimeout.current);
            socket.disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket]);

    // cambio de chat activo -> unirse, cargar historial inicial
    useEffect(() => {
        if (!activeChatId) return;
        ensureChatState(activeChatId);
        joinChat(activeChatId);
        if (!(messagesByChat[activeChatId]?.length)) {
            loadMessages(activeChatId);
        } else {
            emitReadUpTo(activeChatId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeChatId]);

    const createChat = (userTwo, postId) => {
        if (!userTwo || !postId) return;
        socket.emit("create_chat", { user_two: Number(userTwo), post_id: Number(postId) });
    };

    const handleLoadOlder = () => {
        const beforeId = nextBeforeByChat[activeChatId];
        if (beforeId) loadMessages(activeChatId, beforeId);
    };

    const typingOthers = Array.from(typingByChat[activeChatId] || []).filter((uid) => uid !== userId);

    return (
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", height: "80vh", gap: 12, padding: 12, fontFamily: "system-ui, Arial" }}>
            {/* Sidebar */}
            <aside style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 12, overflow: "auto" }}>
                <h3 style={{ margin: 0 }}>Chats</h3>
                <div style={{ fontSize: 12, color: connected ? "#16a34a" : "#ef4444" }}>
                    {connected ? "Conectado" : "Desconectado"}{userId ? ` · UID ${userId}` : ""}
                </div>

                <button onClick={loadChats} style={{ marginTop: 8, width: "100%" }}>Refrescar</button>

                <ul style={{ listStyle: "none", padding: 0, marginTop: 10 }}>
                    {chats.map((c) => (
                        <li key={c.id}>
                            <button
                                onClick={() => setActiveChatId(c.id)}
                                style={{
                                    width: "100%",
                                    textAlign: "left",
                                    padding: "8px 10px",
                                    marginBottom: 6,
                                    borderRadius: 8,
                                    border: c.id === activeChatId ? "2px solid #3b82f6" : "1px solid #e5e7eb",
                                    background: c.id === activeChatId ? "#eff6ff" : "white",
                                    cursor: "pointer",
                                }}
                                title={`Chat #${c.id} • post ${c.post_id}`}
                            >
                                <div style={{ fontWeight: 600 }}>Chat #{c.id}</div>
                                <div style={{ fontSize: 12, color: "#6b7280" }}>post: {c.post_id} · users: {c.user_one}–{c.user_two}</div>
                            </button>
                        </li>
                    ))}
                </ul>

                {/* Crear chat rápido */}
                <CreateChatForm onCreate={createChat} />

                {/* Errores */}
                {errors.length > 0 && (
                    <div style={{ marginTop: 12, fontSize: 12, color: "#b91c1c" }}>
                        <strong>Errores:</strong>
                        <ul style={{ margin: 0, paddingInlineStart: 16 }}>
                            {errors.map((e, i) => (<li key={i}>{e}</li>))}
                        </ul>
                    </div>
                )}
            </aside>

            {/* Panel principal */}
            <section style={{ border: "1px solid #e5e7eb", borderRadius: 10, display: "grid", gridTemplateRows: "auto 1fr auto", overflow: "hidden" }}>
                {/* Header */}
                <div style={{ padding: 12, borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                        <div style={{ fontWeight: 700 }}>Chat #{activeChatId ?? "—"}</div>
                        <div style={{ fontSize: 12, color: "#6b7280" }}>
                            {/* {activeChatId ? "Historial y mensajes en tiempo real" : "Selecciona un chat"} */}
                            {typingOthers.length > 0 && (
                                <div style={{ fontSize: 12, color: "#6b7280", padding: "4px 8px" }}>
                                    {typingOthers.length === 1 ? `Usuario ${typingOthers[0]} está escribiendo…` : `Varios usuarios están escribiendo…`}
                                </div>
                            )}
                        </div>
                    </div>
                    {activeChatId && (
                        <button onClick={handleLoadOlder} disabled={!nextBeforeByChat[activeChatId]}>
                            Cargar anteriores
                        </button>
                    )}
                </div>

                {/* Mensajes */}
                <div ref={listRef} style={{ padding: 12, overflow: "auto", background: "#fafafa" }}>
                    {(messagesByChat[activeChatId] || []).map((m) => (
                        <MessageBubble key={m.id} mine={m.user_id === userId} content={m.content} id={m.id} />
                    ))}
                </div>

                {/* Input */}
                <div style={{ display: "flex", gap: 8, padding: 12, borderTop: "1px solid #e5e7eb" }}>
                    <input
                        value={text}
                        onChange={(e) => {
                            setText(e.target.value);
                            if (e.target.value) startTyping(); else stopTyping();
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                sendMessage();
                            }
                        }}
                        placeholder={activeChatId ? "Escribe un mensaje" : "Selecciona un chat"}
                        disabled={!activeChatId}
                        style={{ flex: 1, borderRadius: 8, border: "1px solid #e5e7eb", padding: "10px 12px" }}
                    />
                    <button onClick={sendMessage} disabled={!activeChatId || !text.trim()}>
                        Enviar
                    </button>
                </div>
            </section>
        </div>
    );
}

function MessageBubble({ mine, content, id }) {
    return (
        <div style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start", marginBottom: 6 }}>
            <div
                title={`msg #${id}`}
                style={{
                    maxWidth: 560,
                    padding: "8px 10px",
                    borderRadius: 10,
                    border: "1px solid #e5e7eb",
                    background: mine ? "#dbeafe" : "white",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                }}
            >
                {content}
            </div>
        </div>
    );
}

function CreateChatForm({ onCreate }) {
    const [userTwo, setUserTwo] = useState("");
    const [postId, setPostId] = useState("");

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onCreate(userTwo, postId);
            }}
            style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #e5e7eb" }}
        >
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Crear chat</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 6 }}>
                <input
                    type="number"
                    placeholder="user_two"
                    value={userTwo}
                    onChange={(e) => setUserTwo(e.target.value)}
                    min={1}
                    style={{ borderRadius: 8, border: "1px solid #e5e7eb", padding: "8px 10px" }}
                />
                <input
                    type="number"
                    placeholder="post_id"
                    value={postId}
                    onChange={(e) => setPostId(e.target.value)}
                    min={1}
                    style={{ borderRadius: 8, border: "1px solid #e5e7eb", padding: "8px 10px" }}
                />
                <button type="submit">Crear</button>
            </div>
        </form>
    );
}


