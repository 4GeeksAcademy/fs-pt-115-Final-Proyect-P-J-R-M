import React, { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../../hooks/useAuth";

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

export default function ChatSocketClient() {
	const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";
	const API = `${BACKEND_URL}/api`;

	// Auth normalizado
	const { token: rawToken, user } = useAuth();
	const userId = Number(user?.id);
	const jwt =
		typeof rawToken === "string" && rawToken.startsWith("Bearer ")
			? rawToken.slice(7)
			: rawToken || "";
	const AUTH = jwt ? `Bearer ${jwt}` : "";

	if (!jwt) return <div style={{ padding: 16 }}>Inicia sesión para usar el chat…</div>;

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

	// UI / refs
	const [activeChatId, setActiveChatId] = useState(null);
	const activeChatIdRef = useRef(null);
	useEffect(() => { activeChatIdRef.current = activeChatId; }, [activeChatId]);

	const [text, setText] = useState("");
	const typingRef = useRef(false);
	const typingTimeout = useRef(null);

	const scrollByChat = useRef({});
	const listRef = useRef(null);
	const joinedChatsRef = useRef(new Set());

	// Fetch helpers
	async function fetchUsers() {
		try {
			const res = await fetch(`${API}/users/`, { headers: { Authorization: AUTH } });
			if (!res.ok) throw new Error("No se pudieron cargar los usuarios");
			const arr = await res.json();
			const map = {};
			arr.forEach((u) => (map[u.id] = u));
			setUsersById(map);
		} catch (e) { console.error(e); }
	}
	async function fetchPost(postId) {
		try {
			const res = await fetch(`${API}/posts/${postId}`, { headers: { Authorization: AUTH } });
			if (!res.ok) throw new Error("No se pudo cargar el post");
			const data = await res.json();
			setPostsById((prev) => ({ ...prev, [postId]: data }));
		} catch (e) { console.error(e); }
	}

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
		const content = text.trim();
		if (!content || !activeChatId) return;
		socket.emit("private_message", { chat_id: activeChatId, content });
		setText("");
		stopTyping();
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

	// SOCKET listeners
	useEffect(() => {
		function onConnect() {
			setConnected(true);
			socket.emit("identify", { token: jwt }); // jwt "puro"
		}
		function onDisconnect() { setConnected(false); }
		function onError(e) { pushError(e?.msg || e || "Error desconocido"); }

		function onIdentified() {
			fetchUsers();
			if (wantUserTwo && wantPostId) createChatSocket(wantUserTwo, wantPostId);
			else loadChats();
		}

		function onChats(payload) {
			const list = Array.isArray(payload) ? payload : [];
			setChats(list);

			// Únete a todos los rooms (para recibir mensajes/typing en segundo plano) y precarga posts
			list.forEach((c) => {
				if (!joinedChatsRef.current.has(c.id)) {
					joinChat(c.id);
					joinedChatsRef.current.add(c.id);
				}
				if (!postsById[c.post_id]) fetchPost(c.post_id);
			});

			// Selección inicial (si no hay activo)
			let target = activeChatIdRef.current;
			if (!target) {
				target = wantChatId || (list?.[0]?.id ?? null);
				if (target) {
					setActiveChatId(target);
					loadMessages(target);
				}
			}
		}

		function onChatCreated(chat) {
			setChats((prev) => [chat, ...prev]);
			setActiveChatId(chat.id);
			joinChat(chat.id);
			joinedChatsRef.current.add(chat.id);
			fetchPost(chat.post_id);
			loadMessages(chat.id);
		}

		function onChatExists(chat) {
			setActiveChatId(chat.id);
			joinChat(chat.id);
			joinedChatsRef.current.add(chat.id);
			fetchPost(chat.post_id);
			loadMessages(chat.id);
		}

		function onNewMessage(m) {
			setMessagesByChat((prev) => {
				const list = prev[m.chat_id] || [];
				return { ...prev, [m.chat_id]: [...list, m] };
			});

			if (m.chat_id === activeChatIdRef.current) {
				requestAnimationFrame(() => {
					if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
				});
			}
		}

		function onMessages({ chat_id, items, next_before_id }) {
			setMessagesByChat((prev) => {
				const cur = prev[chat_id] || [];
				const merged = [...items, ...cur];
				const seen = new Set();
				const dedup = merged.filter((x) =>
					seen.has(x.id) ? false : (seen.add(x.id), true)
				);
				return { ...prev, [chat_id]: dedup };
			});
			setNextBeforeByChat((prev) => ({ ...prev, [chat_id]: next_before_id }));

			if (chat_id === activeChatIdRef.current) {
				requestAnimationFrame(() => {
					if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
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
		socket.on("chat_created", onChatCreated);
		socket.on("chat_exists", onChatExists);
		socket.on("new_message", onNewMessage);
		socket.on("messages", onMessages);
		socket.on("typing", onTyping);

		socket.connect();
		return () => {
			socket.disconnect();
			socket.removeAllListeners();
			if (typingTimeout.current) clearTimeout(typingTimeout.current);
			joinedChatsRef.current = new Set();
		};
	}, [socket, jwt, wantChatId, wantPostId, postsById]);

	// refresco periódico de chats
	useEffect(() => {
		if (!connected || !jwt) return;
		const id = setInterval(() => loadChats(), 100);
		return () => clearInterval(id);
	}, [connected, jwt]);

	// cambio de chat activo
	useEffect(() => {
		if (!activeChatId) return;
		ensureChatState(activeChatId);
		// Unirse (idempotente) y cargar historial si no lo tenemos
		joinChat(activeChatId);
		if (!(messagesByChat[activeChatId]?.length)) loadMessages(activeChatId);

		// restaurar scroll (o ir al final la primera vez)
		requestAnimationFrame(() => {
			if (!listRef.current) return;
			const saved = scrollByChat.current[activeChatId];
			if (saved !== undefined) listRef.current.scrollTop = saved;
			else listRef.current.scrollTop = listRef.current.scrollHeight;
		});
	}, [activeChatId]);

	// guardar scroll por chat
	useEffect(() => {
		const el = listRef.current;
		if (!el) return;
		const handler = () => {
			if (activeChatId) scrollByChat.current[activeChatId] = el.scrollTop;
		};
		el.addEventListener("scroll", handler);
		return () => el.removeEventListener("scroll", handler);
	}, [activeChatId]);

	const handleLoadOlder = () => {
		if (!activeChatId) return;
		const beforeId = nextBeforeByChat[activeChatId];
		if (beforeId) loadMessages(activeChatId, beforeId);
	};

	const typingOthers = Array.from(typingByChat[activeChatId || -1] || []).filter(
		(uid) => Number(uid) !== userId
	);
	const anyoneTyping = typingOthers.length > 0;

	return (
		<div
			style={{
				display: "grid",
				gridTemplateColumns: "340px 1fr",
				height: "80vh",
				gap: 12,
				padding: 12,
				background: WP_COLORS.appBg,
				fontFamily: "system-ui, Arial",
			}}
		>
			{/* Sidebar */}
			<aside
				style={{
					border: `1px solid ${WP_COLORS.border}`,
					borderRadius: 14,
					overflow: "hidden",
					background: WP_COLORS.chatListBg,
					display: "grid",
					gridTemplateRows: "auto 1fr auto",
				}}
			>
				<div
					style={{
						background: WP_COLORS.headerBg,
						color: WP_COLORS.headerText,
						padding: 12,
						fontWeight: 700,
					}}
				>
					Chats
				</div>

				<ul style={{ listStyle: "none", padding: 8, margin: 0, overflow: "auto" }}>
					{chats.map((c) => {
						const otherId = c.user_one === userId ? c.user_two : c.user_one;
						const other = usersById[otherId];
						const title = other?.username || `Usuario ${otherId}`;
						const img = other?.image;

						const post = postsById[c.post_id];
						const subtitle = post
							? `${post.description} · ${post.divisas_one} → ${post.divisas_two}`
							: `Post #${c.post_id}`;

						const msgs = messagesByChat[c.id] || [];
						const last = msgs[msgs.length - 1];
						const lastPrefix =
							last?.user_id === userId
								? "Tú: "
								: usersById[last?.user_id]?.username
									? `${usersById[last.user_id].username}: `
									: "";
						const lastMsgText = last ? `${lastPrefix}${last.content}` : "Sin mensajes";
						const preview =
							lastMsgText.length > 32 ? lastMsgText.slice(0, 32) + "…" : lastMsgText;

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
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
									}}
								>
									<div style={{ display: "flex", gap: 10, alignItems: "center" }}>
										{img ? (
											<img
												src={img}
												alt={title}
												style={{
													width: 34,
													height: 34,
													borderRadius: "50%",
													objectFit: "cover",
												}}
											/>
										) : (
											<Avatar seed={title} />
										)}
										<div>
											<div style={{ fontWeight: 600 }}>{title}</div>
											<div style={{ fontSize: 12, color: "#6b7280" }}>{subtitle}</div>
											<div style={{ fontSize: 12, color: "#9ca3af" }}>{preview}</div>
										</div>
									</div>
								</button>
							</li>
						);
					})}
				</ul>
			</aside>

			{/* Panel principal */}
			<section
				style={{
					border: `1px solid ${WP_COLORS.border}`,
					borderRadius: 14,
					display: "grid",
					gridTemplateRows: "auto 1fr auto",
					overflow: "hidden",
					background: "#F8F8F8",
				}}
			>
				{/* Header del chat */}
				<div
					style={{
						background: WP_COLORS.headerBg,
						color: WP_COLORS.headerText,
						padding: 12,
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						gap: 12,
					}}
				>
					{(() => {
						const chat = chats.find((ch) => ch.id === activeChatId);
						if (!chat) return <div>Selecciona un chat</div>;

						const otherId = chat.user_one === userId ? chat.user_two : chat.user_one;
						const other = usersById[otherId];
						const title = other?.username || `Usuario ${otherId}`;
						const img = other?.image;
						const post = postsById[chat.post_id];

						const sub = post
							? `${post.description} ${post.divisas_one} → ${post.divisas_two}`
							: "";
						const dest = post?.destination ? `📍 ${post.destination}` : "";

						return (
							<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
								{img ? (
									<img
										src={img}
										alt={title}
										style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover" }}
									/>
								) : (
									<Avatar seed={title} />
								)}
								<div>
									<div style={{ fontWeight: 700 }}>{title}</div>
									{/* typing debajo del username */}
									{typingOthers.length > 0 ? (
										<div style={{ fontSize: 12, opacity: 0.9 }}>
											{typingOthers.length === 1
												? `${usersById[typingOthers[0]]?.username || "Usuario"} está escribiendo…`
												: `Varios están escribiendo…`}
										</div>
									) : (
										<div style={{ fontSize: 12, opacity: 0.9 }}>{sub}</div>
									)}
									{dest && <div style={{ fontSize: 11, opacity: 0.8 }}>{dest}</div>}
								</div>
							</div>
						);
					})()}

					{activeChatId && (
						<button
							onClick={handleLoadOlder}
							style={{
								background: "transparent",
								color: WP_COLORS.headerText,
								border: `1px solid ${WP_COLORS.headerText}`,
								borderRadius: 8,
								padding: "6px 10px",
								cursor: "pointer",
							}}
						>
							Cargar anteriores
						</button>
					)}
				</div>

				{/* Mensajes */}
				<div
					ref={listRef}
					style={{
						padding: 12,
						overflow: "auto",
						background: `linear-gradient(180deg, ${WP_COLORS.appBg}, #FFFFFF)`,
					}}
				>
					{(messagesByChat[activeChatId || -1] || []).map((m) => {
						const author = usersById[m.user_id];
						return (
							<MessageBubble
								key={m.id}
								mine={Number(m.user_id) === userId}
								content={m.content}
								id={m.id}
								authorName={author?.username}
								authorImg={author?.image}
							/>
						);
					})}
				</div>

				{/* Input */}
				<div
					style={{
						display: "flex",
						gap: 8,
						padding: 10,
						background: "#F0F0F0",
						alignItems: "center",
					}}
				>
					<input
						value={text}
						onChange={(e) => {
							setText(e.target.value);
							if (e.target.value) startTyping();
							else stopTyping();
						}}
						onKeyDown={(e) => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault();
								sendMessage();
							}
						}}
						placeholder={activeChatId ? "Escribe un mensaje" : "Selecciona un chat"}
						disabled={!activeChatId}
						style={{
							flex: 1,
							borderRadius: 20,
							border: `1px solid ${WP_COLORS.border}`,
							padding: "10px 14px",
							background: "white",
						}}
					/>
					<button
						onClick={sendMessage}
						disabled={!activeChatId || !text.trim()}
						style={{
							background: WP_COLORS.accent,
							color: "white",
							border: "none",
							borderRadius: 20,
							padding: "10px 14px",
							cursor: "pointer",
						}}
					>
						Enviar
					</button>
				</div>
			</section>
		</div>
	);
}

