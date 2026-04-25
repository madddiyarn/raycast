import { Job, CandidateProfile, Application } from "./types";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));


const mockJobs: any[] = [];
const mockCandidates: any[] = [];
const mockSources: any[] = [];

export const api = {
  async getJobs(filters?: Partial<Job>): Promise<Job[]> {
    await delay(300);
    let jobs = [...mockJobs];
    if (filters?.category) jobs = jobs.filter(j => j.category === filters.category);
    if (filters?.district) jobs = jobs.filter(j => j.district === filters.district);
    return jobs;
  },

  async getJobById(id: string): Promise<Job | null> {
    await delay(200);
    return mockJobs.find(j => j.id === id) || null;
  },

  async getTelegramSources(): Promise<any[]> {
    await delay(300);
    return mockSources;
  },

  async ingestTelegramJob(rawText: string, source: string): Promise<{ success: boolean, message: string }> {
    await delay(800);
    return { success: true, message: "Job ingested successfully" };
  },

  async parseJobWithAI(rawText: string): Promise<Partial<Job>> {
    await delay(1200);
    return { title: "Parsed Title", district: "15 мкр" };
  },

  async getCandidateRecommendations(candidateId: string): Promise<Array<{ job: any, match: { score: number, reasons: string[] } }>> {
    await delay(500);
    return [];
  },

  async createApplication(jobId: string, candidateId: string): Promise<any> {
    await delay(500);
    return {
      id: "app-" + Math.random().toString(36).substr(2, 9),
      jobId, candidateId, matchScore: 87, status: "applied",
      aiMessage: "AI-generated message", createdAt: new Date(),
      timeline: [{ status: "applied", timestamp: new Date() }],
    };
  },

  async getEmployerApplications(employerId: string): Promise<any[]> {
    await delay(400);
    return [];
  },

  async updateJobFreshness(jobId: string, status: "confirmed_today" | "closed"): Promise<void> {
    await delay(300);
  },

  async detectDuplicateJob(job: Partial<Job>): Promise<{ isDuplicate: boolean, id?: string }> {
    await delay(400);
    return { isDuplicate: false };
  }
};
