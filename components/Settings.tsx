import React, { useState, useRef } from 'react';
import { Settings as SettingsIcon, Upload, Mail, Phone, MapPin, MessageCircle, Shield, Building, Save, CheckCircle, Key, User, UserCog, Trash2, Plus } from 'lucide-react';
import { AppSettings } from '../types';
import { AdminManagement } from './AdminManagement';

interface SettingsProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  logoUrl: string | null;
  onUpdateLogo: (logo: string | null) => void;
  isSuperAdmin?: boolean;
}

export const Settings: React.FC<SettingsProps> = ({ settings, onUpdateSettings, logoUrl, onUpdateLogo, isSuperAdmin }) => {
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'ADMINS'>('GENERAL');
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [showNotification, setShowNotification] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onUpdateSettings(formData);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  return (
    <div className="animate-fade-in space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#143d27] to-[#1a4f33] rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <SettingsIcon size={120} />
        </div>
        <div className="relative z-10">
          <p className="text-yellow-500 text-sm font-medium tracking-wider uppercase mb-1">সিস্টেম কনফিগারেশন</p>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">সেটিংস — আপন ফাউন্ডেশন</h1>
          <p className="text-green-100 max-w-xl">ফাউন্ডেশনের লোগো, যোগাযোগের তথ্য, এবং এডমিন সেটিংস পরিবর্তন করুন।</p>
        </div>
      </div>

      {isSuperAdmin && (
        <div className="flex bg-white rounded-xl shadow-sm border border-slate-200 p-1">
          <button 
            onClick={() => setActiveTab('GENERAL')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all ${activeTab === 'GENERAL' ? 'bg-[#143d27] text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <SettingsIcon size={18} /> সাধারণ সেটিংস
          </button>
          <button 
            onClick={() => setActiveTab('ADMINS')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all ${activeTab === 'ADMINS' ? 'bg-[#143d27] text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <UserCog size={18} /> এডমিন ও রোল ম্যানেজমেন্ট
          </button>
        </div>
      )}

      {showNotification && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2 animate-fade-in">
          <CheckCircle size={20} />
          <span className="font-medium">তথ্য সফলভাবে সংরক্ষিত হয়েছে!</span>
        </div>
      )}

      {activeTab === 'GENERAL' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo Upload */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Upload className="text-blue-500" /> লোগো আপলোড
          </h2>
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-32 h-32 rounded-full bg-slate-100 border-4 border-white shadow-lg flex items-center justify-center overflow-hidden relative group">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Building size={40} className="text-slate-300" />
              )}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <Upload className="text-white" />
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleLogoUpload} 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors text-sm"
            >
              নতুন লোগো নির্বাচন করুন
            </button>
            <p className="text-xs text-slate-500 text-center">লোগো পরিবর্তন করলে পুরো সিস্টেমে নতুন লোগো স্বয়ংক্রিয়ভাবে আপডেট হবে।</p>
          </div>
        </div>

        {/* Organization Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Building className="text-indigo-500" /> ফাউন্ডেশনের তথ্য
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">প্রতিষ্ঠার সাল</label>
              <input 
                type="text" 
                value={formData.organization.foundingYear}
                onChange={e => setFormData({...formData, organization: {...formData.organization, foundingYear: e.target.value}})}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">প্রধান কার্যালয়ের অবস্থান</label>
              <input 
                type="text" 
                value={formData.organization.hqLocation}
                onChange={e => setFormData({...formData, organization: {...formData.organization, hqLocation: e.target.value}})}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">অফিসিয়াল স্লোগান</label>
              <input 
                type="text" 
                value={formData.organization.slogan}
                onChange={e => setFormData({...formData, organization: {...formData.organization, slogan: e.target.value}})}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            {/* Homepage Objectives */}
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-sm font-medium text-slate-700 mb-2">হোমপেজ হাইলাইটস (লক্ষ্য ও উদ্দেশ্য)</label>
              <div className="space-y-2">
                {(formData.organization.objectives || []).map((obj, i) => (
                  <div key={i} className="flex gap-2">
                    <input 
                      type="text" 
                      value={obj}
                      onChange={e => {
                        const newObjs = [...(formData.organization.objectives || [])];
                        newObjs[i] = e.target.value;
                        setFormData({...formData, organization: {...formData.organization, objectives: newObjs}});
                      }}
                      className="flex-1 p-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button 
                      onClick={() => {
                        const newObjs = (formData.organization.objectives || []).filter((_, idx) => idx !== i);
                        setFormData({...formData, organization: {...formData.organization, objectives: newObjs}});
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button 
                  onClick={() => {
                    const newObjs = [...(formData.organization.objectives || []), ''];
                    setFormData({...formData, organization: {...formData.organization, objectives: newObjs}});
                  }}
                  className="w-full py-2 border-2 border-dashed border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:border-indigo-300 hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={14} /> নতুন পয়েন্ট যুক্ত করুন
                </button>
              </div>
            </div>
            <div className="pt-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">রেজিস্ট্রেশন নম্বর (যদি থাকে)</label>
              <input 
                type="text" 
                value={formData.organization.registrationNo}
                onChange={e => setFormData({...formData, organization: {...formData.organization, registrationNo: e.target.value}})}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Phone className="text-green-500" /> যোগাযোগের তথ্য
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2"><Mail size={16}/> ইমেইল আইডি</label>
              <input 
                type="email" 
                value={formData.contact.email}
                onChange={e => setFormData({...formData, contact: {...formData.contact, email: e.target.value}})}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2"><MessageCircle size={16}/> হোয়াটসঅ্যাপ নম্বর</label>
              <input 
                type="text" 
                value={formData.contact.whatsapp}
                onChange={e => setFormData({...formData, contact: {...formData.contact, whatsapp: e.target.value}})}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2"><Phone size={16}/> ফোন নম্বর</label>
              <input 
                type="text" 
                value={formData.contact.phone}
                onChange={e => setFormData({...formData, contact: {...formData.contact, phone: e.target.value}})}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2"><MapPin size={16}/> ঠিকানা</label>
              <textarea 
                value={formData.contact.address}
                onChange={e => setFormData({...formData, contact: {...formData.contact, address: e.target.value}})}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="text-blue-600 font-bold">@</span> সোশ্যাল মিডিয়া লিংক
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Facebook</label>
              <input 
                type="url" 
                placeholder="https://facebook.com/..."
                value={formData.socialLinks?.facebook || ''}
                onChange={e => setFormData({...formData, socialLinks: {...(formData.socialLinks || {}), facebook: e.target.value}})}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp Invite Link</label>
              <input 
                type="url" 
                placeholder="https://chat.whatsapp.com/..."
                value={formData.socialLinks?.whatsapp || ''}
                onChange={e => setFormData({...formData, socialLinks: {...(formData.socialLinks || {}), whatsapp: e.target.value}})}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Messenger</label>
              <input 
                type="url" 
                placeholder="https://m.me/..."
                value={formData.socialLinks?.messenger || ''}
                onChange={e => setFormData({...formData, socialLinks: {...(formData.socialLinks || {}), messenger: e.target.value}})}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Instagram</label>
              <input 
                type="url" 
                placeholder="https://instagram.com/..."
                value={formData.socialLinks?.instagram || ''}
                onChange={e => setFormData({...formData, socialLinks: {...(formData.socialLinks || {}), instagram: e.target.value}})}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Twitter / X</label>
              <input 
                type="url" 
                placeholder="https://twitter.com/..."
                value={formData.socialLinks?.twitter || ''}
                onChange={e => setFormData({...formData, socialLinks: {...(formData.socialLinks || {}), twitter: e.target.value}})}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Mobile Banking Accounts */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="text-emerald-600 font-bold">৳</span> মোবাইল ব্যাংকিং (অনুদান)
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">বিকাশ নম্বর (bKash)</label>
              <input 
                type="text" 
                placeholder="+8801XXXXXXXXX"
                value={formData.mobileBanking?.bkash || ''}
                onChange={e => setFormData({...formData, mobileBanking: {...(formData.mobileBanking || {}), bkash: e.target.value}})}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">নগদ নম্বর (Nagad)</label>
              <input 
                type="text" 
                placeholder="+8801XXXXXXXXX"
                value={formData.mobileBanking?.nagad || ''}
                onChange={e => setFormData({...formData, mobileBanking: {...(formData.mobileBanking || {}), nagad: e.target.value}})}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">রকেট নম্বর (Rocket)</label>
              <input 
                type="text" 
                placeholder="+8801XXXXXXXXX"
                value={formData.mobileBanking?.rocket || ''}
                onChange={e => setFormData({...formData, mobileBanking: {...(formData.mobileBanking || {}), rocket: e.target.value}})}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Admin Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Shield className="text-rose-500" /> এডমিন সেটিংস
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2"><User size={16}/> এডমিন ইউজারনেম</label>
              <input 
                type="text" 
                value={formData.admin.username}
                onChange={e => setFormData({...formData, admin: {...formData.admin, username: e.target.value}})}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2"><Key size={16}/> নতুন পাসওয়ার্ড সেট করুন</label>
              <input 
                type="password" 
                placeholder="নতুন পাসওয়ার্ড দিন"
                value={formData.admin.passwordHash}
                onChange={e => setFormData({...formData, admin: {...formData.admin, passwordHash: e.target.value}})}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
              />
            </div>
            <div className="bg-rose-50 p-4 rounded-lg border border-rose-100 mt-4">
              <p className="text-sm text-rose-700">
                <strong>সতর্কতা:</strong> এডমিন তথ্য পরিবর্তন করলে সিস্টেমের লগইন ও অ্যাক্সেস কন্ট্রোল অংশে সাথে সাথে কার্যকর হবে।
              </p>
            </div>
          </div>
        </div>
      </div>

          <div className="flex justify-end pt-4">
            <button 
              onClick={handleSave}
              className="flex items-center gap-2 bg-[#143d27] hover:bg-[#1a4f33] text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all hover:-translate-y-1"
            >
              <Save size={20} /> Save Settings
            </button>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <AdminManagement />
        </div>
      )}
    </div>
  );
};
