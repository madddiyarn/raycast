import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import * as tg from "@/lib/telegram";

const OPENROUTER_MODEL = "openai/gpt-4o-mini";

async function getAiParsing(rawText: string, existingData: any = {}) {
  const prompt = `
Ты — умный HR-помощник ИИ для платформы "Jumys Relay".
Твоя задача: проанализировать текст вакансии и вытащить данные.
Текст может быть на русском, казахском (кириллица или латиница/транслит) или смешанном.
Учитывай сленг: "лям" = 1000000, "косарь" = 1000, "полтинник" = 50000, "2/2" = график.
Районы Актау: 14 мкр, 15 мкр, Самал и т.д.

Текущие накопленные данные (если есть): ${JSON.stringify(existingData)}
Новое сообщение от пользователя: "${rawText}"

Верни данные СТРОГО в формате JSON:
{
  "isJobPosting": boolean (правда ли это текст вакансии или дополнение к ней),
  "job": {
    "title": "Должность",
    "description": "Краткое описание",
    "category": "Категория",
    "district": "Район (например, 14 мкр)",
    "salaryMin": число,
    "salaryMax": число,
    "salaryText": "Оплата текстом",
    "schedule": "График",
    "employmentType": "Тип занятости",
    "contact": "Ссылка на тг или телефон"
  },
  "missingFields": ["field1", "field2"], // список того, чего КРИТИЧЕСКИ не хватает для публикации из: [title, district, salaryText, schedule, contact]
  "needsMoreInfo": boolean,
  "improvedDescription": "Красивый текст вакансии от ИИ, исправляющий ошибки и делающий ее привлекательной",
  "explanation": "Короткая фраза: что ты понял и чего не хватает (на русском)"
}
  `.trim();

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await res.json();
    const rawAiText = data.choices[0].message.content;
    const jsonStart = rawAiText.indexOf("{");
    const jsonEnd = rawAiText.lastIndexOf("}") + 1;
    return JSON.parse(rawAiText.slice(jsonStart, jsonEnd));
  } catch (err) {
    console.error("AI Error:", err);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    if (searchParams.get("secret") !== process.env.TELEGRAM_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await req.json();

    // --- HANDLE CALLBACK QUERIES ---
    if (payload.callback_query) {
      const { id, data, message, from } = payload.callback_query;
      const chatId = String(message.chat.id);

      const session = await prisma.telegramSession.findUnique({ where: { chatId } });
      if (!session) return NextResponse.json({ ok: true });

      if (data === "publish_job" && session.data) {
        const jobData = (session.data as any).job;
        const improved = (session.data as any).improvedDescription;

        await prisma.job.create({
          data: {
            ...jobData,
            description: improved || jobData.description,
            rawText: JSON.stringify(session.data),
            sourceType: "telegram_bot",
            status: "published",
          }
        });

        await tg.editMessageText(chatId, message.message_id, "✅ <b>Вакансия опубликована!</b>\n\nОна уже доступна на сайте и в поиске для кандидатов.");
        await prisma.telegramSession.update({ where: { chatId }, data: { state: "IDLE", data: null } });
      } 
      else if (data === "cancel_job") {
        await tg.editMessageText(chatId, message.message_id, "❌ Публикация отменена. Сессия сброшена.");
        await prisma.telegramSession.update({ where: { chatId }, data: { state: "IDLE", data: null } });
      }
      else if (data === "edit_job") {
        await tg.sendMessage(chatId, "Хорошо, напишите исправленные данные или просто пришлите вакансию заново.");
        await prisma.telegramSession.update({ where: { chatId }, data: { state: "IDLE" } });
      }

      await tg.answerCallbackQuery(id);
      return NextResponse.json({ ok: true });
    }

    // --- HANDLE MESSAGES ---
    if (!payload.message || !payload.message.text) return NextResponse.json({ ok: true });

    const { text, chat } = payload.message;
    const chatId = String(chat.id);

    let session = await prisma.telegramSession.findUnique({ where: { chatId } });
    if (!session) {
      session = await prisma.telegramSession.create({ data: { chatId, state: "IDLE" } });
    }

    // Command handling
    if (text === "/start") {
      await tg.sendMessage(chatId, "👋 <b>Привет! Я ваш AI-ассистент Jumys Relay.</b>\n\nПришлите текст вакансии (даже в свободной форме), и я помогу её оформить и опубликовать.\n\nНапример:\n<i>\"Нужен бариста в 14 мкр, 2/2, 180к ақша\"</i>");
      return NextResponse.json({ ok: true });
    }

    // State Machine
    if (session.state === "IDLE" || session.state === "AWAITING_INFO") {
      const isInitial = session.state === "IDLE";
      
      // If idle, we only start if it looks like a job or starts with /job
      if (isInitial && !text.toLowerCase().includes("нужен") && !text.toLowerCase().includes("керек") && !text.toLowerCase().includes("/job")) {
        await tg.sendMessage(chatId, "Пришлите текст вакансии, чтобы начать. (Например: /job Бариста...)");
        return NextResponse.json({ ok: true });
      }

      await tg.sendMessage(chatId, "⏳ <i>Анализирую вашу вакансию...</i>");
      
      const existingData = session.data || {};
      const aiResponse = await getAiParsing(text, isInitial ? {} : existingData);

      if (!aiResponse || !aiResponse.isJobPosting) {
        await tg.sendMessage(chatId, "Извините, я не понял, что это вакансия. Попробуйте написать подробнее.");
        return NextResponse.json({ ok: true });
      }

      if (aiResponse.needsMoreInfo && aiResponse.missingFields.length > 0) {
        await tg.sendMessage(chatId, `📔 <b>Я почти всё понял!</b>\n\n${aiResponse.explanation}\n\nПожалуйста, уточните недостающие детали.`);
        await prisma.telegramSession.update({
          where: { chatId },
          data: { state: "AWAITING_INFO", data: aiResponse as any }
        });
      } else {
        // Preview ready
        await tg.sendJobPreview(chatId, aiResponse.job);
        await prisma.telegramSession.update({
          where: { chatId },
          data: { state: "AWAITING_CONFIRMATION", data: aiResponse as any }
        });
      }
    } else if (session.state === "AWAITING_CONFIRMATION") {
      await tg.sendMessage(chatId, "Пожалуйста, используйте кнопки под предпросмотром вакансии для выбора действия.");
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
