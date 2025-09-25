import React, { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../../hooks/useAuth";
import { getUsers } from "../../services/userApi";
import { getPostById } from "../../services/postApi";
import "./chat-page.css";
import "../../components/chat/theme.css";
import Sidebar from "../../components/chat/sidebar/Sidebar";
import ChatPanel from "../../components/chat/chatpanel/ChatPanel";
import { uploadImge } from "../../services/userApi";


export default function ChatSocketClient() {
	const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

	// Auth simple
	const { token, user } = useAuth();
	const userId = Number(user?.id);

	// Claves por usuario para persistir
	const UNREAD_KEY = useMemo(() => (userId ? `unreadByChat:${userId}` : null), [userId]);
	const SCROLL_KEY = useMemo(() => (userId ? `scrollByChat:${userId}` : null), [userId]);

	// Deep link
	const params = useMemo(() => new URLSearchParams(window.location.search), []);
	const wantChatId = useMemo(() => Number(params.get("chatId")) || null, [params]);
	const wantUserTwo = useMemo(() => Number(params.get("userTwo")) || null, [params]);
	const wantPostId = useMemo(() => Number(params.get("postId")) || null, [params]);

	// Socket
	const socket = useMemo(
		() =>
			io(BACKEND_URL, {
				path: "/socket.io",
				transports: ["websocket"],
				autoConnect: false,
			}),
		[BACKEND_URL]
	);

	const [connected, setConnected] = useState(false);
	const [errors, setErrors] = useState([]);
	const pushError = (msg) => setErrors((prev) => [...prev.slice(-3), String(msg)]);

	// Stores
	const [usersById, setUsersById] = useState({});
	const [postsById, setPostsById] = useState({});
	const [chats, setChats] = useState([]);
	const [messagesByChat, setMessagesByChat] = useState({});
	const [nextBeforeByChat, setNextBeforeByChat] = useState({});
	const [typingByChat, setTypingByChat] = useState({});

	//Composers
	const [text, setText] = useState("");
	const [draftImages, setDraftImages] = useState([]);

	// --- Notificaciones / No leídos (persistencia) ---
	const [unreadByChat, setUnreadByChat] = useState({});
	const [didHydrateUnread, setDidHydrateUnread] = useState(false);
	const [chatsReady, setChatsReady] = useState(false);

	// Hidratar no leídos
	useEffect(() => {
		if (!UNREAD_KEY) return;
		try {
			const raw = localStorage.getItem(UNREAD_KEY);
			if (raw) {
				const parsed = JSON.parse(raw);
				if (parsed && typeof parsed === "object") {
					const cleaned = {};
					for (const [k, v] of Object.entries(parsed)) {
						const n = Number(v);
						if (Number.isFinite(n) && n > 0) cleaned[k] = n;
					}
					setUnreadByChat(cleaned);
				}
			}
		} catch { }
		setDidHydrateUnread(true);
	}, [UNREAD_KEY]);

	// Guardar no leídos
	useEffect(() => {
		if (!didHydrateUnread || !UNREAD_KEY) return;
		try {
			localStorage.setItem(UNREAD_KEY, JSON.stringify(unreadByChat));
		} catch { }
	}, [didHydrateUnread, UNREAD_KEY, unreadByChat]);

	// Podar contadores de chats inexistentes
	useEffect(() => {
		if (!didHydrateUnread || !chatsReady) return;
		const valid = new Set(chats.map((c) => String(c.id)));
		setUnreadByChat((prev) => {
			let changed = false;
			const next = {};
			for (const [k, v] of Object.entries(prev)) {
				if (valid.has(String(k))) next[k] = v;
				else changed = true;
			}
			return changed ? next : prev;
		});
	}, [didHydrateUnread, chatsReady, chats]);

	// Foco de ventana + notificaciones
	const [isWindowFocused, setIsWindowFocused] = useState(!document.hidden);
	useEffect(() => {
		const onVisibility = () => setIsWindowFocused(!document.hidden);
		document.addEventListener("visibilitychange", onVisibility);
		return () => document.removeEventListener("visibilitychange", onVisibility);
	}, []);

	useEffect(() => {
		if (!connected) return;
		if ("Notification" in window && Notification.permission === "default") {
			Notification.requestPermission().catch(() => { });
		}
	}, [connected]);

	function showBrowserNotification({ title, body, icon, onClick }) {
		if (!("Notification" in window)) return;
		if (Notification.permission !== "granted") return;
		try {
			const n = new Notification(title, { body, icon, badge: icon, silent: true });
			if (onClick) n.onclick = onClick;
		} catch { }
	}

	// Ping corto con WebAudio
	const playPing = useRef(() => { });
	useEffect(() => {
		const AudioCtx = window.AudioContext || window.webkitAudioContext;
		let ctx = null;
		if (AudioCtx) ctx = new AudioCtx();
		playPing.current = () => {
			try {
				if (!ctx) return;
				const o = ctx.createOscillator();
				const g = ctx.createGain();
				o.type = "sine";
				o.frequency.value = 880;
				g.gain.value = 0.0001;
				o.connect(g);
				g.connect(ctx.destination);
				o.start();
				const now = ctx.currentTime;
				g.gain.exponentialRampToValueAtTime(0.2, now + 0.01);
				g.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
				o.stop(now + 0.18);
			} catch { }
		};
	}, []);

	// UI / refs
	const [activeChatId, setActiveChatId] = useState(() => {
		const raw = localStorage.getItem("activeChatId");
		const n = Number(raw);
		return Number.isFinite(n) && n > 0 ? n : null;
	});

	useEffect(() => {
		if (activeChatId) localStorage.setItem("activeChatId", String(activeChatId));
	}, [activeChatId]);

	const activeChatIdRef = useRef(null);
	useEffect(() => {
		activeChatIdRef.current = activeChatId;
	}, [activeChatId]);

	const usersByIdRef = useRef({});
	useEffect(() => {
		usersByIdRef.current = usersById;
	}, [usersById]);

	const typingRef = useRef(false);
	const typingTimeout = useRef(null);

	const scrollByChat = useRef({});
	const listRef = useRef(null);
	const joinedChatsRef = useRef(new Set());

	// Responsive: móvil vs desktop
	const [isMobile, setIsMobile] = useState(
		typeof window !== "undefined" && window.matchMedia("(max-width: 639px)").matches
	);
	const [mobileView, setMobileView] = useState(() => {
		const hasActive = Number(localStorage.getItem("activeChatId")) > 0;
		return hasActive ? "chat" : "list"; // en móvil: arrancar en lista o chat
	});

	useEffect(() => {
		const mq = window.matchMedia("(max-width: 639px)");
		const handler = (e) => setIsMobile(e.matches);
		if (mq.addEventListener) mq.addEventListener("change", handler);
		else mq.addListener(handler); // fallback Safari viejo
		setIsMobile(mq.matches);
		return () => {
			if (mq.removeEventListener) mq.removeEventListener("change", handler);
			else mq.removeListener(handler);
		};
	}, []);

	useEffect(() => {
		if (!isMobile) return;
		setMobileView(activeChatId ? "chat" : "list");
	}, [isMobile, activeChatId]);

	// Hidratar scroll por chat
	useEffect(() => {
		if (!SCROLL_KEY) return;
		try {
			const raw = localStorage.getItem(SCROLL_KEY);
			if (raw) {
				const parsed = JSON.parse(raw);
				if (parsed && typeof parsed === "object") {
					scrollByChat.current = parsed;
				}
			}
		} catch { }
	}, [SCROLL_KEY]);

	// Helper persistir scroll
	const persistScroll = useRef(() => { });
	useEffect(() => {
		persistScroll.current = () => {
			if (!SCROLL_KEY) return;
			try {
				localStorage.setItem(SCROLL_KEY, JSON.stringify(scrollByChat.current));
			} catch { }
		};
	}, [SCROLL_KEY]);

	// Guardar scroll al hacer scroll del contenedor
	useEffect(() => {
		const el = listRef.current;
		if (!el) return;
		const onScroll = () => {
			if (!activeChatId) return;
			scrollByChat.current[activeChatId] = el.scrollTop;
			persistScroll.current?.();
		};
		el.addEventListener("scroll", onScroll, { passive: true });
		return () => el.removeEventListener("scroll", onScroll);
	}, [activeChatId]);

	// Fetch helpers
	async function fetchUsers() {
		try {
			const list = await getUsers();
			const map = {};
			for (const u of list) map[u.id] = u;
			setUsersById(map);
		} catch (error) {
			console.error("getUsers error:", error);
		}
	}

	async function fetchPost(postId) {
		if (!postId) return;
		try {
			const data = await getPostById(postId, token);
			setPostsById((prev) => ({ ...prev, [postId]: data }));
		} catch (error) {
			console.error("getPostById error:", error);
		}
	}

	const handleUploadImage = async (file) => {
		try {
			const { imageUrl, secure_url } = await uploadImge(file, { asAvatar: false });
			const url = imageUrl || secure_url;
			if (url) {
				setDraftImages((prev) => [...prev, { url }]);
			}
			return { imageUrl: url };
		} catch (err) {
			console.error("upload image error:", err);
			throw err;
		}
	};
	
	const removeDraftImage = (url) => {
		setDraftImages((prev) => prev.filter((x) => x.url !== url));
	};

	// Helpers chat
	const ensureChatState = (chatId) => {
		setMessagesByChat((prev) => (prev[chatId] ? prev : { ...prev, [chatId]: [] }));
		setTypingByChat((prev) => (prev[chatId] ? prev : { ...prev, [chatId]: new Set() }));
	};

	const loadChats = () => socket.emit("list_chats");
	const joinChat = (chatId) => socket.emit("join_chat", { chat_id: chatId });
	const createChatSocket = (userTwo, postId) =>
		socket.emit("create_chat", { user_two: Number(userTwo), post_id: Number(postId) });

	const loadMessages = (chatId, beforeId = null, limit = 30) => {
		ensureChatState(chatId);
		const payload = { chat_id: chatId, limit };
		if (beforeId) payload.before_id = beforeId;
		socket.emit("get_messages", payload);
	};

	const sendMessage = () => {
		if (!activeChatId) return;
		const content = text.trim();

		if (draftImages.length > 0) {
			draftImages.forEach((img) => {
				socket.emit("private_message", { chat_id: activeChatId, content: img.url });
			});
		}

		if (content) {
			socket.emit("private_message", { chat_id: activeChatId, content });
		}

		setText("");
		setDraftImages([]);
		stopTyping();

		requestAnimationFrame(() => {
			if (listRef.current) {
				listRef.current.scrollTop = listRef.current.scrollHeight;
				if (activeChatId) {
					scrollByChat.current[activeChatId] = listRef.current.scrollTop;
					persistScroll.current?.();
				}
			}
		});

		if (activeChatId) localStorage.setItem("activeChatId", String(activeChatId));
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

	// SOCKET listeners
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

		function onIdentified() {
			fetchUsers();
			if (wantUserTwo && wantPostId) createChatSocket(wantUserTwo, wantPostId);
			else loadChats();
		}

		function onChats(payload) {
			const incoming = Array.isArray(payload) ? payload : [];

			// 1) Merge por id (sin perder los que ya tenemos)
			const byId = new Map();
			// existente
			chats.forEach((c) => byId.set(c.id, c));
			// entrante (sobrescribe campos actualizados)
			incoming.forEach((c) => byId.set(c.id, { ...byId.get(c.id), ...c }));

			const merged = Array.from(byId.values());

			// (opcional) ordenar si quieres el más reciente arriba — si tienes updated_at úsalo.
			// merged.sort((a, b) => (b.updated_at || 0) - (a.updated_at || 0));

			setChats(merged);
			setChatsReady(true);
      
			// Unir a todos los chats y precargat posts
			list.forEach((c) => {
			// 2) Únete a todos y precarga posts usando la lista merged
				if (!joinedChatsRef.current.has(c.id)) {
					joinChat(c.id);
					joinedChatsRef.current.add(c.id);
				}
				if (!postsById[c.post_id]) fetchPost(c.post_id);
			});

			// 3) Respetar chat activo si sigue existiendo; si no, elegir target
			const ids = new Set(merged.map((c) => c.id));
			let target = activeChatIdRef.current;

			if (target && ids.has(target)) {
				if (!joinedChatsRef.current.has(target)) {
					joinChat(target);
					joinedChatsRef.current.add(target);
				}
				if (!(messagesByChat[target]?.length)) loadMessages(target);
				return;
			}

			target = wantChatId || (merged?.[0]?.id ?? null);
			if (target) {
				setActiveChatId(target);
				if (!joinedChatsRef.current.has(target)) {
					joinChat(target);
					joinedChatsRef.current.add(target);
				}
				loadMessages(target);
			}
		}

		function onChatCreated(chat) {
			setChats((prev) => [chat, ...prev]);
			setActiveChatId(chat.id);
			localStorage.setItem("activeChatId", String(chat.id));
			joinChat(chat.id);
			joinedChatsRef.current.add(chat.id);
			fetchPost(chat.post_id);
			loadMessages(chat.id);
		}

		function onChatExists(chat) {
			setActiveChatId(chat.id);
			localStorage.setItem("activeChatId", String(chat.id));
			joinChat(chat.id);
			joinedChatsRef.current.add(chat.id);
			fetchPost(chat.post_id);
			loadMessages(chat.id);
		}

		// Mensajes + notificaciones
		function onNewMessage(m) {
			setMessagesByChat((prev) => {
				const list = prev[m.chat_id] || [];
				return { ...prev, [m.chat_id]: [...list, m] };
			});

			const isMine = Number(m.user_id) === userId;
			const isActiveChat = m.chat_id === activeChatIdRef.current;

			if (isActiveChat && isMine) {
				requestAnimationFrame(() => {
					if (listRef.current) {
						listRef.current.scrollTop = listRef.current.scrollHeight;
						// Persistir scroll al fondo al recibir un mensaje nuestro
						scrollByChat.current[m.chat_id] = listRef.current.scrollTop;
						persistScroll.current();
					}
				});
			}

			if (!isMine && (!isActiveChat || !isWindowFocused)) {
				setUnreadByChat((prev) => ({ ...prev, [m.chat_id]: (prev[m.chat_id] || 0) + 1 }));

				const author = usersByIdRef.current[m.user_id];
				const title = author?.username || "Nuevo mensaje";
				const body = (m.content || "").slice(0, 120) || "Mensaje nuevo";
				playPing.current?.();
				showBrowserNotification({
					title,
					body,
					icon: author?.image || undefined,
					onClick: () => {
						window.focus();
						setActiveChatId(m.chat_id);
					},
				});
			}
		}

		function onMessages({ chat_id, items, next_before_id }) {
			setMessagesByChat((prev) => {
				const cur = prev[chat_id] || [];
				const merged = [...items, ...cur];
				const seen = new Set();
				const dedup = merged.filter((x) => (seen.has(x.id) ? false : (seen.add(x.id), true)));
				return { ...prev, [chat_id]: dedup };
			});
			setNextBeforeByChat((prev) => ({ ...prev, [chat_id]: next_before_id }));

			if (chat_id === activeChatIdRef.current) {
				requestAnimationFrame(() => {
					if (listRef.current) {
						listRef.current.scrollTop = listRef.current.scrollHeight;
						// Persistir scroll al fondo tras cargar mensajes del chat activo
						scrollByChat.current[chat_id] = listRef.current.scrollTop;
						persistScroll.current();
					}
				});
			}
		}

		function onTyping({ chat_id, user_id: uid, is_typing }) {
			setTypingByChat((prev) => {
				const set = new Set(prev[chat_id] || []);
				if (is_typing) set.add(uid);
				else set.delete(uid);
				return { ...prev, [chat_id]: set };
			});
		}

		socket.on("connect", onConnect);
		socket.on("disconnect", onDisconnect);
		socket.on("error", onError);
		socket.on("identified", onIdentified);
		socket.on("chats", onChats);
		socket.on("chat_created", onChatCreated);
		socket.on("chat_exists", onChatExists);
		socket.on("new_message", onNewMessage);
		socket.on("messages", onMessages);
		socket.on("typing", onTyping);

		socket.connect();
		return () => {
			// Guardar scrolls antes de desmontar
			persistScroll.current?.();
			socket.disconnect();
			socket.removeAllListeners();
			if (typingTimeout.current) clearTimeout(typingTimeout.current);
			joinedChatsRef.current = new Set();
		};
	}, [socket, token, wantChatId, wantPostId, userId]);

	// refresco periódico de chats
	useEffect(() => {
		if (!connected) return;
		const id = setInterval(() => loadChats(), 5000);
		return () => clearInterval(id);
	}, [connected]);

	// cambio de chat activo
	useEffect(() => {
		if (!activeChatId) return;
		ensureChatState(activeChatId);
		joinChat(activeChatId);
		if (!(messagesByChat[activeChatId]?.length)) loadMessages(activeChatId);

		// restaurar scroll (o al final si es primera vez)
		requestAnimationFrame(() => {
			if (!listRef.current) return;
			const saved = scrollByChat.current[activeChatId];
			if (saved !== undefined) listRef.current.scrollTop = saved;
			else listRef.current.scrollTop = listRef.current.scrollHeight;
		});

		// limpiar no leídos al entrar en el chat
		setUnreadByChat((prev) => {
			if (!prev[activeChatId]) return prev;
			const { [activeChatId]: _omit, ...rest } = prev;
			return rest;
		});
	}, [activeChatId]);

	// si recuperas foco, limpia no leídos del chat abierto
	useEffect(() => {
		if (!isWindowFocused || !activeChatId) return;
		setUnreadByChat((prev) => {
			if (!prev[activeChatId]) return prev;
			const { [activeChatId]: _omit, ...rest } = prev;
			return rest;
		});
	}, [isWindowFocused, activeChatId]);

	// badge en el título de la pestaña
	useEffect(() => {
		if (!didHydrateUnread) return;
		const total = Object.values(unreadByChat).reduce((a, b) => a + b, 0);
		const base = "Hand to Hand";
		document.title = total > 0 ? `(${total}) ${base}` : base;
	}, [didHydrateUnread, unreadByChat]);

	const handleLoadOlder = () => {
		if (!activeChatId) return;
		const beforeId = nextBeforeByChat[activeChatId];
		if (beforeId) loadMessages(activeChatId, beforeId);
	};

	const typingOthers = Array.from(typingByChat[activeChatId || -1] || []).filter(
		(uid) => Number(uid) !== userId
	);

	const messages = messagesByChat[activeChatId || -1] || [];

	// Clases movil responsive
	const shellClasses = [
		"chat-shell",
		isMobile ? "is-mobile" : "is-desktop",
		isMobile ? (mobileView === "chat" ? "view-chat" : "view-list") : "view-split",
	].join(" ");

	return (
		<div className={shellClasses}>
			<div className="chat-layout">
				{/* Sidebar (lista de chats a la izquierda) */}
				<Sidebar
					chats={chats}
					usersById={usersById}
					postsById={postsById}
					userId={userId}
					activeChatId={activeChatId}
					unreadByChat={unreadByChat}
					onSelectChat={(id) => {
						setActiveChatId(id);
						localStorage.setItem("activeChatId", String(id));
						if (isMobile) setMobileView("chat");
					}}
				/>

				{/* Panel principal (encabezado + mensajes + input) */}
				<ChatPanel
					headerProps={{
						chat: chats.find((ch) => ch.id === activeChatId),
						userId,
						usersById,
						postsById,
						typingOthers,
						onLoadOlder: handleLoadOlder,
						canLoadOlder: !!activeChatId,
						onBack: isMobile ? () => setMobileView("list") : undefined,
					}}
					listRef={listRef}
					messages={messages}
					usersById={usersById}
					activeChatId={activeChatId}
					isMine={(m) => Number(m.user_id) === userId}
					inputProps={{
						value: text,
						disabled: !activeChatId,
						placeholder: activeChatId ? "Escribe un mensaje" : "Selecciona un chat",
						onChange: setText,
						onSend: sendMessage,
						onStartTyping: startTyping,
						onStopTyping: stopTyping,
						onUploadImage: handleUploadImage,
						attachments: draftImages,
						onRemoveAttachment: removeDraftImage,
					}}
				/>
			</div>
		</div>
	);
}
