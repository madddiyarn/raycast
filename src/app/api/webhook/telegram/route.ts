import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const update = await req.json();

    // 1. Убеждаемся, что получили текст из Телеграма
    if (!update.message || !update.message.text) {
      return NextResponse.json({ status: "ignored" });
    }

    const { text, chat, from } = update.message;

    // 2. Ловим только те сообщения, что начинаются с /job
    if (!text.toLowerCase().startsWith("/job")) {
      return NextResponse.json({ status: "ignored - not a job post" });
    }

    const rawJobText = text.replace("/job", "").trim();

    let parsedJobData;

    try {
      // 3. Отправляем текст нейросети на OpenRouter
      const prompt = `Ты умный HR-помощник. Тебе прислали сырой текст вакансии. 
Вытащи из него данные и верни СТРОГО в формате JSON без никаких лишних слов, без кавычек markdown.
Ожидаемый JSON:
{
  "title": "Должность",
  "description": "Описание вакансии и требования",
  "category": "Категория работы",
  "district": "Город или Район",
  "salaryMin": (число или 0),
  "salaryMax": (число или 0),
  "salaryText": "Оплата текстом",
  "schedule": "График (например: 2/2, 5/2, Гибкий)",
  "employmentType": "Тип занятости",
  "contact": "Куда писать звонить"
}
Текст: ${rawJobText}`;

      const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini", 
          messages: [{ role: "user", content: prompt }]
        })
      });

      const aiData = await aiRes.json();
      const rawAiText = aiData.choices[0].message.content;
      
      // Вырезаем Markdown форматирование если нейросеть его добавила
      const jsonStart = rawAiText.indexOf("{");
      const jsonEnd = rawAiText.lastIndexOf("}") + 1;
      const cleanJson = rawAiText.slice(jsonStart, jsonEnd);
      
      parsedJobData = JSON.parse(cleanJson);
      
    } catch (apiError) {
      console.error("AI Parsing Error", apiError);
      // Если ИИ сломался, добавляем как черновик 
      parsedJobData = {
        title: "Новая вакансия",
        description: rawJobText,
        category: "Не определено",
        district: "Неизвестно",
        salaryMin: 0,
        salaryMax: 0,
        salaryText: "Не указано",
        schedule: "Неизвестно",
        employmentType: "Неизвестно",
        contact: from?.username ? `@${from.username}` : "Не указано"
      };
    }

    // 4. Сохраняем в нашу базу данных Neon
    const newJob = await prisma.job.create({
      data: {
        rawText: text,
        title: parsedJobData.title || "Новая вакансия",
        description: parsedJobData.description || rawJobText,
        category: parsedJobData.category || "Общее",
        district: parsedJobData.district || "Актау",
        salaryMin: parsedJobData.salaryMin || 0,
        salaryMax: parsedJobData.salaryMax || 0,
        salaryText: parsedJobData.salaryText || "По договоренности",
        schedule: parsedJobData.schedule || "Обсуждается",
        employmentType: parsedJobData.employmentType || "Полная занятость",
        experienceRequired: false,
        studentFriendly: false,
        contact: parsedJobData.contact || "В личные сообщения",
        sourceType: `telegram_chat`,
        status: "published",
      },
    });

    return NextResponse.json({ status: "success", jobId: newJob.id });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
