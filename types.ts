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

export const MONTHS = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

export const YEARS = [2023, 2024, 2025, 2026, 2027];