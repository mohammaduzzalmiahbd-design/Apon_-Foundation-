import React, { useState, useRef } from 'react';
import { Printer, Download, FileDown, RefreshCcw, Image as ImageIcon, FileText } from 'lucide-react';
import { DocumentHeader } from './DocumentHeader';
import { DownloadDropdown } from './DownloadDropdown';
import { AppSettings } from '../types';

import { BrandText } from './BrandText';

interface Props {
  logoUrl: string | null;
  settings: AppSettings;
}

export const MemberForm: React.FC<Props> = ({ logoUrl, settings }) => {
  const formRef = useRef<HTMLDivElement>(null);

  // Form state for digital filling
  const [formData, setFormData] = useState({
    nameBn: '',
    nameEn: '',
    fatherName: '',
    motherName: '',
    spouseName: '',
    birthDate: '',
    bloodGroup: '',
    nid: '',
    nationality: 'বাংলাদেশী',
    religion: '',
    occupation: '',
    education: '',
    mobile: '',
    email: '',
    presentAddress: '',
    permanentAddress: '',
    memberType: 'general', // general or lifetime
  });
  
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setPhotoUrl(null);
    setFormData({
        nameBn: '', nameEn: '', fatherName: '', motherName: '', spouseName: '',
        birthDate: '', bloodGroup: '', nid: '', nationality: 'বাংলাদেশী', religion: '', 
        occupation: '', education: '', mobile: '', email: '', 
        presentAddress: '', permanentAddress: '',
        memberType: 'general'
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
      
      {/* Controls / Digital Input Section (Hidden in Print) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit no-print order-2 lg:order-1">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <FileText className="text-blue-600" /> ফরম পূরণ করুন
            </h2>
            <button onClick={handleReset} className="text-sm text-slate-500 hover:text-red-500 flex items-center gap-1 bg-slate-50 px-2 py-1 rounded">
                <RefreshCcw size={14} /> রিসেট
            </button>
        </div>
        
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ছবি আপলোড</label>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-slate-300 rounded p-1" />
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">সদস্যের ধরন</label>
                <select name="memberType" value={formData.memberType} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="general">সাধারণ সদস্য (২০০/- ত্রৈমাসিক)</option>
                    <option value="lifetime">আজীবন সদস্য (১,০০,০০০/-)</option>
                </select>
            </div>
            
            <div className="space-y-3">
                <input name="nameBn" placeholder="নাম (বাংলায়)" value={formData.nameBn} onChange={handleChange} className="p-2 border border-slate-300 rounded w-full focus:ring-2 focus:ring-blue-500 outline-none" />
                <input name="nameEn" placeholder="নাম (ইংরেজিতে)" value={formData.nameEn} onChange={handleChange} className="p-2 border border-slate-300 rounded w-full focus:ring-2 focus:ring-blue-500 outline-none" />
                <div className="grid grid-cols-2 gap-2">
                    <input name="fatherName" placeholder="পিতার নাম" value={formData.fatherName} onChange={handleChange} className="p-2 border border-slate-300 rounded w-full" />
                    <input name="motherName" placeholder="মাতার নাম" value={formData.motherName} onChange={handleChange} className="p-2 border border-slate-300 rounded w-full" />
                </div>
                <input name="nid" placeholder="জাতীয় পরিচয়পত্র (NID)" value={formData.nid} onChange={handleChange} className="p-2 border border-slate-300 rounded w-full" />
                
                <div className="grid grid-cols-2 gap-2">
                    <input name="bloodGroup" placeholder="রক্তের গ্রুপ" value={formData.bloodGroup} onChange={handleChange} className="p-2 border border-slate-300 rounded w-full" />
                    <input name="mobile" placeholder="মোবাইল নম্বর" value={formData.mobile} onChange={handleChange} className="p-2 border border-slate-300 rounded w-full" />
                </div>
                
                <textarea name="presentAddress" placeholder="বর্তমান ঠিকানা" value={formData.presentAddress} onChange={handleChange} className="p-2 border border-slate-300 rounded w-full h-20" />
                <textarea name="permanentAddress" placeholder="স্থায়ী ঠিকানা" value={formData.permanentAddress} onChange={handleChange} className="p-2 border border-slate-300 rounded w-full h-20" />
            </div>
            
            <div className="p-4 bg-blue-50 text-blue-800 text-xs rounded-lg border border-blue-100 mt-4">
                <p><strong>টিপস:</strong> আপনি এখান থেকে তথ্য পূরণ করে প্রিন্ট করতে পারেন, অথবা খালি ফরম প্রিন্ট করে কলম দিয়ে পূরণ করতে পারেন।</p>
            </div>

            <div className="flex flex-col gap-2 pt-4 border-t border-slate-100">
                <button onClick={() => window.print()} className="bg-slate-800 text-white py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-900 font-medium shadow-lg transition-all">
                    <Printer size={18} /> প্রিন্ট করুন
                </button>
                <div className="flex flex-col gap-2 mt-1">
                    <DownloadDropdown 
                        targetRef={formRef} 
                        fileNamePrefix="Membership_Form" 
                        settings={settings} 
                        logoUrl={logoUrl} 
                    />
                </div>
            </div>
        </div>
      </div>

     {/* A4 Form Preview */}
      <div className="lg:col-span-2 flex justify-center bg-slate-100 p-4 md:p-8 overflow-auto rounded-xl border border-slate-200 order-1 lg:order-2">
         <div className="a4-wrapper p-0 bg-transparent shadow-2xl">
            <div 
                ref={formRef}
                id="membership-form" 
                className="a4-paper flex flex-col relative bg-white text-black" 
                style={{ width: '210mm', height: '297mm', padding: '10mm 15mm 25mm 15mm' }}
            >
                
                {/* Watermark */}
                {logoUrl && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden opacity-[0.04]">
                    <img src={logoUrl} alt="Watermark" className="w-[400px] grayscale" />
                  </div>
                )}

                {/* --- Form Content Starts Here --- */}
                <div className="relative z-10 h-full flex flex-col">
                    
                    {/* Header: Logo (Left) - Text (Left) - Photo (Right) */}
                    <DocumentHeader 
                      logoUrl={logoUrl} 
                      settings={settings} 
                      isCompact={true}
                      rightElement={
                        <div className="w-24 h-28 border-2 border-slate-300 flex flex-col items-center justify-center bg-slate-50 text-slate-400 text-xs text-center p-1 rounded-sm shrink-0 overflow-hidden">
                           {photoUrl ? (
                             <img src={photoUrl} alt="Applicant" className="w-full h-full object-cover" />
                           ) : (
                             <>
                                <p className="mb-1 leading-tight font-medium">পাসপোর্ট সাইজ</p>
                                <p className="leading-tight font-medium">ছবি</p>
                                <p className="mt-2 text-[8px] leading-tight">(এখানে আঠা দিয়ে লাগান)</p>
                             </>
                           )}
                        </div>
                      }
                    />

                    {/* Form Title */}
                    <div className="text-center mb-3 -mt-2">
                        <span className="inline-block bg-slate-900 text-white px-6 py-1 rounded-full text-base font-bold border border-slate-800 shadow-sm print:bg-black print:text-white">
                            সদস্য ভর্তি ফরম
                        </span>
                    </div>

                    {/* Form Fields Table Structure */}
                    <div className="flex-1 text-[11px] text-slate-900 leading-tight">
                        
                        {/* Member Type Selection (Visual Checkbox) */}
                        <div className="flex justify-center gap-8 mb-2 font-bold text-[11px] border-b border-dashed border-slate-300 pb-2">
                            <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 border-2 border-slate-800 flex items-center justify-center ${formData.memberType === 'general' ? 'bg-slate-800' : ''}`}>
                                    {formData.memberType === 'general' && <div className="w-2 h-2 bg-white"></div>}
                                </div>
                                সাধারণ সদস্য
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 border-2 border-slate-800 flex items-center justify-center ${formData.memberType === 'lifetime' ? 'bg-slate-800' : ''}`}>
                                    {formData.memberType === 'lifetime' && <div className="w-2 h-2 bg-white"></div>}
                                </div>
                                আজীবন সদস্য
                            </div>
                        </div>

                        {/* Personal Information */}
                        <table className="w-full border-collapse border border-slate-300 mb-2">
                            <tbody>
                                <tr className="h-7">
                                    <td className="border border-slate-300 p-1 font-bold bg-slate-50 w-36">১. নাম (বাংলায়)</td>
                                    <td className="border border-slate-300 p-1 font-bold text-xs">{formData.nameBn}</td>
                                </tr>
                                <tr className="h-7">
                                    <td className="border border-slate-300 p-1 font-bold bg-slate-50">২. নাম (ইংরেজিতে)</td>
                                    <td className="border border-slate-300 p-1 uppercase font-bold text-xs">{formData.nameEn}</td>
                                </tr>
                                <tr className="h-7">
                                    <td className="border border-slate-300 p-1 font-bold bg-slate-50">৩. পিতার নাম</td>
                                    <td className="border border-slate-300 p-1">{formData.fatherName}</td>
                                </tr>
                                <tr className="h-7">
                                    <td className="border border-slate-300 p-1 font-bold bg-slate-50">৪. মাতার নাম</td>
                                    <td className="border border-slate-300 p-1">{formData.motherName}</td>
                                </tr>
                                <tr className="h-7">
                                    <td className="border border-slate-300 p-1 font-bold bg-slate-50">৫. স্বামী/স্ত্রীর নাম</td>
                                    <td className="border border-slate-300 p-1">{formData.spouseName}</td>
                                </tr>
                            </tbody>
                        </table>

                        {/* Grid for Smaller Fields */}
                        <table className="w-full border-collapse border border-slate-300 mb-2">
                            <tbody>
                                <tr className="h-7">
                                    <td className="border border-slate-300 p-1 font-bold bg-slate-50 w-32">৬. জন্ম তারিখ</td>
                                    <td className="border border-slate-300 p-1 w-1/4">{formData.birthDate}</td>
                                    <td className="border border-slate-300 p-1 font-bold bg-slate-50 w-32">৭. রক্তের গ্রুপ</td>
                                    <td className="border border-slate-300 p-1 font-bold">{formData.bloodGroup}</td>
                                </tr>
                                <tr className="h-7">
                                    <td className="border border-slate-300 p-1 font-bold bg-slate-50">৮. জাতীয়তা</td>
                                    <td className="border border-slate-300 p-1">{formData.nationality}</td>
                                    <td className="border border-slate-300 p-1 font-bold bg-slate-50">৯. ধর্ম</td>
                                    <td className="border border-slate-300 p-1">{formData.religion}</td>
                                </tr>
                                <tr className="h-7">
                                    <td className="border border-slate-300 p-1 font-bold bg-slate-50">১০. পেশা</td>
                                    <td className="border border-slate-300 p-1">{formData.occupation}</td>
                                    <td className="border border-slate-300 p-1 font-bold bg-slate-50">১১. শিক্ষাগত যোগ্যতা</td>
                                    <td className="border border-slate-300 p-1">{formData.education}</td>
                                </tr>
                                <tr className="h-7">
                                    <td className="border border-slate-300 p-1 font-bold bg-slate-50">১২. মোবাইল নং</td>
                                    <td className="border border-slate-300 p-1 font-mono font-bold">{formData.mobile}</td>
                                    <td className="border border-slate-300 p-1 font-bold bg-slate-50">১৩. ইমেইল</td>
                                    <td className="border border-slate-300 p-1 lowercase">{formData.email}</td>
                                </tr>
                                <tr className="h-7">
                                    <td className="border border-slate-300 p-1 font-bold bg-slate-50">১৪. জাতীয় পরিচয়পত্র (NID)</td>
                                    <td className="border border-slate-300 p-1 font-mono font-bold" colSpan={3}>{formData.nid}</td>
                                </tr>
                            </tbody>
                        </table>

                        {/* Addresses */}
                        <table className="w-full border-collapse border border-slate-300 mb-2">
                            <tbody>
                                <tr className="h-9">
                                    <td className="border border-slate-300 p-1 font-bold bg-slate-50 w-36 align-top">১৫. বর্তমান ঠিকানা</td>
                                    <td className="border border-slate-300 p-1 align-top whitespace-pre-wrap leading-tight">{formData.presentAddress}</td>
                                </tr>
                                <tr className="h-9">
                                    <td className="border border-slate-300 p-1 font-bold bg-slate-50 align-top">১৬. স্থায়ী ঠিকানা</td>
                                    <td className="border border-slate-300 p-1 align-top whitespace-pre-wrap leading-tight">{formData.permanentAddress}</td>
                                </tr>
                            </tbody>
                        </table>

                        {/* Declaration (অঙ্গীকারনামা) - Based on Constitution Article 8 & 10 */}
                        <div className="bg-slate-50 p-2 border border-slate-200 rounded text-justify">
                            <h3 className="font-bold text-center underline text-[11px]">অঙ্গীকারনামা</h3>
                            <p className="leading-relaxed text-[10px] mt-1 text-slate-800">
                                আমি এই মর্মে অঙ্গীকার করছি যে, উপরে প্রদত্ত সকল তথ্য সম্পূর্ণ সত্য ও সঠিক। আমি <BrandText text="আপন ফাউন্ডেশন" />-এর গঠনতন্ত্র (ধারা ৮ ও ১০ অনুযায়ী), লক্ষ্য ও উদ্দেশ্য এবং নীতিমালার প্রতি পূর্ণ আস্থা ও বিশ্বাস স্থাপন করছি। আমি সংগঠনের স্বার্থ পরিপন্থী কোনো কাজে লিপ্ত থাকব না এবং নিয়মিত চাঁদা প্রদানসহ অর্পিত দায়িত্ব নিষ্ঠার সাথে পালন করব। আমার আচরণ বা কর্মকাণ্ড সংগঠনের পরিপন্থী হলে কর্তৃপক্ষ আমার সদস্যপদ বাতিল করার অধিকার রাখে।
                            </p>
                        </div>

                        {/* Signatures */}
                        <div className="mt-4 flex justify-between items-end px-2">
                            <div className="text-center">
                                <div className="w-32 border-t border-dashed border-slate-800 mb-1"></div>
                                <p className="font-bold text-[10px]">আবেদনকারীর স্বাক্ষর ও তারিখ</p>
                            </div>
                            <div className="text-center">
                                <div className="w-32 border-t border-dashed border-slate-800 mb-1"></div>
                                <p className="font-bold text-[10px]">সাধারণ সম্পাদকের স্বাক্ষর</p>
                            </div>
                            <div className="text-center">
                                <div className="w-32 border-t border-dashed border-slate-800 mb-1"></div>
                                <p className="font-bold text-[10px]">সভাপতির স্বাক্ষর</p>
                            </div>
                        </div>

                        {/* Office Use Only */}
                        <div className="mt-4 border-2 border-slate-800 rounded p-1.5">
                            <p className="text-center font-bold underline mb-1.5 text-[9px] uppercase">শুধুমাত্র অফিস ব্যবহারের জন্য</p>
                            <div className="grid grid-cols-3 gap-2 text-[10px]">
                                <div className="border border-slate-400 p-1.5 text-center rounded bg-slate-50 min-h-[36px] flex flex-col justify-center">
                                    <span className="font-bold text-slate-700 mb-1">সদস্য পদ নম্বর</span>
                                    <span className="border-b border-dotted border-slate-400 block w-full mt-0.5"></span>
                                </div>
                                <div className="border border-slate-400 p-1.5 text-center rounded bg-slate-50 min-h-[36px] flex flex-col justify-center">
                                    <span className="font-bold text-slate-700 mb-1">প্রাপ্তির তারিখ</span>
                                    <span className="border-b border-dotted border-slate-400 block w-full mt-0.5"></span>
                                </div>
                                <div className="border border-slate-400 p-1.5 text-center rounded bg-slate-50 min-h-[36px] flex flex-col justify-center">
                                    <span className="font-bold text-slate-700 mb-1">অনুমোদনের তারিখ</span>
                                    <span className="border-b border-dotted border-slate-400 block w-full mt-0.5"></span>
                                </div>
                            </div>
                        </div>

                    </div>
                    
                    {/* Footer Strip */}
                    <div className="mt-auto pt-4 pb-2 text-center text-[10px] text-slate-800 font-bold w-full uppercase tracking-widest border-t border-slate-300">
                        System Generated Form, <BrandText text="Apon Foundation" /> Management System
                    </div>
                </div>
            </div>
         </div>
      </div>
    </div>
  );
};