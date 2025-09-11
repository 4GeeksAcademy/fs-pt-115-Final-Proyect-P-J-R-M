// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { io } from "socket.io-client";

// // Componente único: conecta, lista chats, crea chats, carga historial con paginación, envía mensajes,
// // indicadores de escritura y acuses de lectura efímeros. UI simple lista para copiar/pegar.
// export default function ChatPage() {
//     const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";
//     const token = localStorage.getItem("token");

//     // --- Socket ---
//     const socket = useMemo(() => {
//         return io(BACKEND_URL, {
//             path: "/socket.io",
//             transports: ["websocket"],
//             autoConnect: false,
//         });
//     }, [BACKEND_URL]);

//     const [connected, setConnected] = useState(false);
//     const [userId, setUserId] = useState(null);
//     const [errors, setErrors] = useState([]);

//     // --- Chats y mensajes ---
//     const [chats, setChats] = useState([]); // [{id,user_one,user_two,post_id}]
//     const [activeChatId, setActiveChatId] = useState(null);

//     // mensajes por chat: { [chatId]: [{id,chat_id,user_id,content}] }
//     const [messagesByChat, setMessagesByChat] = useState({});
//     // paginación: next_before_id por chat
//     const [nextBeforeByChat, setNextBeforeByChat] = useState({});
//     // writing indicators por chat: Set de user_ids escribiendo
//     const [typingByChat, setTypingByChat] = useState({});

//     // input mensaje actual
//     const [text, setText] = useState("");
//     const typingRef = useRef(false);
//     const typingTimeout = useRef(null);
//     const listRef = useRef(null);

//     // --- Helpers ---
//     const pushError = (msg) => setErrors((prev) => [...prev.slice(-3), String(msg)]);

//     const ensureChatState = (chatId) => {
//         setMessagesByChat((prev) => prev[chatId] ? prev : { ...prev, [chatId]: [] });
//         setTypingByChat((prev) => prev[chatId] ? prev : { ...prev, [chatId]: new Set() });
//     };

//     const loadChats = () => socket.emit("list_chats");

//     const joinChat = (chatId) => {
//         socket.emit("join_chat", { chat_id: chatId });
//     };

//     const loadMessages = (chatId, beforeId = null, limit = 30) => {
//         ensureChatState(chatId);
//         const payload = { chat_id: chatId, limit };
//         if (beforeId) payload.before_id = beforeId;
//         socket.emit("get_messages", payload);
//     };

//     const sendMessage = () => {
//         const content = text.trim();
//         if (!content || !activeChatId) return;
//         socket.emit("private_message", { chat_id: activeChatId, content });
//         setText("");
//         stopTyping();
//     };

//     const startTyping = () => {
//         if (!activeChatId || typingRef.current) return;
//         typingRef.current = true;
//         socket.emit("typing", { chat_id: activeChatId, is_typing: true });
//         if (typingTimeout.current) clearTimeout(typingTimeout.current);
//         typingTimeout.current = setTimeout(stopTyping, 1500);
//     };

//     const stopTyping = () => {
//         if (!activeChatId) return;
//         typingRef.current = false;
//         if (typingTimeout.current) clearTimeout(typingTimeout.current);
//         socket.emit("typing", { chat_id: activeChatId, is_typing: false });
//     };

//     const emitReadUpTo = (chatId) => {
//         const arr = messagesByChat[chatId] || [];
//         if (!arr.length) return;
//         // último mensaje del otro usuario
//         const foreign = [...arr].reverse().find((m) => m.user_id !== userId);
//         if (foreign) socket.emit("read_messages", { chat_id: chatId, up_to_id: foreign.id });
//     };

//     // --- Conexión y listeners ---
//     useEffect(() => {
//         function onConnect() {
//             setConnected(true);
//             socket.emit("identify", { token });
//         }
//         function onDisconnect() {
//             setConnected(false);
//         }

//         function onError(e) {
//             pushError(e?.msg || e || "Error desconocido");
//         }

//         function onIdentified(data) {
//             setUserId(data?.user_id ?? null);
//             loadChats();
//         }

//         function onChats(payload) {
//             setChats(Array.isArray(payload) ? payload : []);
//             // seleccionar primero si no hay activo
//             if (!activeChatId && payload?.length) {
//                 const first = payload[0].id;
//                 setActiveChatId(first);
//                 joinChat(first);
//                 loadMessages(first);
//             }
//         }

