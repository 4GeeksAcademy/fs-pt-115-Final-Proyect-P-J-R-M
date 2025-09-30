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
import { deleteChat } from "../../services/chatApi";

export default function ChatSocketClient() {
	const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

	// Auth simple
	const { token, user } = useAuth();
	const userId = Number(user?.id);

	// Claves por usuario para scroll y chat no leidos
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
				transports: ["websocket", "polling"],
				autoConnect: false,
				reconnection: true,
				reconnectionAttempts: 5,
				reconnectionDelay: 1000,
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
	const [removedChatIds, setRemovedChatIds] = useState(() => new Set());

	//Composers
	const [text, setText] = useState("");
	const [draftImages, setDraftImages] = useState([]);

	// Notificaciones / No leídos
	const [unreadByChat, setUnreadByChat] = useState({});
	const [didHydrateUnread, setDidHydrateUnread] = useState(false);
	const [chatsReady, setChatsReady] = useState(false);

	//Borrado completo de chats
	const handleDeleteChat = async (id) => {
		try {
			await deleteChat(id, token);

			try { socket.emit?.("leave_chat", { chat_id: id }); } catch { }
			joinedChatsRef.current.delete(id);

			setChats(prev => prev.filter(c => c.id !== id));
			setRemovedChatIds(prev => {
				const next = new Set(prev);
				next.add(id);
				return next;
			});

			if (activeChatId === id) {
				setActiveChatId(null);
				localStorage.removeItem("activeChatId");
			}

			loadChats();
		} catch (err) {
			console.error("deleteChat error:", err);
			pushError("No se pudo eliminar el chat.");
		}
	};

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

	const postsByIdRef = useRef({});
	useEffect(() => {
		postsByIdRef.current = postsById;
	}, [postsById]);

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
		return hasActive ? "chat" : "list";
	});

	useEffect(() => {
		const el = document.documentElement;
		const update = () => setIsMobile(el.clientWidth <= 639);
		update();
		if ("ResizeObserver" in window) {
			const ro = new ResizeObserver(update);
			ro.observe(el);
			return () => ro.disconnect();
		} else {
			const onResize = () => update();
			window.addEventListener("resize", onResize);
			return () => window.removeEventListener("resize", onResize);
		}
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

	// Fetch helpers - Memoizados para evitar recreación
	const fetchUsers = useRef(async () => {
		try {
			const list = await getUsers();
			const map = {};
			for (const u of list) map[u.id] = u;
			setUsersById(map);
		} catch (error) {
			console.error("getUsers error:", error);
		}
	});

	const fetchPost = useRef(async (postId) => {
		if (!postId) return;
		try {
			const data = await getPostById(postId, token);
			setPostsById((prev) => ({ ...prev, [postId]: data }));
		} catch (error) {
			console.error("getPostById error:", error);
		}
	});

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

	// Helpers chat - Memoizados con useRef
	const ensureChatState = useRef((chatId) => {
		setMessagesByChat((prev) => (prev[chatId] ? prev : { ...prev, [chatId]: [] }));
		setTypingByChat((prev) => (prev[chatId] ? prev : { ...prev, [chatId]: new Set() }));
	});

	const loadChats = useRef(() => socket.emit("list_chats"));
	const joinChat = useRef((chatId) => socket.emit("join_chat", { chat_id: chatId }));
	const createChatSocket = useRef((userTwo, postId) =>
		socket.emit("create_chat", { user_two: Number(userTwo), post_id: Number(postId) })
	);

	const loadMessages = useRef((chatId, beforeId = null, limit = 30) => {
		ensureChatState.current(chatId);
		const payload = { chat_id: chatId, limit };
		if (beforeId) payload.before_id = beforeId;
		socket.emit("get_messages", payload);
	});

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

	// 🚩 NUEVO: solo conecta el socket si estás en /chat (o /chat/...)
	const isChatPage = window.location.pathname.startsWith("/chats");

	// SOCKET listeners
	useEffect(() => {
		if (!isChatPage) return;

		function onConnect() {
			console.log("✅ Socket conectado");
			setConnected(true);
			socket.emit("identify", { token });
		}

		function onDisconnect() {
			console.log("❌ Socket desconectado");
			setConnected(false);
		}

		function onError(e) {
			console.error("Socket error:", e);
			pushError(e?.msg || e || "Error desconocido");
		}

		function onIdentified() {
			console.log("🔐 Identificado");
			fetchUsers.current();
			if (wantUserTwo && wantPostId) {
				createChatSocket.current(wantUserTwo, wantPostId);
			} else {
				loadChats.current();
			}
		}

		function onChats(payload) {
			console.log("📋 Chats recibidos:", payload);
			const incoming = Array.isArray(payload) ? payload : [];

			setChats(prevChats => {
				const byId = new Map();
				prevChats.forEach((c) => byId.set(c.id, c));
				incoming.forEach((c) => byId.set(c.id, { ...byId.get(c.id), ...c }));

				const merged = Array.from(byId.values());
				const activeMerged = merged.filter((c) => c.is_active === true);

				const ids = new Set(activeMerged.map((c) => c.id));

				// Limpiar chats eliminados
				for (const joinedId of Array.from(joinedChatsRef.current)) {
					if (!ids.has(joinedId)) {
						try { socket.emit("leave_chat", { chat_id: joinedId }); } catch { }
						joinedChatsRef.current.delete(joinedId);
					}
				}

				// Unirse a chats y cargar posts
				activeMerged.forEach((c) => {
					if (!joinedChatsRef.current.has(c.id)) {
						joinChat.current(c.id);
						joinedChatsRef.current.add(c.id);
					}
					if (!postsByIdRef.current[c.post_id]) {
						fetchPost.current(c.post_id);
					}
				});

				// Seleccionar chat activo
				let target = activeChatIdRef.current;
				if (!target || !ids.has(target)) {
					target = wantChatId || activeMerged[0]?.id || null;
					setActiveChatId(target);
				}

				if (target) {
					if (!joinedChatsRef.current.has(target)) {
						joinChat.current(target);
						joinedChatsRef.current.add(target);
					}

					// Cargar mensajes si no existen
					setMessagesByChat(prevMsgs => {
						if (!(prevMsgs[target]?.length)) {
							loadMessages.current(target);
						}
						return prevMsgs;
					});
				}

				return activeMerged;
			});

			setChatsReady(true);
		}

		function onChatCreated(chat) {
			console.log("✨ Chat creado:", chat);
			setChats((prev) => [chat, ...prev]);
			setActiveChatId(chat.id);
			localStorage.setItem("activeChatId", String(chat.id));
			joinChat.current(chat.id);
			joinedChatsRef.current.add(chat.id);
			fetchPost.current(chat.post_id);
			loadMessages.current(chat.id);
		}

		function onChatExists(chat) {
			console.log("♻️ Chat ya existe:", chat);
			setActiveChatId(chat.id);
			localStorage.setItem("activeChatId", String(chat.id));
			joinChat.current(chat.id);
			joinedChatsRef.current.add(chat.id);
			fetchPost.current(chat.post_id);
			loadMessages.current(chat.id);
		}

		function onNewMessage(m) {
			console.log("💬 Nuevo mensaje:", m);
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
			console.log(`📨 Mensajes cargados para chat ${chat_id}:`, items.length);
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

		// Registrar listeners
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

		// Conectar socket
		socket.connect();

		// Cleanup
		return () => {
			console.log("🧹 Limpiando socket listeners");
			persistScroll.current?.();
			socket.off("connect", onConnect);
			socket.off("disconnect", onDisconnect);
			socket.off("error", onError);
			socket.off("identified", onIdentified);
			socket.off("chats", onChats);
			socket.off("chat_created", onChatCreated);
			socket.off("chat_exists", onChatExists);
			socket.off("new_message", onNewMessage);
			socket.off("messages", onMessages);
			socket.off("typing", onTyping);
			socket.disconnect();
			if (typingTimeout.current) clearTimeout(typingTimeout.current);
		};
	}, [isChatPage, socket, token, wantChatId, wantUserTwo, wantPostId, userId, isWindowFocused]);

	// cambio de chat activo
	useEffect(() => {
		if (!activeChatId) return;
		ensureChatState.current(activeChatId);
		joinChat.current(activeChatId);

		setMessagesByChat(prev => {
			if (!(prev[activeChatId]?.length)) {
				loadMessages.current(activeChatId);
			}
			return prev;
		});

		// restaurar scroll
		requestAnimationFrame(() => {
			if (!listRef.current) return;
			const saved = scrollByChat.current[activeChatId];
			if (saved !== undefined) listRef.current.scrollTop = saved;
			else listRef.current.scrollTop = listRef.current.scrollHeight;
		});

		// limpiar no leídos
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
		if (beforeId) loadMessages.current(activeChatId, beforeId);
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
					onDeleteChat={handleDeleteChat}
				/>

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
