export type DegreeLevel = "Bachelor's" | "Master's" | "PhD";
export type FundingType = "Fully Funded" | "Partially Funded" | "Self Funded";
export type Intake = "Fall 2026" | "Spring 2026" | "Winter 2026" | "Fall 2025" | "Spring 2025" | "Rolling";
export type EnglishTest = "IELTS" | "TOEFL" | "Duolingo" | "PTE" | "None";
export type FieldOfStudy =
  | "Computer Science"
  | "Engineering"
  | "Business"
  | "Medicine"
  | "Natural Sciences"
  | "Social Sciences"
  | "Arts & Humanities"
  | "Law";

export interface Supervisor {
  id: string;
  name: string;
  title: string;
  department: string;
  researchInterests: string[];
  email: string;
  photoUrl: string;
  publications: number;
}

export interface University {
  id: string;
  name: string;
  country: string;
  countryFlag: string; // emoji
  city: string;
  logoUrl: string; // initials-based avatar handled in UI
  accent: string; // tailwind gradient classes for logo
  ranking: number;
  website: string;
  overview: string;
}

export interface Scholarship {
  id: string;
  name: string;
  universityId: string;
  degreeLevel: DegreeLevel;
  fieldOfStudy: FieldOfStudy;
  fundingType: FundingType;
  intake: Intake;
  deadline: string; // ISO date
  gpaRequirement: number; // out of 4.0
  englishTest?: EnglishTest;
  englishScore?: number;
  tuitionCoverage: boolean;
  monthlyStipend: number | null; // USD, null if not applicable
  healthInsurance: boolean;
  accommodation: boolean;
  benefits: string[];
  eligibility: string[];
  requiredDocuments: string[];
  applicationProcess: string[];
  contactEmail: string;
  officialUrl: string;
  matchScore: number; // 0-100
  supervisors?: Supervisor[]; // for Master's/PhD
  tags: string[];
}

export interface ApplicationItem {
  id: string;
  scholarshipId: string;
  status: "Not Started" | "In Progress" | "Submitted" | "Under Review" | "Accepted" | "Rejected";
  progress: number; // 0-100
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  type: "deadline" | "match" | "status" | "system";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export interface UserProfile {
  fullName: string;
  email: string;
  avatarUrl?: string;
  degreeLevel: DegreeLevel;
  fieldOfStudy: FieldOfStudy;
  country: string;
  gpa: number;
  englishTest: EnglishTest;
  englishScore: number;
  targetCountries: string[];
  bio: string;
  phone: string;
  joinedDate: string;
}