//         function onJoinedChat({ chat_id }) {
//             // opcional feedback
//         }

//         function onChatCreated(chat) {
//             setChats((prev) => [chat, ...prev]);
//             setActiveChatId(chat.id);
//             joinChat(chat.id);
//             loadMessages(chat.id);
//         }

//         function onChatExists(chat) {
//             // si ya existe, lo seleccionamos
//             setActiveChatId(chat.id);
//             joinChat(chat.id);
//             loadMessages(chat.id);
//         }

//         function onNewMessage(m) {
//             setMessagesByChat((prev) => {
//                 const list = prev[m.chat_id] || [];
//                 return { ...prev, [m.chat_id]: [...list, m] };
//             });
//             // auto-scroll si estamos en el chat activo
//             if (m.chat_id === activeChatId && listRef.current) {
//                 listRef.current.scrollTop = listRef.current.scrollHeight;
//             }
//         }

//         function onMessages({ chat_id, items, next_before_id }) {
//             setMessagesByChat((prev) => {
//                 const cur = prev[chat_id] || [];
//                 const merged = [...items, ...cur];
//                 // evitar duplicados por id
//                 const seen = new Set();
//                 const dedup = merged.filter((x) => (seen.has(x.id) ? false : (seen.add(x.id), true)));
//                 return { ...prev, [chat_id]: dedup };
//             });
//             setNextBeforeByChat((prev) => ({ ...prev, [chat_id]: next_before_id }));
//             // marcar leídos
//             emitReadUpTo(chat_id);
//             // si es primera carga del chat activo, bajar al final
//             if (chat_id === activeChatId && listRef.current) {
//                 requestAnimationFrame(() => {
//                     listRef.current.scrollTop = listRef.current.scrollHeight;
//                 });
//             }
//         }

//         function onTyping({ chat_id, user_id: uid, is_typing }) {
//             setTypingByChat((prev) => {
//                 const set = new Set(prev[chat_id] || []);
//                 if (is_typing) set.add(uid); else set.delete(uid);
//                 return { ...prev, [chat_id]: set };
//             });
//         }

//         socket.on("connect", onConnect);
//         socket.on("disconnect", onDisconnect);
//         socket.on("error", onError);

//         socket.on("identified", onIdentified);
//         socket.on("chats", onChats);
//         socket.on("joined_chat", onJoinedChat);
//         socket.on("chat_created", onChatCreated);
//         socket.on("chat_exists", onChatExists);

//         socket.on("new_message", onNewMessage);
//         socket.on("messages", onMessages);
//         socket.on("typing", onTyping);

//         socket.connect();

//         return () => {
//             socket.off("connect", onConnect);
//             socket.off("disconnect", onDisconnect);
//             socket.off("error", onError);
//             socket.off("identified", onIdentified);
//             socket.off("chats", onChats);
//             socket.off("joined_chat", onJoinedChat);
//             socket.off("chat_created", onChatCreated);
//             socket.off("chat_exists", onChatExists);
//             socket.off("new_message", onNewMessage);
//             socket.off("messages", onMessages);
//             socket.off("typing", onTyping);
//             if (typingTimeout.current) clearTimeout(typingTimeout.current);
//             socket.disconnect();
//         };
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [socket]);

//     // cambio de chat activo -> unirse, cargar historial inicial
//     useEffect(() => {
//         if (!activeChatId) return;
//         ensureChatState(activeChatId);
//         joinChat(activeChatId);
//         if (!(messagesByChat[activeChatId]?.length)) {
//             loadMessages(activeChatId);
//         } else {
//             emitReadUpTo(activeChatId);
//         }
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [activeChatId]);

//     const createChat = (userTwo, postId) => {
//         if (!userTwo || !postId) return;
//         socket.emit("create_chat", { user_two: Number(userTwo), post_id: Number(postId) });
//     };

//     const handleLoadOlder = () => {
//         const beforeId = nextBeforeByChat[activeChatId];
//         if (beforeId) loadMessages(activeChatId, beforeId);
//     };

//     const typingOthers = Array.from(typingByChat[activeChatId] || []).filter((uid) => uid !== userId);

