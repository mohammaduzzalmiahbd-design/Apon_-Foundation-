import React, { useState } from 'react';
import { Printer, Download, FileDown, RefreshCcw, Image as ImageIcon, FileText } from 'lucide-react';
import { DocumentHeader } from './DocumentHeader';
import { downloadAsPDF, downloadAsImage } from '../utils/downloadUtils';

interface Props {
  logoUrl: string | null;
}

export const MemberForm: React.FC<Props> = ({ logoUrl }) => {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
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
                <div className="grid grid-cols-2 gap-2 mt-1">
                    <button onClick={() => downloadAsImage('membership-form', 'Membership_Form')} className="bg-emerald-50 text-emerald-700 border border-emerald-200 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-emerald-100 font-medium transition-colors">
                        <ImageIcon size={18} /> ছবি ডাউনলোড
                    </button>
                    <button onClick={() => downloadAsPDF('membership-form', 'Membership_Form')} className="bg-rose-50 text-rose-700 border border-rose-200 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-rose-100 font-medium transition-colors">
                        <FileDown size={18} /> পিডিএফ ডাউনলোড
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* A4 Form Preview */}
      <div className="lg:col-span-2 flex justify-center bg-slate-100 p-4 md:p-8 overflow-auto rounded-xl border border-slate-200 order-1 lg:order-2">
         <div className="a4-wrapper p-0 bg-transparent shadow-2xl">
            <div 
                id="membership-form" 
                className="a4-paper flex flex-col relative bg-white text-black" 
                style={{ width: '210mm', height: '297mm', padding: '15mm 20mm' }}
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
                    <div className="border-b-2 border-slate-800 pb-2 mb-4 flex justify-between items-start gap-4 h-32">
                        {/* Logo Left */}
                        <div className="w-24 h-24 flex-shrink-0 flex items-center justify-center mt-1">
                            {logoUrl ? (
                              <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                            ) : (
                              <div className="w-full h-full border-2 border-dashed border-slate-300 rounded-full flex items-center justify-center text-xs text-slate-400 font-bold">লোগো</div>
                            )}
                        </div>

                        {/* Name & Address Left */}
                        <div className="flex-1 text-left mt-1">
                             <h1 className="text-4xl font-extrabold uppercase text-slate-900 mb-1 leading-none font-serif tracking-tight">
                                <span className="text-emerald-700">আপন</span> <span className="text-orange-600">ফাউন্ডেশন</span>
                            </h1>
                            <p className="text-base font-bold text-slate-600">বালিগাঁও, অষ্টগ্রাম, কিশোরগঞ্জ</p>
                            <p className="text-xs text-slate-500 mt-1 font-medium">ইমেইল: aponfoundation@gmail.com</p>
                            <p className="text-xs text-slate-500 font-medium">মোবাইল: ০১৬০৮-৪২৭১১৫</p>
                            <p className="text-[10px] text-slate-400 mt-1">স্থাপিত: ২০২৫ | রেজি: প্রক্রিয়াদিন</p>
                        </div>
                        
                        {/* Photo Box Right */}
                        <div className="w-28 h-32 border-2 border-slate-300 flex flex-col items-center justify-center bg-slate-50 text-slate-400 text-xs text-center p-2 rounded-sm shrink-0">
                           <p>পাসপোর্ট সাইজ</p>
                           <p>ছবি</p>
                           <p className="mt-2 text-[10px]">(এখানে আঠা দিয়ে লাগান)</p>
                        </div>
                    </div>

                    {/* Form Title */}
                    <div className="text-center mb-5">
                        <span className="inline-block bg-slate-900 text-white px-8 py-1.5 rounded-full text-lg font-bold border border-slate-800 shadow-sm print:bg-black print:text-white">
                            সদস্য ভর্তি ফরম
                        </span>
                    </div>

                    {/* Form Fields Table Structure */}
                    <div className="flex-1 text-sm text-slate-900">
                        
                        {/* Member Type Selection (Visual Checkbox) */}
                        <div className="flex justify-center gap-8 mb-4 font-bold text-sm border-b border-dashed border-slate-300 pb-4">
                            <div className="flex items-center gap-2">
                                <div className={`w-5 h-5 border-2 border-slate-800 flex items-center justify-center ${formData.memberType === 'general' ? 'bg-slate-800' : ''}`}>
                                    {formData.memberType === 'general' && <div className="w-3 h-3 bg-white"></div>}
                                </div>
                                সাধারণ সদস্য
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`w-5 h-5 border-2 border-slate-800 flex items-center justify-center ${formData.memberType === 'lifetime' ? 'bg-slate-800' : ''}`}>
                                    {formData.memberType === 'lifetime' && <div className="w-3 h-3 bg-white"></div>}
                                </div>
                                আজীবন সদস্য
                            </div>
                        </div>

                        {/* Personal Information */}
                        <table className="w-full border-collapse border border-slate-300 mb-4">
                            <tbody>
                                <tr>
                                    <td className="border border-slate-300 p-2 font-bold bg-slate-50 w-40">১. নাম (বাংলায়)</td>
                                    <td className="border border-slate-300 p-2 font-medium text-lg">{formData.nameBn}</td>
                                </tr>
                                <tr>
                                    <td className="border border-slate-300 p-2 font-bold bg-slate-50">২. নাম (ইংরেজিতে)</td>
                                    <td className="border border-slate-300 p-2 uppercase font-medium">{formData.nameEn}</td>
                                </tr>
                                <tr>
                                    <td className="border border-slate-300 p-2 font-bold bg-slate-50">৩. পিতার নাম</td>
                                    <td className="border border-slate-300 p-2">{formData.fatherName}</td>
                                </tr>
                                <tr>
                                    <td className="border border-slate-300 p-2 font-bold bg-slate-50">৪. মাতার নাম</td>
                                    <td className="border border-slate-300 p-2">{formData.motherName}</td>
                                </tr>
                                <tr>
                                    <td className="border border-slate-300 p-2 font-bold bg-slate-50">৫. স্বামী/স্ত্রীর নাম</td>
                                    <td className="border border-slate-300 p-2">{formData.spouseName}</td>
                                </tr>
                            </tbody>
                        </table>

                        {/* Grid for Smaller Fields */}
                        <table className="w-full border-collapse border border-slate-300 mb-4">
                            <tbody>
                                <tr>
                                    <td className="border border-slate-300 p-2 font-bold bg-slate-50 w-32">৬. জন্ম তারিখ</td>
                                    <td className="border border-slate-300 p-2 w-1/4">{formData.birthDate}</td>
                                    <td className="border border-slate-300 p-2 font-bold bg-slate-50 w-32">৭. রক্তের গ্রুপ</td>
                                    <td className="border border-slate-300 p-2">{formData.bloodGroup}</td>
                                </tr>
                                <tr>
                                    <td className="border border-slate-300 p-2 font-bold bg-slate-50">৮. জাতীয়তা</td>
                                    <td className="border border-slate-300 p-2">{formData.nationality}</td>
                                    <td className="border border-slate-300 p-2 font-bold bg-slate-50">৯. ধর্ম</td>
                                    <td className="border border-slate-300 p-2">{formData.religion}</td>
                                </tr>
                                <tr>
                                    <td className="border border-slate-300 p-2 font-bold bg-slate-50">১০. পেশা</td>
                                    <td className="border border-slate-300 p-2">{formData.occupation}</td>
                                    <td className="border border-slate-300 p-2 font-bold bg-slate-50">১১. শিক্ষাগত যোগ্যতা</td>
                                    <td className="border border-slate-300 p-2">{formData.education}</td>
                                </tr>
                                <tr>
                                    <td className="border border-slate-300 p-2 font-bold bg-slate-50">১২. মোবাইল নং</td>
                                    <td className="border border-slate-300 p-2 font-mono">{formData.mobile}</td>
                                    <td className="border border-slate-300 p-2 font-bold bg-slate-50">১৩. ইমেইল</td>
                                    <td className="border border-slate-300 p-2 lowercase">{formData.email}</td>
                                </tr>
                                <tr>
                                    <td className="border border-slate-300 p-2 font-bold bg-slate-50">১৪. জাতীয় পরিচয়পত্র (NID)</td>
                                    <td className="border border-slate-300 p-2 font-mono" colSpan={3}>{formData.nid}</td>
                                </tr>
                            </tbody>
                        </table>

                        {/* Addresses */}
                        <table className="w-full border-collapse border border-slate-300 mb-5">
                            <tbody>
                                <tr>
                                    <td className="border border-slate-300 p-2 font-bold bg-slate-50 w-40 align-top">১৫. বর্তমান ঠিকানা</td>
                                    <td className="border border-slate-300 p-2 h-14 align-top whitespace-pre-wrap">{formData.presentAddress}</td>
                                </tr>
                                <tr>
                                    <td className="border border-slate-300 p-2 font-bold bg-slate-50 align-top">১৬. স্থায়ী ঠিকানা</td>
                                    <td className="border border-slate-300 p-2 h-14 align-top whitespace-pre-wrap">{formData.permanentAddress}</td>
                                </tr>
                            </tbody>
                        </table>

                        {/* Declaration (অঙ্গীকারনামা) - Based on Constitution Article 8.4 */}
                        <div className="bg-slate-50 p-4 border border-slate-200 rounded text-justify">
                            <h3 className="font-bold text-center underline mb-2 text-base">অঙ্গীকারনামা</h3>
                            <p className="leading-relaxed text-sm">
                                আমি এই মর্মে অঙ্গীকার করছি যে, উপরে প্রদত্ত সকল তথ্য সম্পূর্ণ সত্য ও সঠিক। আমি <span className="font-bold">আপন ফাউন্ডেশন</span>-এর গঠনতন্ত্র (ধারা ৮.৪ অনুযায়ী), লক্ষ্য ও উদ্দেশ্য এবং নীতিমালার প্রতি পূর্ণ আস্থা ও বিশ্বাস স্থাপন করছি। আমি সংগঠনের স্বার্থ পরিপন্থী কোনো কাজে লিপ্ত থাকব না এবং নিয়মিত চাঁদা প্রদানসহ অর্পিত দায়িত্ব নিষ্ঠার সাথে পালন করব। আমার আচরণ বা কর্মকাণ্ড সংগঠনের পরিপন্থী হলে কর্তৃপক্ষ আমার সদস্যপদ বাতিল করার অধিকার রাখে।
                            </p>
                        </div>

                        {/* Signatures */}
                        <div className="mt-12 flex justify-between items-end px-4">
                            <div className="text-center">
                                <div className="w-40 border-t border-dashed border-slate-800 mb-1"></div>
                                <p className="font-bold text-sm">আবেদনকারীর স্বাক্ষর ও তারিখ</p>
                            </div>
                            <div className="text-center">
                                <div className="w-40 border-t border-dashed border-slate-800 mb-1"></div>
                                <p className="font-bold text-sm">সাধারণ সম্পাদকের স্বাক্ষর</p>
                            </div>
                            <div className="text-center">
                                <div className="w-40 border-t border-dashed border-slate-800 mb-1"></div>
                                <p className="font-bold text-sm">সভাপতির স্বাক্ষর</p>
                            </div>
                        </div>

                        {/* Office Use Only */}
                        <div className="mt-6 border-2 border-slate-800 rounded p-2">
                            <p className="text-center font-bold underline mb-2 text-[10px] uppercase">শুধুমাত্র অফিস ব্যবহারের জন্য</p>
                            <div className="flex justify-between items-center text-xs gap-4">
                                <div className="flex-1">
                                    <span className="font-bold">সদস্য পদ নম্বর:</span> .........................
                                </div>
                                <div className="flex-1">
                                    <span className="font-bold">প্রাপ্তির তারিখ:</span> .........................
                                </div>
                                <div className="flex-1">
                                    <span className="font-bold">অনুমোদনের তারিখ:</span> .........................
                                </div>
                            </div>
                        </div>

                    </div>
                    
                    {/* Footer Strip */}
                    <div className="mt-auto pt-2 text-center text-[10px] text-slate-400 border-t border-slate-200">
                        সিস্টেম জেনারেটেড ফরম | আপন ফাউন্ডেশন ম্যানেজমেন্ট সিস্টেম
                    </div>
                </div>
            </div>
         </div>
      </div>
    </div>
  );
};