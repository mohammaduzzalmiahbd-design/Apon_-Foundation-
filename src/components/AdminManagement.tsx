import React, { useState, useEffect } from 'react';
import { Users, Shield, ShieldCheck, ShieldAlert, UserCog, Search, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { AppUser, UserRole, getAllUsers, updateUserRole } from '../services/firebase';

export const AdminManagement: React.FC = () => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleUpdate = async (uid: string, newRole: UserRole) => {
    setUpdatingId(uid);
    try {
      await updateUserRole(uid, newRole);
      setUsers(prev => prev.map(u => u.uid === uid ? { ...u, role: newRole } : u));
    } catch (error) {
      console.error("Error updating role", error);
      alert('রোল পরিবর্তন করতে সমস্যা হয়েছে।');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <UserCog className="text-blue-600" /> ইউজার ও রোল ম্যানেজমেন্ট
          </h2>
          <p className="text-sm text-slate-500">সিস্টেমের এডমিনদের তালিকা এবং তাদের রোল পরিবর্তন করুন।</p>
        </div>
        <button 
          onClick={fetchUsers}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition-colors"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> রিফ্রেশ করুন
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="ইমেইল বা নাম দিয়ে খুঁজুন..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ইউজার</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ইমেইল</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">বর্তমান রোল</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">লোডিং হচ্ছে...</td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <tr key={user.uid} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={user.photoURL || 'https://via.placeholder.com/40'} 
                          className="w-8 h-8 rounded-full border border-slate-200"
                          alt={user.displayName || ''}
                          referrerPolicy="no-referrer"
                        />
                        <span className="font-bold text-slate-700 text-sm">{user.displayName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                    <td className="px-6 py-4">
                      {user.role === 'SUPER_ADMIN' ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 text-[10px] font-black uppercase">
                          <ShieldCheck size={12} /> সুপার এডমিন
                        </div>
                      ) : user.role === 'ADMIN' ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black uppercase">
                          <Shield size={12} /> এডমিন
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-black uppercase">
                          <Users size={12} /> সাধারণ ইউজার
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user.role !== 'SUPER_ADMIN' && (
                        <div className="flex items-center justify-end gap-2">
                          <select
                            value={user.role}
                            disabled={updatingId === user.uid}
                            onChange={(e) => handleRoleUpdate(user.uid, e.target.value as UserRole)}
                            className="text-xs font-bold p-1.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          >
                            <option value="USER">Make User</option>
                            <option value="ADMIN">Make Admin</option>
                          </select>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">কোনো ইউজার পাওয়া যায়নি।</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
        <ShieldAlert className="text-blue-600 shrink-0 mt-0.5" size={20} />
        <div className="text-xs text-blue-800 space-y-1">
          <p className="font-bold underline">সুরক্ষা সতর্কবার্তা:</p>
          <p>১. নতুন এডমিন নিয়োগ দেওয়ার আগে নিশ্চিত হোন তিনি ফাউন্ডেশনের অফিসিয়াল সদস্য।</p>
          <p>২. সুপার এডমিন রোল শুধুমাত্র মূল প্রতিষ্ঠাতাদের জন্য সংরক্ষিত।</p>
          <p>৩. রোল পরিবর্তন করার সাথে সাথে সংশ্লিষ্ট ইউজারের অ্যাক্সেস লেভেল আপডেট হয়ে যাবে।</p>
        </div>
      </div>
    </div>
  );
};