//     return (
//         <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", height: "80vh", gap: 12, padding: 12, fontFamily: "system-ui, Arial" }}>
//             {/* Sidebar */}
//             <aside style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 12, overflow: "auto" }}>
//                 <h3 style={{ margin: 0 }}>Chats</h3>
//                 <div style={{ fontSize: 12, color: connected ? "#16a34a" : "#ef4444" }}>
//                     {connected ? "Conectado" : "Desconectado"}{userId ? ` · UID ${userId}` : ""}
//                 </div>

//                 <button onClick={loadChats} style={{ marginTop: 8, width: "100%" }}>Refrescar</button>

//                 <ul style={{ listStyle: "none", padding: 0, marginTop: 10 }}>
//                     {chats.map((c) => (
//                         <li key={c.id}>
//                             <button
//                                 onClick={() => setActiveChatId(c.id)}
//                                 style={{
//                                     width: "100%",
//                                     textAlign: "left",
//                                     padding: "8px 10px",
//                                     marginBottom: 6,
//                                     borderRadius: 8,
//                                     border: c.id === activeChatId ? "2px solid #3b82f6" : "1px solid #e5e7eb",
//                                     background: c.id === activeChatId ? "#eff6ff" : "white",
//                                     cursor: "pointer",
//                                 }}
//                                 title={`Chat #${c.id} • post ${c.post_id}`}
//                             >
//                                 <div style={{ fontWeight: 600 }}>Chat #{c.id}</div>
//                                 <div style={{ fontSize: 12, color: "#6b7280" }}>post: {c.post_id} · users: {c.user_one}–{c.user_two}</div>
//                             </button>
//                         </li>
//                     ))}
//                 </ul>

//                 {/* Crear chat rápido */}
//                 <CreateChatForm onCreate={createChat} />

//                 {/* Errores */}
//                 {errors.length > 0 && (
//                     <div style={{ marginTop: 12, fontSize: 12, color: "#b91c1c" }}>
//                         <strong>Errores:</strong>
//                         <ul style={{ margin: 0, paddingInlineStart: 16 }}>
//                             {errors.map((e, i) => (<li key={i}>{e}</li>))}
//                         </ul>
//                     </div>
//                 )}
//             </aside>

