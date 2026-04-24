import { Job, SearchFilters } from "./types";
import { calculateMatchScore as realCalculateMatchScore, getFullMatchResult } from "./matching";

/**
 * Mocks the complex search filtering, sorting, and AI match calculations
 * that would normally happen on the backend via embeddings or SQL.
 */

// Simple filter algorithm
export function filterJobs(jobs: Job[], filters: SearchFilters): Job[] {
  return jobs.filter((job) => {
    if (filters.query) {
      const q = filters.query.toLowerCase();
      if (!job.title?.toLowerCase().includes(q) && !job.description?.toLowerCase().includes(q)) {
        return false;
      }
    }
    
    if (filters.categories?.length && !filters.categories.includes(job.category)) {
      return false;
    }
    
    if (filters.districts?.length && !filters.districts.includes(job.district)) {
      return false;
    }
    
    if (filters.employmentTypes?.length && !filters.employmentTypes.includes(job.employmentType)) {
      return false;
    }

    if (filters.schedule?.length && !filters.schedule.includes(job.schedule)) {
      return false;
    }

    if (filters.salaryMin && (job.salaryMax || 0) < filters.salaryMin) return false;
    
    if (filters.studentFriendlyOnly && !job.studentFriendly) return false;
    if (filters.noExperienceOnly && job.experienceRequired) return false;
    
    return true;
  });
}

// Simple random "AI Calculate Match" for demo purposes 
// In a real app: calculates embedding cosine similarity between candidateProfile Summary and Job Description
export function calculateMatchScore(candidate: any, job: Job): number {
  return realCalculateMatchScore(candidate || null, job);
}

// Applies mocked smart data directly to jobs before returning them to UI
export function enhanceJobsWithAI(jobs: Job[], candidate: any): (Job & { matchReasons?: string[] })[] {
  return jobs.map(j => {
    const fullResult = getFullMatchResult(candidate || null, j);
    return {
      ...j,
      matchScore: fullResult.score,
      matchReasons: fullResult.reasons.slice(0, 3),
      completenessScore: j.completenessScore || 85,
      freshnessStatus: "active",
      safetyWarnings: [],
    };
  });
}
