import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning up existing data...");

  console.log("Seeding 5 accounts...");
  const users = [
    { email: "admin@jumys.kz", name: "Администратор", role: "admin", passwordHash: "password123" },
    { email: "employer1@turan.kz", name: "Тура Кафе", role: "employer", passwordHash: "password123" },
    { email: "employer2@aktau.kz", name: "Магазин Актау", role: "employer", passwordHash: "password123" },
    { email: "candidate1@mail.ru", name: "Марат", role: "candidate", passwordHash: "password123" },
    { email: "candidate2@mail.ru", name: "Аружан", role: "candidate", passwordHash: "password123" },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        name: u.name,
        role: u.role,
        passwordHash: u.passwordHash,
      },
    });
  }

  console.log("Seeding 15 vacancies...");
  const vacancies = [
    { title: "Бариста", category: "HoReCa", district: "14 мкр", salaryMin: 150000, salaryMax: 200000, schedule: "2/2", employmentType: "Полная занятость", studentFriendly: true, experienceRequired: false },
    { title: "Продавец-консультант", category: "Retail", district: "12 мкр", salaryMin: 180000, salaryMax: 250000, schedule: "5/2", employmentType: "Полная занятость", studentFriendly: false, experienceRequired: true },
    { title: "Официант", category: "HoReCa", district: "Самал", salaryMin: 120000, salaryMax: 180000, schedule: "Гибкий", employmentType: "Частичная занятость", studentFriendly: true, experienceRequired: false },
    { title: "Курьер", category: "Доставка", district: "Центр", salaryMin: 200000, salaryMax: 350000, schedule: "Гибкий", employmentType: "Подработка", studentFriendly: true, experienceRequired: false },
    { title: "Повар холодного цеха", category: "HoReCa", district: "27 мкр", salaryMin: 220000, salaryMax: 300000, schedule: "6/1", employmentType: "Полная занятость", studentFriendly: false, experienceRequired: true },
    { title: "Кассир", category: "Retail", district: "29 мкр", salaryMin: 160000, salaryMax: 210000, schedule: "2/2", employmentType: "Полная занятость", studentFriendly: true, experienceRequired: false },
    { title: "Администратор отеля", category: "Service", district: "Самал", salaryMin: 250000, salaryMax: 350000, schedule: "5/2", employmentType: "Полная занятость", studentFriendly: false, experienceRequired: true },
    { title: "Горничная", category: "Service", district: "Мангышлак", salaryMin: 140000, salaryMax: 190000, schedule: "2/2", employmentType: "Полная занятость", studentFriendly: false, experienceRequired: false },
    { title: "SMM-менеджер", category: "IT", district: "Центр", salaryMin: 180000, salaryMax: 280000, schedule: "Удаленно", employmentType: "Проектная", studentFriendly: true, experienceRequired: true },
    { title: "Водитель", category: "Доставка", district: "Болашак", salaryMin: 300000, salaryMax: 450000, schedule: "5/2", employmentType: "Полная занятость", studentFriendly: false, experienceRequired: true },
    { title: "Парикмахер", category: "Beauty", district: "11 мкр", salaryMin: 200000, salaryMax: 400000, schedule: "Гибкий", employmentType: "Частичная занятость", studentFriendly: false, experienceRequired: true },
    { title: "Грузчик", category: "Строительство", district: "Береке", salaryMin: 180000, salaryMax: 240000, schedule: "6/1", employmentType: "Полная занятость", studentFriendly: false, experienceRequired: false },
    { title: "Медсестра", category: "Медицина", district: "26 мкр", salaryMin: 220000, salaryMax: 280000, schedule: "5/2", employmentType: "Полная занятость", studentFriendly: false, experienceRequired: true },
    { title: "Преподаватель английского", category: "Образование", district: "13 мкр", salaryMin: 250000, salaryMax: 500000, schedule: "Гибкий", employmentType: "Частичная занятость", studentFriendly: true, experienceRequired: true },
    { title: "Автомойщик", category: "Service", district: "Центр", salaryMin: 150000, salaryMax: 250000, schedule: "2/2", employmentType: "Подработка", studentFriendly: true, experienceRequired: false },
  ];

  for (const v of vacancies) {
    await prisma.job.create({
      data: {
        ...v,
        description: `Станьте частью нашей команды в качестве ${v.title}. Мы предлагаем конкурентную зарплату и дружный коллектив.`,
        salaryText: `${v.salaryMin.toLocaleString()} - ${v.salaryMax.toLocaleString()} ₸`,
        rawText: `Новая вакансия: ${v.title} в г. Актау. Микрорайон ${v.district}. Звонить по телефону.`,
        contact: "@hr_aktau_work",
        sourceType: "telegram",
        status: "published",
      }
    });
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