function MessageBubble({ mine, content, id, ephemeral, authorName, authorImg }) {
	return (
		<div
			style={{
				display: "flex",
				justifyContent: mine ? "flex-end" : "flex-start",
				marginBottom: 8,
				opacity: ephemeral ? 0.7 : 1,
				gap: 8,
			}}
			title={typeof id === "number" ? `msg #${id}` : undefined}
		>
			{/* Avatar solo en mensajes del otro */}
			{!mine &&
				(authorImg ? (
					<img
						src={authorImg}
						alt={authorName || "Usuario"}
						style={{ width: 28, height: 28, borderRadius: "9999px", objectFit: "cover" }}
					/>
				) : (
					<Avatar seed={authorName || "Usuario"} />
				))}

			<div
				style={{
					maxWidth: 560,
					padding: "8px 10px",
					borderRadius: 10,
					border: `1px solid ${WP_COLORS.border}`,
					background: mine ? WP_COLORS.bubbleMine : WP_COLORS.bubbleOther,
					whiteSpace: "pre-wrap",
					wordBreak: "break-word",
					boxShadow: "0 1px 0 rgba(0,0,0,0.03)",
				}}
			>
				{!mine && authorName && (
					<div style={{ fontSize: 11, fontWeight: 700, marginBottom: 2, opacity: 0.75 }}>
						{authorName}
					</div>
				)}
				{content}
			</div>
		</div>
	);
}

function Avatar({ seed }) {
	return (
		<div
			style={{
				width: 28,
				height: 28,
				borderRadius: "9999px",
				background: "#E5E7EB",
				display: "grid",
				placeItems: "center",
				fontSize: 11,
				fontWeight: 700,
			}}
			title={seed}
		>
			{String(seed).slice(0, 2).toUpperCase()}
		</div>
	);
}
