export function getExchangeDate(post) {
  if (post?.exchange_date) return String(post.exchange_date);

  if (post?.day_exchange) return String(post.day_exchange);

}

export function stripExchangeTag(text = "") {
  return text.replace(/\s*\[exchange:\d{4}-\d{2}-\d{2}\]\s*/g, "").trim();
}

export function todayYMD() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}