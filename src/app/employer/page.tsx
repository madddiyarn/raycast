import prisma from "@/lib/prisma";
import EmployerContent from "./EmployerContent";

export default async function EmployerPage() {
  let jobs: any[] = [];
  try {
    jobs = await prisma.job.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  } catch (error) {
    console.error("Failed to fetch employer jobs:", error);
  }

  return (
    <EmployerContent
      jobs={jobs}
      jobsCount={jobs.length}
    />
  );
}