//             {/* Panel principal */}
//             <section style={{ border: "1px solid #e5e7eb", borderRadius: 10, display: "grid", gridTemplateRows: "auto 1fr auto", overflow: "hidden" }}>
//                 {/* Header */}
//                 <div style={{ padding: 12, borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//                     <div>
//                         <div style={{ fontWeight: 700 }}>Chat #{activeChatId ?? "—"}</div>
//                         <div style={{ fontSize: 12, color: "#6b7280" }}>
//                             {/* {activeChatId ? "Historial y mensajes en tiempo real" : "Selecciona un chat"} */}
//                             {typingOthers.length > 0 && (
//                                 <div style={{ fontSize: 12, color: "#6b7280", padding: "4px 8px" }}>
//                                     {typingOthers.length === 1 ? `Usuario ${typingOthers[0]} está escribiendo…` : `Varios usuarios están escribiendo…`}
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                     {activeChatId && (
//                         <button onClick={handleLoadOlder} disabled={!nextBeforeByChat[activeChatId]}>
//                             Cargar anteriores
//                         </button>
//                     )}
//                 </div>

//                 {/* Mensajes */}
//                 <div ref={listRef} style={{ padding: 12, overflow: "auto", background: "#fafafa" }}>
//                     {(messagesByChat[activeChatId] || []).map((m) => (
//                         <MessageBubble key={m.id} mine={m.user_id === userId} content={m.content} id={m.id} />
//                     ))}
//                 </div>

//                 {/* Input */}
//                 <div style={{ display: "flex", gap: 8, padding: 12, borderTop: "1px solid #e5e7eb" }}>
//                     <input
//                         value={text}
//                         onChange={(e) => {
//                             setText(e.target.value);
//                             if (e.target.value) startTyping(); else stopTyping();
//                         }}
//                         onKeyDown={(e) => {
//                             if (e.key === "Enter" && !e.shiftKey) {
//                                 e.preventDefault();
//                                 sendMessage();
//                             }
//                         }}
//                         placeholder={activeChatId ? "Escribe un mensaje" : "Selecciona un chat"}
//                         disabled={!activeChatId}
//                         style={{ flex: 1, borderRadius: 8, border: "1px solid #e5e7eb", padding: "10px 12px" }}
//                     />
//                     <button onClick={sendMessage} disabled={!activeChatId || !text.trim()}>
//                         Enviar
//                     </button>
//                 </div>
//             </section>
//         </div>
//     );
// }

// function MessageBubble({ mine, content, id }) {
//     return (
//         <div style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start", marginBottom: 6 }}>
//             <div
//                 title={`msg #${id}`}
//                 style={{
//                     maxWidth: 560,
//                     padding: "8px 10px",
//                     borderRadius: 10,
//                     border: "1px solid #e5e7eb",
//                     background: mine ? "#dbeafe" : "white",
//                     whiteSpace: "pre-wrap",
//                     wordBreak: "break-word",
//                 }}
//             >
//                 {content}
//             </div>
//         </div>
//     );
// }

// function CreateChatForm({ onCreate }) {
//     const [userTwo, setUserTwo] = useState("");
//     const [postId, setPostId] = useState("");

//     return (
//         <form
//             onSubmit={(e) => {
//                 e.preventDefault();
//                 onCreate(userTwo, postId);
//             }}
//             style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #e5e7eb" }}
//         >
//             <div style={{ fontWeight: 600, marginBottom: 6 }}>Crear chat</div>
//             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 6 }}>
//                 <input
//                     type="number"
//                     placeholder="user_two"
//                     value={userTwo}
//                     onChange={(e) => setUserTwo(e.target.value)}
//                     min={1}
//                     style={{ borderRadius: 8, border: "1px solid #e5e7eb", padding: "8px 10px" }}
//                 />
//                 <input
//                     type="number"
//                     placeholder="post_id"
//                     value={postId}
//                     onChange={(e) => setPostId(e.target.value)}
//                     min={1}
//                     style={{ borderRadius: 8, border: "1px solid #e5e7eb", padding: "8px 10px" }}
//                 />
//                 <button type="submit">Crear</button>
//             </div>
//         </form>
//     );
// }
import React, { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";

// --- WhatsApp-like palette ---
const WP_COLORS = {
  headerBg: "#075E54",
  headerText: "#E9F5F3",
  appBg: "#ECE5DD",
  chatListBg: "#FFFFFF",
  chatActive: "#DCF8C6",
  bubbleMine: "#DCF8C6",
  bubbleOther: "#FFFFFF",
  border: "#D1D5DB",
  accent: "#25D366",
  accentDark: "#128C7E",
};

// Componente único: ChatSocketClient
export default function ChatSocketClient() {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";
  const token = localStorage.getItem("token");

  // Query params para deep-link: /chat?chatId=ID o /chat?userTwo=ID&postId=ID
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const wantChatId = useMemo(() => Number(params.get("chatId")) || null, [params]);
  const wantUserTwo = useMemo(() => Number(params.get("userTwo")) || null, [params]);
  const wantPostId = useMemo(() => Number(params.get("postId")) || null, [params]);

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

  // --- Usuarios (para avatar/nombre) ---
  const [usersById, setUsersById] = useState({});
  async function fetchUsersMap() {
    try {
      const res = await fetch(`${BACKEND_URL}/api/users/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("No se pudieron cargar los usuarios");
      const arr = await res.json(); // [{id, username, image, ...}]
      const map = {};
      for (const u of arr) map[u.id] = u;
      setUsersById(map);
    } catch (e) {
      console.error(e);
    }
  }

  // --- Chats y mensajes ---
  const [chats, setChats] = useState([]); // [{id,user_one,user_two,post_id}]
  const [activeChatId, setActiveChatId] = useState(null);

  // Mantener el chat activo SIEMPRE actualizado (arreglo del salto cada 15s)
  const activeChatIdRef = useRef(null);
  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  // mensajes por chat: { [chatId]: [{id,chat_id,user_id,content}] }
  const [messagesByChat, setMessagesByChat] = useState({});
  // paginación: next_before_id por chat
  const [nextBeforeByChat, setNextBeforeByChat] = useState({});
  // typing por chat: Set de user_ids
  const [typingByChat, setTypingByChat] = useState({});

  // input mensaje actual
  const [text, setText] = useState("");
  const typingRef = useRef(false);
  const typingTimeout = useRef(null);
  const listRef = useRef(null);

  // --- Helpers ---
  const pushError = (msg) => setErrors((prev) => [...prev.slice(-3), String(msg)]);

  const ensureChatState = (chatId) => {
    setMessagesByChat((prev) => (prev[chatId] ? prev : { ...prev, [chatId]: [] }));
    setTypingByChat((prev) => (prev[chatId] ? prev : { ...prev, [chatId]: new Set() }));
  };

  const lsKey = (chatId) => `chat_msgs_${chatId}`;
  const loadCachedMsgs = (chatId) => {
    try { const raw = localStorage.getItem(lsKey(chatId)); return raw ? JSON.parse(raw) : []; } catch { return []; }
  };
  const saveCachedMsgs = (chatId, items) => { try { localStorage.setItem(lsKey(chatId), JSON.stringify(items)); } catch {} };

  const loadChats = () => socket.emit("list_chats");
  const joinChat = (chatId) => socket.emit("join_chat", { chat_id: chatId });
  const createChatSocket = (userTwo, postId) => socket.emit("create_chat", { user_two: Number(userTwo), post_id: Number(postId) });

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
    // autoscroll al enviar
    requestAnimationFrame(() => {
      if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
    });
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
    const foreign = [...arr].reverse().find((m) => m.user_id !== userId);
    if (foreign) socket.emit("read_messages", { chat_id: chatId, up_to_id: foreign.id });
  };

  const scrollToBottomSoon = () => {
    requestAnimationFrame(() => {
      if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
    });
  };

  // --- Conexión y listeners ---
  useEffect(() => {
    function onConnect() {
      setConnected(true);
      socket.emit("identify", { token });
    }
    function onDisconnect() { setConnected(false); }
    function onError(e) { pushError(e?.msg || e || "Error desconocido"); }

    function onIdentified(data) {
      setUserId(data?.user_id ?? null);
      fetchUsersMap();
      if (wantUserTwo && wantPostId) {
        createChatSocket(wantUserTwo, wantPostId);
      } else {
        loadChats();
      }
    }

    // ⬇️ ARREGLO: respetar SIEMPRE el chat activo actual (usando ref)
    function onChats(payload) {
      const list = Array.isArray(payload) ? payload : [];
      setChats(list);

      // Mantener el chat actual si existe; si no, elegir el inicial (deep-link o primero)
      let target = activeChatIdRef.current; // <- el valor real y fresco
      if (!target) {
        target = wantChatId || (list?.[0]?.id ?? null);
        if (target) {
          setActiveChatId(target);
          joinChat(target);
          const cached = loadCachedMsgs(target);
          if (cached.length) {
            setMessagesByChat(prev => ({ ...prev, [target]: cached }));
          }
          loadMessages(target);
        }
      }
      // Si ya había chat activo, NO lo tocamos (evitamos saltar al primero).
    }

    function onChatCreated(chat) {
      setChats((prev) => [chat, ...prev.filter((c) => c.id !== chat.id)]);
      setActiveChatId(chat.id);
      joinChat(chat.id);
      const cached = loadCachedMsgs(chat.id);
      if (cached.length) setMessagesByChat(prev => ({ ...prev, [chat.id]: cached }));
      loadMessages(chat.id);
      // limpiar query userTwo/postId -> dejar chatId
      const url = new URL(window.location.href);
      url.searchParams.delete("userTwo");
      url.searchParams.delete("postId");
      url.searchParams.set("chatId", String(chat.id));
      window.history.replaceState({}, "", url.toString());
    }

    function onChatExists(chat) {
      setChats((prev) => [chat, ...prev.filter((c) => c.id !== chat.id)]);
      setActiveChatId(chat.id);
      joinChat(chat.id);
      const cached = loadCachedMsgs(chat.id);
      if (cached.length) setMessagesByChat(prev => ({ ...prev, [chat.id]: cached }));
      loadMessages(chat.id);
      const url = new URL(window.location.href);
      url.searchParams.delete("userTwo");
      url.searchParams.delete("postId");
      url.searchParams.set("chatId", String(chat.id));
      window.history.replaceState({}, "", url.toString());
    }

    function onJoinedChat() {}

    function onNewMessage(m) {
      setMessagesByChat((prev) => {
        const list = prev[m.chat_id] || loadCachedMsgs(m.chat_id);
        const next = [...list, m];
        saveCachedMsgs(m.chat_id, next);
        return { ...prev, [m.chat_id]: next };
      });
      if (m.chat_id === activeChatIdRef.current) scrollToBottomSoon();
    }

    function onMessages({ chat_id, items, next_before_id }) {
      setMessagesByChat((prev) => {
        const cur = prev[chat_id] || loadCachedMsgs(chat_id);
        const merged = [...items, ...cur];
        const seen = new Set();
        const dedup = merged.filter((x) => (seen.has(x.id) ? false : (seen.add(x.id), true)));
        saveCachedMsgs(chat_id, dedup);
        return { ...prev, [chat_id]: dedup };
      });
      setNextBeforeByChat((prev) => ({ ...prev, [chat_id]: next_before_id }));
      emitReadUpTo(chat_id);
      if (chat_id === activeChatIdRef.current) scrollToBottomSoon();
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

  // refresco de lista cada 15s (se mantiene), pero ya NO cambia el chat activo
  useEffect(() => {
    if (!connected) return;
    const id = setInterval(() => loadChats(), 15000);
    return () => clearInterval(id);
  }, [connected]);

  // cambio de chat activo -> unirse, pre-cache y cargar
  useEffect(() => {
    if (!activeChatId) return;
    ensureChatState(activeChatId);
    joinChat(activeChatId);
    const cached = loadCachedMsgs(activeChatId);
    if (cached.length) setMessagesByChat(prev => ({ ...prev, [activeChatId]: cached }));
    if (!(messagesByChat[activeChatId]?.length)) {
      loadMessages(activeChatId);
    } else {
      emitReadUpTo(activeChatId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChatId]);

  const handleLoadOlder = () => {
    const beforeId = nextBeforeByChat[activeChatId];
    if (beforeId) loadMessages(activeChatId, beforeId);
  };

  const typingOthers = Array.from(typingByChat[activeChatId] || []).filter((uid) => uid !== userId);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", height: "80vh", gap: 12, padding: 12, background: WP_COLORS.appBg, fontFamily: "system-ui, Arial" }}>
      {/* Sidebar */}
      <aside style={{ border: `1px solid ${WP_COLORS.border}`, borderRadius: 14, overflow: "hidden", background: WP_COLORS.chatListBg, display: "grid", gridTemplateRows: "auto 1fr auto" }}>
        <div style={{ background: WP_COLORS.headerBg, color: WP_COLORS.headerText, padding: 12, fontWeight: 700 }}>Chats</div>
        <div style={{ padding: 8, borderBottom: `1px solid ${WP_COLORS.border}`, fontSize: 12 }}>
          <span style={{ color: connected ? WP_COLORS.accentDark : "#ef4444" }}>{connected ? "Conectado" : "Desconectado"}</span>
          {userId ? ` · UID ${userId}` : ""}
          <button onClick={loadChats} style={{ float: "right", background: WP_COLORS.accent, color: "white", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer" }}>Refrescar</button>
        </div>

        <ul style={{ listStyle: "none", padding: 8, margin: 0, overflow: "auto" }}>
          {chats.map((c) => {
            const otherId = c.user_one === userId ? c.user_two : c.user_one;
            const other = usersById[otherId];
            const title = other?.username ? other.username : `Usuario ${otherId}`;
            const img = other?.image;

            return (
              <li key={c.id}>
                <button
                  onClick={() => setActiveChatId(c.id)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "10px 12px",
                    marginBottom: 6,
                    borderRadius: 12,
                    border: `1px solid ${WP_COLORS.border}`,
                    background: c.id === activeChatId ? WP_COLORS.chatActive : "white",
                    cursor: "pointer",
                  }}
                  title={`Chat #${c.id} • post ${c.post_id}`}
                >
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    {img ? (
                      <img src={img} alt={title} style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover" }} />
                    ) : (
                      <Avatar seed={title} />
                    )}
                    <div>
                      <div style={{ fontWeight: 600 }}>{title}</div>
                      <div style={{ fontSize: 12, color: "#6b7280" }}>post: {c.post_id} · chat #{c.id}</div>
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Errores */}
        {errors.length > 0 && (
          <div style={{ padding: 8, borderTop: `1px solid ${WP_COLORS.border}`, fontSize: 12, color: "#b91c1c" }}>
            <strong>Errores:</strong>
            <ul style={{ margin: 0, paddingInlineStart: 16 }}>
              {errors.map((e, i) => (<li key={i}>{e}</li>))}
            </ul>
          </div>
        )}
      </aside>

      {/* Panel principal */}
      <section style={{ border: `1px solid ${WP_COLORS.border}`, borderRadius: 14, display: "grid", gridTemplateRows: "auto 1fr auto", overflow: "hidden", background: "#F8F8F8" }}>
        {/* Header */}
        <div style={{ background: WP_COLORS.headerBg, color: WP_COLORS.headerText, padding: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {(() => {
            const chat = chats.find(ch => ch.id === activeChatId);
            const otherId = chat ? (chat.user_one === userId ? chat.user_two : chat.user_one) : null;
            const other = otherId ? usersById[otherId] : null;
            const title = other?.username || (otherId ? `Usuario ${otherId}` : "—");
            const img = other?.image;
            return (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {img ? (
                  <img src={img} alt={title} style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover" }} />
                ) : (
                  <Avatar seed={title} />
                )}
                <div>
                  <div style={{ fontWeight: 700, letterSpacing: 0.2 }}>{title}</div>
                  <div style={{ fontSize: 12, opacity: 0.9 }}>{activeChatId ? "en línea (demo)" : "Selecciona o crea un chat"}</div>
                </div>
              </div>
            );
          })()}
          {activeChatId && (
            <button onClick={handleLoadOlder} disabled={!nextBeforeByChat[activeChatId]} style={{ background: "transparent", color: WP_COLORS.headerText, border: `1px solid ${WP_COLORS.headerText}`, borderRadius: 8, padding: "6px 10px", cursor: "pointer" }}>
              Cargar anteriores
            </button>
          )}
        </div>

        {/* Mensajes */}
        <div ref={listRef} style={{ padding: 12, overflow: "auto", background: `linear-gradient(180deg, ${WP_COLORS.appBg}, #FFFFFF)` }}>
          {(messagesByChat[activeChatId] || []).map((m) => (
            <MessageBubble key={m.id} mine={m.user_id === userId} content={m.content} id={m.id} />
          ))}
          {/* Indicador efímero de typing como burbuja, sin autoscroll */}
          {Array.from(typingByChat[activeChatId] || []).filter((uid) => uid !== userId).length > 0 && (
            <MessageBubble mine={false} content={"está escribiendo…"} id={"typing"} ephemeral />
          )}
        </div>

        {/* Input */}
        <div style={{ display: "flex", gap: 8, padding: 10, background: "#F0F0F0", alignItems: "center" }}>
          {/* Icono adjuntar inerte por ahora */}
          <button title="Adjuntar (sin acción)" style={{ background: "transparent", border: "none", fontSize: 20, cursor: "default", color: WP_COLORS.accentDark }}>📎</button>
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
            placeholder={activeChatId ? "Escribe un mensaje" : "Selecciona o crea un chat"}
            disabled={!activeChatId}
            style={{ flex: 1, borderRadius: 20, border: `1px solid ${WP_COLORS.border}`, padding: "10px 14px", outline: "none", background: "white" }}
          />
          <button onClick={sendMessage} disabled={!activeChatId || !text.trim()} style={{ background: WP_COLORS.accent, color: "white", border: "none", borderRadius: 20, padding: "10px 14px", cursor: "pointer" }}>
            Enviar
          </button>
        </div>
      </section>
    </div>
  );
}

function MessageBubble({ mine, content, id, ephemeral }) {
  return (
    <div style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start", marginBottom: 6, opacity: ephemeral ? 0.7 : 1 }}>
      <div
        title={typeof id === "number" ? `msg #${id}` : undefined}
        style={{
          maxWidth: 560,
          padding: "8px 10px",
          borderRadius: 10,
          border: `1px solid ${WP_COLORS.border}`,
          background: mine ? WP_COLORS.bubbleMine : WP_COLORS.bubbleOther,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          boxShadow: "0 1px 0 rgba(0,0,0,0.03)",
          fontStyle: ephemeral ? "italic" : "normal",
        }}
      >
        {content}
      </div>
    </div>
  );
}

function Avatar({ seed }) {
  // avatar mínimo basado en seed
  return (
    <div style={{ width: 34, height: 34, borderRadius: "9999px", background: "#E5E7EB", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 700 }}>
      {String(seed).slice(0, 2).toUpperCase()}
    </div>
  );
}


