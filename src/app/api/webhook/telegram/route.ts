import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import * as tg from "@/lib/telegram";
import { Prisma } from "@prisma/client";

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
      const { id, data, message } = payload.callback_query;
      const chatId = String(message.chat.id);

      const session = await prisma.telegramSession.findUnique({ where: { chatId } });
      if (!session) return NextResponse.json({ ok: true });

      if (data === "publish_job" && session.data) {
        const jobData = (session.data as any).job;
        const improved = (session.data as any).improvedDescription;

        // 1. Create the job
        const job = await prisma.job.create({
          data: {
            ...jobData,
            description: improved || jobData.description,
            rawText: JSON.stringify(session.data),
            sourceType: "telegram_bot",
            status: "published",
          }
        });

        await tg.editMessageText(chatId, message.message_id, "✅ <b>Вакансия опубликована!</b>\n\nОна уже доступна на сайте и в поиске для кандидатов.");
        
        // 2. Candidate Matching & Notification
        try {
          const matches = await prisma.candidateProfile.findMany({
            where: {
              category: job.category,
              district: job.district,
            },
            include: { user: true },
            take: 3
          });

          if (matches.length > 0) {
            let matchText = `📩 <b>Найдены подходящие кандидаты (${matches.length}):</b>\n\n`;
            matches.forEach((m: any, i: number) => {
              matchText += `${i + 1}. <b>${m.user.name || "Кандидат"}</b> — Рядом, ${m.skills || "быстро обучается"}\n`;
            });
            matchText += `\nПригласить их на собеседование?`;
            
            await tg.sendMessage(chatId, matchText, {
              reply_markup: {
                inline_keyboard: [[{ text: "🤝 Пригласить всех", callback_data: `invite_matches_${job.id}` }]]
              }
            });
          }
        } catch (matchErr) {
          console.error("Match error:", matchErr);
        }

        await prisma.telegramSession.update({ 
          where: { chatId }, 
          data: { state: "IDLE", data: Prisma.JsonNull } 
        });
      } 
      else if (data.startsWith("invite_matches")) {
        await tg.sendMessage(chatId, "✅ <b>Приглашения отправлены!</b>\n\nКандидаты уведомлены. Я сообщу вам, как только кто-то подтвердит участие.");
        await tg.answerCallbackQuery(id);
      }
      else if (data === "cancel_job") {
        await tg.editMessageText(chatId, message.message_id, "❌ Публикация отменена. Сессия сброшена.");
        await prisma.telegramSession.update({ 
          where: { chatId }, 
          data: { state: "IDLE", data: Prisma.JsonNull } 
        });
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

      // Check for Suspicious Content
      if (aiResponse.job.salaryMin > 5000000 || aiResponse.job.description?.toLowerCase().includes("крипто") || aiResponse.job.description?.toLowerCase().includes("обнал")) {
        await tg.sendMessage(chatId, "⚠ <b>Внимание:</b> Вакансия выглядит подозрительно (слишком высокая зарплата или ключевые слова). Пожалуйста, убедитесь в законности предложения.");
      }

      // Check for Duplicates
      const duplicate = await prisma.job.findFirst({
        where: {
          title: aiResponse.job.title,
          district: aiResponse.job.district,
          status: "published",
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24h
        }
      });

      if (duplicate) {
        await tg.sendMessage(chatId, `⚠ <b>Похожая вакансия уже опубликована:</b>\n\n<i>"${duplicate.title} в ${duplicate.district}"</i>\n\nВы всё равно хотите создать новую?`);
      }

      if (aiResponse.needsMoreInfo && aiResponse.missingFields.length > 0) {
        await tg.sendMessage(chatId, `📔 <b>Я почти всё понял!</b>\n\n${aiResponse.explanation}\n\nПожалуйста, уточните недостающие детали.`);
        await prisma.telegramSession.update({
          where: { chatId },
          data: { state: "AWAITING_INFO", data: aiResponse as any }
        });
      } else {
        await tg.sendJobPreview(chatId, aiResponse.job);
        await prisma.telegramSession.update({
          where: { chatId },
          data: { state: "AWAITING_CONFIRMATION", data: aiResponse as any }
        });
      }
    } else if (session.state === "AWAITING_CONFIRMATION") {
      await tg.sendMessage(chatId, "Пожалуйста, используйте кнопки под предпросмотром вакансии для выбора действия.");
    }

    return NextResponse.json({ ok: true, version: "v2.0-ai-assistant" });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Internal Error", version: "v2.0-ai-assistant" }, { status: 500 });
  }
}
