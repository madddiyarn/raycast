import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const rawData = `Су-шеф,,HoReCa,19000 за смену,2/2 11:00-00:00,12 мкр,Опыт су-шеф,87777517929
Оператор БСУ,,Строительство,200000 ₸,по договоренности,Мангистауская обл.,Опыт работы,77059110109
Сварщик,,Строительство,250000 ₸,по договоренности,Мангистауская обл.,Опыт сварки,77059110109
Офис-менеджер,,Другое,150000 ₸,стандартный,14 мкр,ПК навыки,77059110109
Охранник,,Другое,200000/мес,30/30,Промзона,Опыт приветствуется,77059110109
Горничная (вахта),,Service,170000/15 дней,вахта,Актау,Опыт 3 года,87077220577
Инженер-проектировщик,,Строительство,300000 ₸,полный день,Центр,Revit AutoCAD,87009438550
Менеджер ZAMAN,ZAMAN,Retail,150000 ₸,6/1 11-19,Актау,без опыта,87752278908
Продавец аксессуаров,,Retail,200000+,5/2 или 6/1,ТРК Актау,общительность,77711251121
Ресепшн SAUYQ TIME,SAUYQ TIME,Service,120000 ₸,по договоренности,Актау,,87715236081
Кассир La Bella,La Bella,Retail,170000,6/1,Актау,Rosta,87757449418
Коммерческий директор стоматологии,,Медицина,500000 ₸,по договоренности,17 мкр,опыт управления,87752884607
Техперсонал бильярд,,Service,100000 ₸,2/2,Актау,ответственность,87024735772
Кондитер,,HoReCa,200000 ₸,по договоренности,Актау,опыт,87051119470
Бариста,,HoReCa,150000 ₸,по договоренности,Актау,опыт,87051119470
Экскурсовод,,Service,7000+бонусы,2/1 11-22,Актау,языки,77005808191
Помощник бариста,,HoReCa,100000 ₸,5/2,Актау,база кофе,77479041619
Продавец продуктовый,,Retail,240000,1/1,Актау,опыт,77026410733
Мастер мебельный,,Строительство,300000 ₸,полный день,Промзона,опыт,87007770214
Тайный покупатель,,Service,5000 ₸,гибкий,Актау,внимательность,87074841604
Кассир Дана,,Retail,150000 ₸,полный день,Актау,опыт,77752806502
Санитарка,,Медицина,100000 ₸,6/1,Актау,без требований,87015296385
Консультант Beautylife,,Retail,120000-130000,2/2,Актау,языки,87085302761
Мастер лазерной эпиляции,,Beauty,200000 ₸,2/2,Актау,обучение есть,87073331461
Ревизор,,Другое,8000/смена,9 часов,Актау,опыт,87077004201
АФК тренер,,Образование,250000 ₸,по договоренности,Актау,работа с детьми,87714921141
Горничные Кендерли,,Service,250000+,6/1,Актау,без требований,87760761316
Кассир Dana,,Retail,150000 ₸,гибкий,Актау,опыт,77002220001
Кардиолог,,Медицина,% от приема,гибкий,Актау,диплом,77076008500
Бариста кофейня,,HoReCa,150000 ₸,5/2,Актау,опыт,77774711717
Официант Aya Family,,HoReCa,120000 ₸,6/1,Актау,опыт,77760229889
Охранник стройка,,Другое,150000 ₸,1/2,Актау,без требований,87023932096
Курьер,,Доставка,15000/день,гибкий,Актау,,77764806355
Продавец Doral,Doral,Retail,200000+бонус,6/1,Актау,опыт,77003001909
Администратор баня,,Service,10000/сутки,сменный,Актау,развозка,опыт,87759336270
Повар горячего цеха,,HoReCa,15000/день,5/2,Актау,опыт,87474968013
Водитель такси,,Транспорт,50/50,гибкий,Актау,авто,77784636394
Торговый представитель REDZ,REDZ,Retail,300000 ₸,5/2,Актау,авто обязателен,77753050101`;

async function main() {
  console.log("Cleaning DB...");
  await prisma.job.deleteMany();
  await prisma.user.deleteMany();

  console.log("Creating 10 Employers...");
  const employers = [];
  const passwordHash = await bcrypt.hash("password123", 10);
  
  for (let i = 1; i <= 10; i++) {
    const employer = await prisma.user.create({
      data: {
        name: `Администратор ${i}`,
        email: `admin${i}@raycast.kz`,
        passwordHash,
        role: "employer",
        telegram: `@admin${i}_raycast`,
      }
    });
    employers.push(employer);
  }

  console.log("Jobs processing...");
  const lines = rawData.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const cols = line.split(',');
    if (cols.length < 8) continue;
    
    const [title, company, category, salary, schedule, location, requirements, contact] = cols;
    
    const randomEmployer = employers[Math.floor(Math.random() * employers.length)];

    let salaryMinNum = parseInt(salary.split(/[-+]/)[0].replace(/\D/g, '')) || 0;
    if (salary.includes('за смену') || salary.includes('/день') || salary.includes('/сутки')) {
       salaryMinNum = salaryMinNum * 15; // approximate monthly
    }
    
    let dbCategory = category;
    if (!["HoReCa","Retail","Service","IT","Beauty","Доставка","Строительство","Медицина","Образование","Другое"].includes(category)) {
      dbCategory = "Другое";
    }

    let districtStr = location;
    if (districtStr.toLowerCase().includes("акт") || districtStr.toLowerCase().includes("обл")) {
      districtStr = "Центр"; 
    }

    await prisma.job.create({
      data: {
        title: company ? `${title} (${company})` : title,
        description: `Обязанности и требования:\n${requirements ? requirements : 'Отзывчивость и ответственность'}\n\nГрафик: ${schedule}\nЗарплата: ${salary}\nЛокация: ${location}`,
        category: dbCategory,
        salaryMin: salaryMinNum,
        salaryMax: salaryMinNum * 1.5,
        salaryText: salary,
        schedule: schedule,
        employmentType: "Полная занятость",
        district: districtStr,
        contact: `@${contact}`,
        studentFriendly: !requirements || requirements.toLowerCase().includes('без'),
        experienceRequired: !!requirements && requirements.toLowerCase().includes('опыт'),
        status: "published",
        sourceType: "manual_seed",
        employerId: randomEmployer.id,
        rawText: line,
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
