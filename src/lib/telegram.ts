const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;

export async function sendMessage(chatId: string, text: string, options: any = {}) {
  const url = `${API_BASE}/sendMessage`;
  const body: any = {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    ...options,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return res.json();
}

export async function sendJobPreview(chatId: string, jobData: any) {
  const text = `
<b>🔍 Предпросмотр вакансии</b>

<b>Должность:</b> ${jobData.title}
<b>Сфера:</b> ${jobData.category}
<b>Район:</b> ${jobData.district}
<b>Зарплата:</b> ${jobData.salaryText}
<b>График:</b> ${jobData.schedule}

<b>Описание:</b>
${jobData.description}

<b>Контакт:</b> ${jobData.contact}

<i>Все верно? Опубликовать вакансию?</i>
  `.trim();

  const keyboard = {
    inline_keyboard: [
      [
        { text: "✅ Опубликовать", callback_data: "publish_job" },
        { text: "❌ Отмена", callback_data: "cancel_job" }
      ],
      [
        { text: "📝 Изменить", callback_data: "edit_job" }
      ]
    ]
  };

  return sendMessage(chatId, text, { reply_markup: keyboard });
}

export async function answerCallbackQuery(callbackQueryId: string, text?: string) {
  const url = `${API_BASE}/answerCallbackQuery`;
  const body: any = {
    callback_query_id: callbackQueryId,
    text,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return res.json();
}

export async function editMessageText(chatId: string, messageId: number, text: string, options: any = {}) {
  const url = `${API_BASE}/editMessageText`;
  const body: any = {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: "HTML",
    ...options,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return res.json();
}
