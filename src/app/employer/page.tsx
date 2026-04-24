import prisma from "@/lib/prisma";
import EmployerContent from "./EmployerContent";

export default async function EmployerPage() {
  const jobs = await prisma.job.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <EmployerContent
      jobs={jobs as any}
      jobsCount={jobs.length}
    />
  );
}
