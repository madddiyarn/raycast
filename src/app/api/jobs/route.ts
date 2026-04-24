import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const { title, description, category, district, salaryMin, salaryMax, salaryText, schedule, employmentType, contact, studentFriendly, experienceRequired } = body;

  if (!title || !description) {
    return NextResponse.json({ message: "Заполните обязательные поля" }, { status: 400 });
  }

  const job = await prisma.job.create({
    data: {
      rawText: `${title}\n${description}`,
      title,
      description,
      category: category || "Другое",
      district: district || "Центр",
      salaryMin: Number(salaryMin) || 0,
      salaryMax: Number(salaryMax) || 0,
      salaryText: salaryText || "",
      schedule: schedule || "Обсуждается",
      employmentType: employmentType || "Полная занятость",
      contact: contact || "",
      studentFriendly: Boolean(studentFriendly),
      experienceRequired: Boolean(experienceRequired),
      sourceType: "web_form",
      status: "published",
    },
  });

  return NextResponse.json({ success: true, job }, { status: 201 });
}

export async function GET() {
  const jobs = await prisma.job.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
  return NextResponse.json(jobs);
}
