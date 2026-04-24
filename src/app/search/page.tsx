import prisma from "@/lib/prisma";
import SearchClient from "./SearchClient";
import { getHybridJobs } from "@/lib/mock-data";

export default async function SearchPage() {
  const dbJobs = await prisma.job.findMany({
    where: { status: "published" },
    orderBy: { createdAt: "desc" },
    take: 100, // load more for search
  });

  const jobs = getHybridJobs(dbJobs as any);

  // Here normally you'd fetch the user's real candidate profile from DB via NextAuth session.
  // We'll pass null since the client will rely on localStorage for the MVP mock candidate profile
  
  return <SearchClient initialJobs={jobs as any} initialCandidate={null} />;
}
