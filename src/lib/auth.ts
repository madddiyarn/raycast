import { User, CandidateProfile, EmployerProfile } from "./types";

/**
 * TODO: Replace with real auth/backend API via NextAuth and Prisma
 */

const LOCAL_STORAGE_KEY = "jumys_user";

export async function loginUser(input: any): Promise<{ user: User }> {
  console.log("loginUser called with:", input);
  
  // Handle both phone string (from candidate login) or credentials object
  const phone = typeof input === "string" ? input : input.phone || input.email;
  const isEmployer = typeof input === "object" && (input.email?.includes("employer") || input.role === "employer");
  
  const mockUser: User = {
    id: "mock_" + Math.random().toString(36).substring(7),
    role: isEmployer ? "employer" : "candidate",
    fullName: isEmployer ? "ТОО СпецСтрой" : "Алия Исман", // Demo data
    telegramUsername: isEmployer ? "@specstroy_hr" : "@aliya_ism",
    phone: phone || "+7 (707) 123-45-67",
    onboardingCompleted: true, 
    createdAt: new Date(),
  };

  if (typeof window !== "undefined") {
    console.log("Setting session in localStorage:", mockUser);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mockUser));
    window.dispatchEvent(new Event("jumys_auth_change"));
  }

  return { user: mockUser };
}

export async function registerUser(data: Partial<User>): Promise<{ user: User }> {
  console.log("registerUser called with:", data);
  
  const mockUser: User = {
    id: "user_" + Math.random().toString(36).substring(7),
    role: data.role || "candidate",
    fullName: data.fullName || "Новый Пользователь",
    telegramUsername: data.telegramUsername || "",
    phone: data.phone || "",
    onboardingCompleted: false, // New users must onboard!
    createdAt: new Date(),
  };

  if (typeof window !== "undefined") {
    console.log("Setting session in localStorage:", mockUser);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mockUser));
    window.dispatchEvent(new Event("jumys_auth_change"));
  }

  return { user: mockUser };
}

export function getCurrentUser(): User | null {
  if (typeof window !== "undefined") {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        return null;
      }
    }
  }
  return null;
}

export async function logoutUser(): Promise<void> {
  console.log("logoutUser called");
  if (typeof window !== "undefined") {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    window.dispatchEvent(new Event("jumys_auth_change"));
  }
}

export async function updateUserProfile(data: Partial<User>): Promise<{ user: User }> {
  console.log("updateUserProfile called with:", data);
  const current = getCurrentUser();
  if (!current) throw new Error("No user logged in");
  
  const updated = { ...current, ...data };
  if (typeof window !== "undefined") {
    console.log("Updating session in localStorage:", updated);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("jumys_auth_change"));
  }
  return { user: updated };
}

export async function completeCandidateOnboarding(profileData: Partial<CandidateProfile>): Promise<void> {
  console.log("completeCandidateOnboarding called with:", profileData);
  const current = getCurrentUser();
  if (!current) throw new Error("Not logged in");
  
  // Here we would save profileData to DB
  await updateUserProfile({ onboardingCompleted: true });
}

export async function completeEmployerOnboarding(profileData: Partial<EmployerProfile>): Promise<void> {
  console.log("completeEmployerOnboarding called with:", profileData);
  const current = getCurrentUser();
  if (!current) throw new Error("Not logged in");
  
  // Here we would save profileData to DB
  await updateUserProfile({ onboardingCompleted: true });
}
