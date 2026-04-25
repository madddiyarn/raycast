import prisma from "@/lib/prisma";
import SearchClient from "./SearchClient";
import { getHybridJobs } from "@/lib/mock-data";

export default async function SearchPage() {
  let dbJobs: any[] = [];
  try {
    dbJobs = await prisma.job.findMany({
      where: { status: "published" },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  } catch (error) {
    console.error("Failed to fetch search jobs:", error);
  }

  const jobs = getHybridJobs(dbJobs);
  
  return <SearchClient initialJobs={jobs as any} initialCandidate={null} />;
}
