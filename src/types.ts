export type CouncilType = 'ADVISORY' | 'EXECUTIVE' | 'GENERAL';

export interface Member {
  id: string;
  name: string; // Name as per NID
  phone: string;
  nid?: string;
  address?: string;
  bloodGroup?: string;
  council: CouncilType;
  designation?: string; // Only for Executive
  joinDate: string;
  profileImage?: string; // Base64 string for member photo
}

export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Transaction {
  id: string;
  date: string; // ISO string
  month: string; // Bengali or English month name
  year: number;
  amount: number;
  type: TransactionType;
  category: string; // 'Subscription', 'Donation', 'EventCost', etc.
  description?: string;
  memberId?: string; // For subscription tracking
  
  // Donation specifics
  donationMethod?: 'cash' | 'mobile_banking' | 'bank_account';
  mobileBankingMethod?: string;
  transactionId?: string;
  bankAccountNumber?: string;
  referenceNo?: string;
}

export interface ConstitutionSection {
  id: string;
  title: string;
  content: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  generation: number;
  relationship: string;
  birthYear?: string;
  deathYear?: string;
  photo?: string;
  parentId?: string | null;
}

export interface BloodDonor {
  id: string;
  name: string;
  fatherName: string;
  phone: string;
  address: string;
  bloodGroup: string;
  healthIssues: string[];
  registrationDate: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  refNo: string;
}

export const MONTHS = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

export const YEARS = [2023, 2024, 2025, 2026, 2027];

export interface AppSettings {
  contact: {
    email: string;
    whatsapp: string;
    phone: string;
    address: string;
  };
  organization: {
    name: string;
    established: string;
    foundingYear?: string;
    hqLocation?: string;
    intro?: string;
    slogan: string;
    registration: string;
    registrationNo?: string;
    objectives?: string[]; // Highlights for homepage
    bloodDonorBanner?: string; // URL for the banner image
    bloodDonorDescription?: string; // Meta description for social sharing
  };
  admin: {
    username: string;
    passwordHash: string;
  };
  socialLinks?: {
    facebook?: string;
    whatsapp?: string;
    messenger?: string;
    instagram?: string;
    twitter?: string;
  };
  mobileBanking?: {
    bkash?: string;
    nagad?: string;
    rocket?: string;
  };
  logo?: string | null;
}