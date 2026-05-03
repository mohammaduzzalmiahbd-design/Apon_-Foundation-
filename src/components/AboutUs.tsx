import React from 'react';
import { Info, MapPin, Mail, Phone, MessageCircle, Target, Heart, Shield, Calendar, Building } from 'lucide-react';

import { AppSettings } from '../types';
import { BrandText, BrandName } from './BrandText';

interface AboutUsProps {
  logoUrl: string | null;
  settings: AppSettings;
}

export const AboutUs: React.FC<AboutUsProps> = ({ logoUrl, settings }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-xl p-8 text-slate-800 shadow-sm border border-slate-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
          <Info size={120} />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-yellow-600 text-sm font-black tracking-widest uppercase mb-1">আমাদের সম্পর্কে</p>
              <h2 className="text-3xl font-black text-slate-900"><BrandText text="আপন ফাউন্ডেশন" /></h2>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Intro & Goals */}
        <div className="md:col-span-2 space-y-6">
          {/* Intro Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                <Shield size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">ফাউন্ডেশনের পরিচিতি</h3>
            </div>
            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>
                <strong className="text-slate-800">নাম:</strong> <BrandText text="আপন ফাউন্ডেশন" />
              </p>
              <p>
                <strong className="text-slate-800">প্রকৃতি:</strong> অলাভজনক সামাজিক ও মানবিক সংস্থা
              </p>
              <p className="text-justify">
                আপন ফাউন্ডেশন একটি সম্পূর্ণ অরাজনৈতিক, অলাভজনক এবং স্বেচ্ছাসেবী সামাজিক সংগঠন। সমাজের পিছিয়ে পড়া ও সুবিধাবঞ্চিত মানুষের জীবনমান উন্নয়ন, শিক্ষা ও স্বাস্থ্যসেবা নিশ্চিতকরণ এবং একটি বৈষম্যহীন সমাজ বিনির্মাণের লক্ষ্যে আমরা কাজ করে যাচ্ছি।
              </p>
            </div>
          </div>

          {/* Goals Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Target size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">আমাদের লক্ষ্য ও উদ্দেশ্য</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 border border-slate-100 rounded-xl bg-slate-50 hover:bg-white hover:shadow-md transition-all">
                <Heart className="text-rose-500 mb-3" size={28} />
                <h4 className="font-bold text-slate-800 mb-2">দারিদ্র্য বিমোচন</h4>
                <p className="text-sm text-slate-600">দরিদ্র ও অসহায় মানুষের কর্মসংস্থান সৃষ্টি এবং স্বাবলম্বী হতে সহায়তা করা।</p>
              </div>
              <div className="p-4 border border-slate-100 rounded-xl bg-slate-50 hover:bg-white hover:shadow-md transition-all">
                <BookOpenIcon className="text-indigo-500 mb-3" size={28} />
                <h4 className="font-bold text-slate-800 mb-2">শিক্ষা বিস্তার</h4>
                <p className="text-sm text-slate-600">সুবিধাবঞ্চিত শিশুদের শিক্ষার ব্যবস্থা করা এবং শিক্ষাসামগ্রী বিতরণ।</p>
              </div>
              <div className="p-4 border border-slate-100 rounded-xl bg-slate-50 hover:bg-white hover:shadow-md transition-all">
                <ActivityIcon className="text-teal-500 mb-3" size={28} />
                <h4 className="font-bold text-slate-800 mb-2">স্বাস্থ্যসেবা প্রদান</h4>
                <p className="text-sm text-slate-600">বিনামূল্যে চিকিৎসা ক্যাম্প, রক্তদান কর্মসূচি এবং স্বাস্থ্য সচেতনতা বৃদ্ধি।</p>
              </div>
              <div className="p-4 border border-slate-100 rounded-xl bg-slate-50 hover:bg-white hover:shadow-md transition-all">
                <UsersIcon className="text-orange-500 mb-3" size={28} />
                <h4 className="font-bold text-slate-800 mb-2">মানবিক মূল্যবোধ প্রতিষ্ঠা</h4>
                <p className="text-sm text-slate-600">সমাজে সম্প্রীতি, ভ্রাতৃত্ববোধ এবং নৈতিক মূল্যবোধ জাগ্রত করা।</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Contact & Info */}
        <div className="space-y-6">
          {/* Logo & Slogan */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center">
            <div className="w-24 h-24 mx-auto bg-slate-100 rounded-full border-4 border-white shadow-lg flex items-center justify-center overflow-hidden mb-4">
              {logoUrl ? (
                <img src={logoUrl} alt="Apon Foundation Logo" className="w-full h-full object-cover" />
              ) : (
                <Shield size={40} className="text-slate-300" />
              )}
            </div>
            <h3 className="text-xl font-bold text-slate-800"><BrandName /></h3>
            <p className="text-yellow-600 font-medium mt-1">"{settings.organization.slogan}"</p>
          </div>

          {/* Quick Info */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">এক নজরে</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="text-slate-400 mt-0.5 shrink-0" size={18} />
                <div>
                  <p className="text-xs text-slate-500">প্রতিষ্ঠার সাল</p>
                  <p className="text-sm font-medium text-slate-800">{settings.organization.foundingYear}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Building className="text-slate-400 mt-0.5 shrink-0" size={18} />
                <div>
                  <p className="text-xs text-slate-500">প্রধান কার্যালয়</p>
                  <p className="text-sm font-medium text-slate-800">{settings.organization.hqLocation}</p>
                </div>
              </div>
              {settings.organization.registrationNo && (
                <div className="flex items-start gap-3">
                  <Shield className="text-slate-400 mt-0.5 shrink-0" size={18} />
                  <div>
                    <p className="text-xs text-slate-500">রেজিস্ট্রেশন নম্বর</p>
                    <p className="text-sm font-medium text-slate-800">{settings.organization.registrationNo}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">যোগাযোগ</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="text-slate-400 mt-0.5 shrink-0" size={18} />
                <p className="text-sm text-slate-600">{settings.contact.address}</p>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="text-slate-400 shrink-0" size={18} />
                <a href={`mailto:${settings.contact.email}`} className="text-sm text-blue-600 hover:underline">{settings.contact.email}</a>
              </div>
              <div className="flex items-center gap-3">
                <MessageCircle className="text-green-500 shrink-0" size={18} />
                <a href={`https://wa.me/${settings.contact.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-sm text-slate-600 hover:text-green-600 transition-colors">
                  {settings.contact.whatsapp} (WhatsApp)
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="text-slate-400 shrink-0" size={18} />
                <a href={`tel:${settings.contact.phone.replace(/[^0-9+]/g, '')}`} className="text-sm text-slate-600 hover:text-blue-600 transition-colors">
                  {settings.contact.phone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper icons since they are not imported at the top to keep it clean
const BookOpenIcon = ({ className, size }: { className?: string, size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
);

const ActivityIcon = ({ className, size }: { className?: string, size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
);

const UsersIcon = ({ className, size }: { className?: string, size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
);
