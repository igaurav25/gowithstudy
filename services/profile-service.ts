import { AuthService, StoredUser } from "@/services/auth-service";
import { UpdateProfileInput, ChangePasswordInput, UpdatePreferencesInput } from "@/schemas/profile";
import { hashPassword, comparePassword } from "@/lib/auth";

export interface StudentProfileData extends StoredUser {
  bio: string;
  skills: string[];
  github: string;
  linkedin: string;
  portfolio: string;
  preferences: UpdatePreferencesInput;
}

// Global in-memory profile extension store
const profileExtensions: Map<string, Partial<StudentProfileData>> = new Map();

export const ProfileService = {
  /**
   * Retrieves full profile data for a user.
   */
  async getProfile(userId: string): Promise<StudentProfileData | null> {
    const user = await AuthService.getUserById(userId);
    if (!user) return null;

    const extension = profileExtensions.get(userId) || {};

    return {
      ...user,
      bio: extension.bio ?? "Computer Science student passionate about full-stack systems and algorithms.",
      skills: extension.skills ?? ["Next.js", "TypeScript", "PostgreSQL", "Data Structures", "Tailwind CSS"],
      github: extension.github ?? "https://github.com",
      linkedin: extension.linkedin ?? "https://linkedin.com",
      portfolio: extension.portfolio ?? "",
      preferences: extension.preferences ?? {
        emailNotifications: true,
        assignmentReminders: true,
        placementAlerts: true,
        themePreference: "system",
      },
    };
  },

  /**
   * Updates student personal and academic profile fields.
   */
  async updateProfile(userId: string, data: UpdateProfileInput): Promise<StudentProfileData> {
    const user = await AuthService.getUserById(userId);
    if (!user) {
      throw new Error("User not found.");
    }

    user.name = data.name.trim();
    user.college = data.college.trim();
    user.course = data.course.trim();
    user.branch = data.branch.trim();
    user.year = data.year;
    user.semester = data.semester;

    const parsedSkills = data.skills
      ? data.skills.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const existingExt = profileExtensions.get(userId) || {};
    const updatedExt = {
      ...existingExt,
      bio: data.bio || "",
      skills: parsedSkills,
      github: data.github || "",
      linkedin: data.linkedin || "",
      portfolio: data.portfolio || "",
    };

    profileExtensions.set(userId, updatedExt);

    return (await this.getProfile(userId))!;
  },

  /**
   * Updates password after validating existing password hash.
   */
  async changePassword(userId: string, data: ChangePasswordInput): Promise<void> {
    const user = await AuthService.getUserById(userId);
    if (!user) {
      throw new Error("User not found.");
    }

    const isMatch = await comparePassword(data.currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new Error("Current password is incorrect.");
    }

    user.passwordHash = await hashPassword(data.newPassword);
  },

  /**
   * Updates student notification and theme preferences.
   */
  async updatePreferences(userId: string, prefs: UpdatePreferencesInput): Promise<void> {
    const existing = profileExtensions.get(userId) || {};
    profileExtensions.set(userId, {
      ...existing,
      preferences: prefs,
    });
  },
};
