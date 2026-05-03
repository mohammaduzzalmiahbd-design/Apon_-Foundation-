import React, { useState, useRef, useMemo } from 'react';
import { Download, Search, Plus, Edit, Trash2, X, Image as ImageIcon, FileText, List, Table as TableIcon, Clock, LayoutGrid, Layers, GitMerge, Save, UploadCloud, Eye } from 'lucide-react';
import { FamilyMember, AppSettings } from '../types';
import { DownloadDropdown } from './DownloadDropdown';
import { DocumentHeader } from './DocumentHeader';
import { DocumentFooter } from './DocumentFooter';

interface FamilyTreeProps {
  members: FamilyMember[];
  setMembers: React.Dispatch<React.SetStateAction<FamilyMember[]>>;
  logoUrl?: string | null;
  settings: AppSettings;
}

type ViewMode = 'TREE' | 'LIST' | 'TABLE' | 'TIMELINE' | 'CARD' | 'FOLD' | 'HYBRID';

export const FamilyTree: React.FC<FamilyTreeProps> = ({ members, setMembers, logoUrl, settings }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('TREE');
  const [searchQuery, setSearchQuery] = useState('');
  const previewRef = useRef<HTMLDivElement>(null);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [isExportPreviewOpen, setIsExportPreviewOpen] = useState(false);
  const [exportOrientation, setExportOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const [exportPageSize, setExportPageSize] = useState<'POSTER' | 'A1' | 'A0'>('POSTER');
  
  const chartRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<FamilyMember>>({});

  const maxGeneration = useMemo(() => {
    if (members.length === 0) return 0;
    return Math.max(...members.map(m => m.generation));
  }, [members]);

  const filteredMembers = useMemo(() => {
    if (!searchQuery) return members;
    return members.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [members, searchQuery]);

  // Auto-set orientation and size based on data density
  React.useEffect(() => {
    if (isExportPreviewOpen) {
      setExportOrientation('landscape'); // Always landscape for big trees
      
      if (members.length > 200 || maxGeneration >= 12) {
        setExportPageSize('A0');
      } else if (members.length > 100 || maxGeneration >= 10) {
        setExportPageSize('A1');
      } else {
        setExportPageSize('POSTER');
      }
    }
  }, [isExportPreviewOpen, maxGeneration, members.length]);

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.generation) return;

    if (editingMember) {
      setMembers(members.map(m => m.id === editingMember.id ? { ...m, ...formData } as FamilyMember : m));
    } else {
      const newMember: FamilyMember = {
        id: Date.now().toString(),
        name: formData.name,
        generation: Number(formData.generation),
        relationship: formData.relationship || 'সদস্য',
        birthYear: formData.birthYear,
        deathYear: formData.deathYear,
        parentId: formData.parentId,
        photo: formData.photo
      };
      setMembers([...members, newMember]);
    }
    setIsAddModalOpen(false);
    setEditingMember(null);
    setFormData({});
  };

  const handleDelete = (id: string) => {
    if (window.confirm('আপনি কি নিশ্চিত যে এই সদস্যকে মুছে ফেলতে চান?')) {
      setMembers(members.filter(m => m.id !== id));
      setSelectedMember(null);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackup = () => {
    const data = {
      familyMembers: members,
      exportDate: new Date().toISOString(),
      appName: 'FoundationManagerPro_FamilyTree'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `family_tree_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.appName === 'FoundationManagerPro_FamilyTree' && json.familyMembers) {
          setMembers(json.familyMembers);
          alert('সফলভাবে ডাটা রিস্টোর করা হয়েছে!');
        } else {
          alert('ভুল ফাইল ফরম্যাট! সঠিক ব্যাকআপ ফাইল নির্বাচন করুন।');
        }
      } catch (error) {
        alert('ফাইল রিড করতে সমস্যা হয়েছে।');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Deep, Rich Generation Colors (Highly Distinct)
  const GEN_COLORS = [
    '#065f46', '#3730a3', '#92400e', '#9f1239', '#155e75', 
    '#5b21b6', '#9a3412', '#115e59', '#1e40af', '#831843',
    '#0f172a', '#3f2b96', '#7c2d12', '#4c1d95', '#064e3b'
  ];

  const getFontSize = () => {
    const count = members.length;
    const gens = maxGeneration;
    
    // Scale factors
    let titleSize = 11;
    let subSize = 7;
    let minW = 60;
    const gapMultiplier = count > 100 ? 0.3 : (count > 50 ? 0.6 : 1);

    // Dynamic Font Scaling Tiers - Sharpened for 50-80 member range
    if (count <= 30) { titleSize = 11; subSize = 7; minW = 80; }
    else if (count <= 55) { titleSize = 10; subSize = 6.5; minW = 70; }
    else if (count <= 85) { titleSize = 8.5; subSize = 6; minW = 60; }
    else if (count <= 140) { titleSize = 7; subSize = 5; minW = 45; }
    else if (count <= 220) { titleSize = 6; subSize = 4.5; minW = 38; }
    else { titleSize = 5; subSize = 4; minW = 32; }

    // Generation Depth adjustment
    if (gens > 6) {
      const gScale = Math.max(0.7, 6 / gens);
      titleSize = Math.max(5, titleSize * gScale);
    }

    return { 
      title: `${titleSize}px`, 
      sub: `${subSize}px`, 
      minWidth: `${minW}px`,
      gap: 2 * gapMultiplier,
      levelGap: gens > 6 ? 0.3 : 0.6 
    };
  };

  const renderTree = (parentId: string | null | undefined = null, level: number = 0): React.ReactNode => {
    if (level > 20) return <div className="text-red-500 text-[10px]">Depth limit reached</div>;
    
    const children = members.filter(m => {
      if (parentId === null || parentId === undefined || parentId === "") {
        return !m.parentId || m.parentId === "";
      }
      return m.parentId === parentId;
    });
    
    if (children.length === 0) return null;

    const sizeCfg = getFontSize();
    const genColor = GEN_COLORS[level % GEN_COLORS.length];
    
    // Family Unit Theme (The box surrounding father + children)
    const unitBorderColor = `${genColor}40`; // 25% opacity version of gen color
    const unitBg = `${genColor}05`; // Very subtle tint

    const getSplitGroups = (items: FamilyMember[]) => {
      const count = items.length;
      if (count <= 4) return [items];
      const splitAt = Math.ceil(count / 2);
      return [items.slice(0, splitAt), items.slice(splitAt)];
    };

    const rows = getSplitGroups(children);

    return (
      <div className="flex flex-col items-center w-full" style={{ marginTop: `${sizeCfg.levelGap}rem` }}>
        {/* Connector from top parent */}
        {level > 0 && <div className="w-[0.5px] h-2 bg-slate-300"></div>}
        
        {/* THE FAMILY UNIT BOX: Container for Sibling Groups */}
        <div 
          className="flex flex-col items-center p-1 rounded-md border transition-all" 
          style={{ 
            borderColor: unitBorderColor,
            backgroundColor: unitBg,
            gap: '2px',
            borderStyle: parentId ? 'solid' : 'none' // Only wrap child units
          }}
        >
          {rows.map((row, rowIdx) => (
            <div key={rowIdx} className="relative w-full flex flex-col items-center">
              {/* Horizontal Connector Line */}
              {row.length > 1 && (
                <div className="absolute top-1 left-0 right-0 h-[0.5px] bg-slate-300"
                     style={{ 
                        left: `${100 / (row.length * 2)}%`,
                        right: `${100 / (row.length * 2)}%`
                     }} 
                />
              )}
              
              {/* Vertical connector to the row if multiple rows exist */}
              {rowIdx > 0 && (
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-[0.5px] h-2 bg-slate-300"></div>
              )}
              
              <div className="flex justify-center w-full" style={{ gap: `${sizeCfg.gap}px` }}>
                {row.map(member => {
                  const father = members.find(m => m.id === member.parentId);
                  return (
                    <div key={member.id} className="flex flex-col items-center relative py-1 px-1 shrink-0">
                      {/* Vertical line directly to member box */}
                      <div className="w-[0.5px] h-1 bg-slate-300"></div>
                      
                      {/* INDIVIDUAL MEMBER BOX - Auto-sizing with safety padding */}
                      <div 
                        className="border-2 rounded-md shadow-lg cursor-pointer hover:brightness-110 transition-all text-center z-10 flex flex-col items-center justify-center ring-1 ring-white/50"
                        style={{ 
                          width: 'fit-content',
                          minWidth: sizeCfg.minWidth,
                          maxWidth: '300px',
                          borderColor: genColor,
                          backgroundColor: genColor,
                          color: 'white',
                          padding: '0.45em 0.9em',
                          lineHeight: '1.4',
                          boxShadow: `0 4px 6px -1px ${genColor}40, 0 2px 4px -1px ${genColor}20`
                        }}
                        onClick={() => setSelectedMember(member)}
                      >
                        <div className="w-full flex flex-col items-center justify-center">
                          <h3 className="font-bold font-bengali whitespace-nowrap drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.5)]" style={{ fontSize: sizeCfg.title }}>
                            {member.name}
                          </h3>
                          {parseFloat(sizeCfg.sub) >= 4 && father && (
                            <div className="w-full mt-1 border-t border-white/30 pt-1">
                              <p className="opacity-100 font-bold font-bengali whitespace-nowrap text-white" style={{ fontSize: sizeCfg.sub }}>
                                পিতা: {father.name}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Recurse for descendants */}
                      {renderTree(member.id, level + 1)}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-[#143d27] rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <GitMerge size={100} />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#1a4f33] rounded-lg border border-[#2a6f43] hidden md:block">
              <GitMerge className="text-yellow-500" size={32} />
            </div>
            <div>
              <p className="text-yellow-500 text-sm font-medium">আপন ফাউন্ডেশন</p>
              <h2 className="text-2xl font-bold text-white">বংশপরম্পরা চার্ট</h2>
              <p className="text-slate-300 text-sm mt-1">{members.length} জন সদস্য • {maxGeneration} প্রজন্ম</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="নাম খুঁজুন..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#143d27] outline-none"
            />
          </div>
          
          <button 
            onClick={() => setIsExportPreviewOpen(true)}
            className="flex items-center gap-2 bg-[#143d27] text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#1a4f33] transition-all shadow-md"
          >
            <Eye size={16} /> প্রিভিউ ও ডাউনলোড
          </button>
          
          <button onClick={handleBackup} className="flex items-center gap-2 bg-white border border-green-500 text-green-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-50 transition-colors">
            <Download size={16} /> ব্যাকআপ
          </button>
          
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 bg-white border border-orange-500 text-orange-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-orange-50 transition-colors">
            <UploadCloud size={16} /> রিস্টোর
          </button>
          <input type="file" ref={fileInputRef} onChange={handleRestore} accept=".json" className="hidden" />

          <button 
            onClick={() => { setFormData({}); setEditingMember(null); setIsAddModalOpen(true); }}
            className="flex items-center gap-2 bg-[#143d27] text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#1a4f33] transition-colors ml-auto"
          >
            <Plus size={16} /> নতুন পূর্বপুরুষ
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button onClick={() => setViewMode('TREE')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${viewMode === 'TREE' ? 'bg-[#143d27] text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Tree</button>
        <button onClick={() => setViewMode('LIST')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${viewMode === 'LIST' ? 'bg-[#143d27] text-white' : 'text-slate-600 hover:bg-slate-100'}`}>তালিকা</button>
        <button onClick={() => setViewMode('TABLE')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${viewMode === 'TABLE' ? 'bg-[#143d27] text-white' : 'text-slate-600 hover:bg-slate-100'}`}>টেবিল</button>
        <button onClick={() => setViewMode('TIMELINE')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${viewMode === 'TIMELINE' ? 'bg-[#143d27] text-white' : 'text-slate-600 hover:bg-slate-100'}`}>টাইমলাইন</button>
        <button onClick={() => setViewMode('CARD')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${viewMode === 'CARD' ? 'bg-[#143d27] text-white' : 'text-slate-600 hover:bg-slate-100'}`}>কার্ড</button>
        <button onClick={() => setViewMode('FOLD')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${viewMode === 'FOLD' ? 'bg-[#143d27] text-white' : 'text-slate-600 hover:bg-slate-100'}`}>ভাঁজযোগ্য</button>
        <button onClick={() => setViewMode('HYBRID')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${viewMode === 'HYBRID' ? 'bg-[#143d27] text-white' : 'text-slate-600 hover:bg-slate-100'}`}>হাইব্রিড</button>
      </div>

      {/* Family Tree Specialized Header (Hidden in UI, Shown in Export via DownloadDropdown) */}
      <div className="hidden export-only-header w-full mb-8" style={{ fontFamily: "'Inter', 'Noto Sans Bengali', sans-serif" }}>
        <div className="text-center mb-2">
          <span className="text-emerald-800 text-xl font-bold">بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ</span>
        </div>
        <div className="flex justify-between items-center border-b-2 border-[#143d27] pb-4">
          <div className="w-1/3">
            <img src="/logo.png" alt="Apon Foundation" className="h-16 w-auto object-contain" />
          </div>
          <div className="w-1/3 text-center">
            <h1 className="text-3xl font-bold flex justify-center gap-1">
              <span className="text-[#143d27]">আপন</span>
              <span className="text-[#d97706]">ফাউন্ডেশন</span>
            </h1>
            <p className="text-xs text-amber-500 font-bold mt-1">মানুষের সেবায় আমরা সদা প্রস্তুত</p>
          </div>
          <div className="w-1/3 text-right">
            <p className="text-sm font-bold text-slate-700">বালীগাঁও, অষ্টগ্রাম, কিশোরগঞ্জ</p>
          </div>
        </div>
      </div>

      {/* Main View Area */}
      <div className="bg-white rounded-xl shadow-inner border border-slate-200 overflow-auto min-h-[800px] relative a4-landscape-container" ref={chartRef}>
        {viewMode === 'TREE' && (
          <div className="min-w-max p-16 flex flex-col items-center">
            {renderTree(null, 0)}
          </div>
        )}

        {viewMode === 'LIST' && (
          <div className="space-y-2">
            {filteredMembers.map(m => (
              <div key={m.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg border border-slate-100 cursor-pointer" onClick={() => setSelectedMember(m)}>
                <div className="flex items-center gap-3">
                  {m.photo ? <img src={m.photo} className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">{m.name.charAt(0)}</div>}
                  <div>
                    <p className="font-bold text-slate-800">{m.name}</p>
                    <p className="text-xs text-slate-500">{m.relationship} • প্রজন্ম: {m.generation}</p>
                  </div>
                </div>
                <div className="text-sm text-slate-500">
                  {m.birthYear && `${m.birthYear} - ${m.deathYear || 'বর্তমান'}`}
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === 'TABLE' && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200">
                <th className="p-3">নাম</th>
                <th className="p-3">সম্পর্ক</th>
                <th className="p-3">প্রজন্ম</th>
                <th className="p-3">জীবনকাল</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map(m => (
                <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedMember(m)}>
                  <td className="p-3 font-medium text-slate-800 flex items-center gap-2">
                    {m.photo && <img src={m.photo} className="w-6 h-6 rounded-full" />}
                    {m.name}
                  </td>
                  <td className="p-3 text-slate-600">{m.relationship}</td>
                  <td className="p-3 text-slate-600">{m.generation}</td>
                  <td className="p-3 text-slate-600">{m.birthYear ? `${m.birthYear} - ${m.deathYear || 'বর্তমান'}` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {viewMode === 'CARD' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {filteredMembers.map(m => (
              <div key={m.id} className="border border-slate-200 rounded-xl p-4 text-center hover:shadow-md cursor-pointer transition-shadow" onClick={() => setSelectedMember(m)}>
                {m.photo ? (
                  <img src={m.photo} className="w-20 h-20 rounded-full mx-auto mb-3 object-cover" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-2xl font-bold text-slate-400">{m.name.charAt(0)}</div>
                )}
                <h3 className="font-bold text-slate-800">{m.name}</h3>
                <p className="text-sm text-slate-500">{m.relationship}</p>
                <div className="mt-2 inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">প্রজন্ম {m.generation}</div>
              </div>
            ))}
          </div>
        )}

        {viewMode === 'TIMELINE' && (
          <div className="space-y-8 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {members.filter(m => m.birthYear).sort((a, b) => Number(a.birthYear) - Number(b.birthYear)).map((m, idx) => (
              <div key={m.id} className="relative pl-12">
                <div className="absolute left-0 top-1.5 w-10 h-10 rounded-full bg-white border-2 border-[#143d27] flex items-center justify-center z-10 shadow-sm">
                  <Clock size={16} className="text-[#143d27]" />
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedMember(m)}>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full mb-2 inline-block">সাল: {m.birthYear}</span>
                      <h3 className="text-lg font-bold text-slate-800">{m.name}</h3>
                      <p className="text-sm text-slate-500">{m.relationship} • প্রজন্ম {m.generation}</p>
                    </div>
                    {m.photo && <img src={m.photo} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />}
                  </div>
                </div>
              </div>
            ))}
            {members.filter(m => m.birthYear).length === 0 && (
              <div className="text-center py-20 text-slate-400">
                জন্ম সাল যুক্ত কোনো সদস্য নেই।
              </div>
            )}
          </div>
        )}

        {viewMode === 'FOLD' && (
          <div className="p-4 bg-white rounded-xl border border-slate-200">
            <div className="space-y-4">
              <p className="text-xs text-slate-400 mb-4">* সদস্যদের বিস্তারিত দেখতে তাদের নামের ওপর ক্লিক করুন।</p>
              {members.filter(m => !m.parentId).map(root => (
                <CollapsibleNode 
                  key={root.id} 
                  member={root} 
                  allMembers={members} 
                  onSelect={setSelectedMember} 
                />
              ))}
            </div>
          </div>
        )}

        {viewMode === 'HYBRID' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: maxGeneration }, (_, i) => i + 1).map(gen => (
              <div key={gen} className="space-y-3">
                <h3 className="bg-[#143d27] text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center justify-between shadow-sm">
                  <span>প্রজন্ম {gen}</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded text-[10px]">{members.filter(m => m.generation === gen).length} জন</span>
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {members.filter(m => m.generation === gen).map(m => (
                    <div key={m.id} className="bg-white p-3 rounded-lg border border-slate-100 hover:border-green-200 cursor-pointer shadow-sm transition-all flex items-center gap-3" onClick={() => setSelectedMember(m)}>
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 text-xs">
                        {m.photo ? <img src={m.photo} className="w-full h-full rounded-full object-cover" /> : m.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-800">{m.name}</p>
                        <p className="text-[10px] text-slate-500">{m.relationship}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Member Details Popup */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[250] p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-fade-in">
            <div className="relative h-32 bg-gradient-to-r from-green-500 to-emerald-600">
              <button onClick={() => setSelectedMember(null)} className="absolute top-4 right-4 text-white hover:bg-white/20 p-1 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="px-6 pb-6 relative">
              <div className="w-24 h-24 rounded-full border-4 border-white bg-white absolute -top-12 left-1/2 -translate-x-1/2 shadow-md overflow-hidden flex items-center justify-center text-4xl font-bold text-slate-300">
                {selectedMember.photo ? <img src={selectedMember.photo} className="w-full h-full object-cover" /> : selectedMember.name.charAt(0)}
              </div>
              
              <div className="mt-14 text-center">
                <h2 className="text-2xl font-bold text-slate-800">{selectedMember.name}</h2>
                <p className="text-green-600 font-medium">{selectedMember.relationship}</p>
                
                <div className="mt-6 space-y-3 text-left">
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500 text-sm">প্রজন্ম</span>
                    <span className="font-medium text-slate-800">{selectedMember.generation}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500 text-sm">জন্ম সাল</span>
                    <span className="font-medium text-slate-800">{selectedMember.birthYear || '-'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500 text-sm">মৃত্যু সাল</span>
                    <span className="font-medium text-slate-800">{selectedMember.deathYear || 'বর্তমান'}</span>
                  </div>
                  {selectedMember.parentId && (
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500 text-sm">পিতা/মাতা</span>
                      <span className="font-medium text-slate-800">
                        {members.find(m => m.id === selectedMember.parentId)?.name || 'অজানা'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex gap-3">
                  <button 
                    onClick={() => {
                      setFormData(selectedMember);
                      setEditingMember(selectedMember);
                      setIsAddModalOpen(true);
                      setSelectedMember(null);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors"
                  >
                    <Edit size={16} /> সম্পাদনা
                  </button>
                  <button 
                    onClick={() => handleDelete(selectedMember.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={16} /> মুছুন
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Preview Modal */}
      {isExportPreviewOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-4 border-b border-slate-100 flex flex-wrap justify-between items-center bg-slate-50 gap-4">
                <div className="flex items-center gap-6 flex-wrap">
                  <h3 className="font-bold text-slate-800">রপ্তানি প্রিভিউ ({exportPageSize} {exportOrientation === 'landscape' ? 'ল্যান্ডস্কেপ' : 'পোর্ট্রেট'})</h3>
                  
                  {/* Page Size Selector */}
                  <div className="flex bg-slate-200 p-1 rounded-lg">
                    {(['POSTER', 'A1', 'A0'] as const).map((size) => (
                      <button 
                        key={size}
                        onClick={() => setExportPageSize(size)}
                        className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${exportPageSize === size ? 'bg-white text-[#143d27] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        {size === 'POSTER' ? 'Standard Poster' : `${size} (Mega)`}
                      </button>
                    ))}
                  </div>

                  {/* Orientation Selector */}
                  <div className="flex bg-slate-200 p-1 rounded-lg">
                    <button 
                      onClick={() => setExportOrientation('portrait')}
                      className={`px-4 py-1.5 rounded-md text-[10px] font-bold transition-all ${exportOrientation === 'portrait' ? 'bg-white text-[#143d27] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      পোর্ট্রেট
                    </button>
                    <button 
                      onClick={() => setExportOrientation('landscape')}
                      className={`px-4 py-1.5 rounded-md text-[10px] font-bold transition-all ${exportOrientation === 'landscape' ? 'bg-white text-[#143d27] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      ল্যান্ডস্কেপ
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <DownloadDropdown 
                    targetRef={previewRef} 
                    fileNamePrefix={`Family_${viewMode}_${exportPageSize}_${exportOrientation}`} 
                    settings={settings} 
                    logoUrl={logoUrl || null} 
                    forcedOrientation={exportOrientation}
                    pageSize={exportPageSize}
                    memberCount={members.length}
                    generationCount={maxGeneration}
                  />
                <button 
                  onClick={() => setIsExportPreviewOpen(false)}
                  className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <X size={20} className="text-slate-500" />
                </button>
              </div>
            </div>
            
            <div className="p-8 overflow-auto max-h-[85vh] bg-slate-400/30 flex justify-center">
              {/* This represents the physical A4 page */}
              <div 
                ref={previewRef}
                id="family-tree-export-preview"
                className="bg-white shadow-2xl p-[15mm] relative box-border flex flex-col items-center"
              >
                <DocumentHeader 
                  logoUrl={logoUrl} 
                  settings={settings} 
                  rightElement={(
                    <div className="text-right flex flex-col items-end gap-1">
                      <div className="bg-[#004d26] text-white px-3 py-1 rounded text-[10px] font-bold uppercase">বংশ তালিকা</div>
                      <p className="text-[9px] font-bold text-slate-400">রপ্তানি কপি</p>
                    </div>
                  )}
                />

                {/* Content based on current viewMode */}
                <div className="flex-1 w-full py-4 overflow-visible flex flex-col items-center">
                  <div style={{ 
                    // Optimized scaling for mega formats
                    transform: viewMode === 'TREE' 
                      ? (exportPageSize === 'A0' ? 'scale(1.8)' : 
                         exportPageSize === 'A1' ? 'scale(1.4)' :
                         'scale(1.2)')
                      : 'scale(1)', 
                    transformOrigin: 'top center',
                    width: 'max-content'
                  }}>
                    {viewMode === 'TREE' && (
                      <div className="flex flex-col items-center">
                        {renderTree(null, 0)}
                      </div>
                    )}
                    
                    {viewMode === 'LIST' && (
                      <div className="space-y-2 w-full">
                        {filteredMembers.map(m => (
                          <div key={m.id} className="flex items-center justify-between p-2 border border-slate-100 rounded bg-white">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 text-xs">
                                {m.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-sm text-slate-800">{m.name}</p>
                                <p className="text-[10px] text-slate-500">{m.relationship} • প্রজন্ম {m.generation}</p>
                              </div>
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {m.birthYear && `${m.birthYear} - ${m.deathYear || 'বর্তমান'}`}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {viewMode === 'TABLE' && (
                      <table className="w-full text-left border-collapse border border-slate-200">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="p-2 border border-slate-200 text-xs font-bold text-slate-700">নাম</th>
                            <th className="p-2 border border-slate-200 text-xs font-bold text-slate-700">সম্পর্ক</th>
                            <th className="p-2 border border-slate-200 text-xs font-bold text-slate-700 text-center">প্রজন্ম</th>
                            <th className="p-2 border border-slate-200 text-xs font-bold text-slate-700">সাল</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredMembers.map(m => (
                            <tr key={m.id}>
                              <td className="p-2 border border-slate-200 text-xs">{m.name}</td>
                              <td className="p-2 border border-slate-200 text-xs">{m.relationship}</td>
                              <td className="p-2 border border-slate-200 text-xs text-center">{m.generation}</td>
                              <td className="p-2 border border-slate-200 text-xs whitespace-nowrap">{m.birthYear || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {viewMode === 'HYBRID' && (
                      <div className="grid grid-cols-2 gap-4 w-full">
                        {Array.from({ length: maxGeneration }, (_, i) => i + 1).map(gen => (
                          <div key={gen} className="space-y-1.5">
                            <h3 className="bg-[#143d27] text-white px-2 py-1 rounded font-bold text-[10px]">
                              প্রজন্ম {gen} ({members.filter(m => m.generation === gen).length})
                            </h3>
                            <div className="grid grid-cols-1 gap-1">
                              {members.filter(m => m.generation === gen).map(m => (
                                <div key={m.id} className="bg-white p-1.5 border border-slate-200 rounded text-[9px] flex items-center gap-2">
                                  <span className="font-bold">{m.name}</span>
                                  <span className="text-slate-400">({m.relationship})</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {viewMode === 'TIMELINE' && (
                      <div className="space-y-4 relative before:absolute before:left-[14px] before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-200">
                        {members.filter(m => m.birthYear).sort((a, b) => Number(a.birthYear) - Number(b.birthYear)).map((m) => (
                          <div key={m.id} className="relative pl-8">
                            <div className="absolute left-0 top-1 w-7 h-7 rounded-full bg-white border border-[#143d27] flex items-center justify-center z-10 text-[10px] font-bold text-[#143d27]">
                              {m.birthYear?.slice(-2)}
                            </div>
                            <div className="bg-white p-2 rounded border border-slate-100 shadow-sm">
                              <h3 className="text-xs font-bold text-slate-800">{m.name}</h3>
                              <p className="text-[9px] text-slate-500">{m.relationship} • প্রজন্ম {m.generation} • জন্ম: {m.birthYear}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {viewMode === 'CARD' && (
                      <div className="grid grid-cols-3 gap-3 w-full">
                        {filteredMembers.map(m => (
                          <div key={m.id} className="border border-slate-200 rounded p-2 text-center bg-white shadow-sm">
                            <div className="w-8 h-8 rounded-full bg-slate-50 mx-auto mb-1 flex items-center justify-center text-xs font-bold text-slate-300">
                              {m.name.charAt(0)}
                            </div>
                            <h3 className="font-bold text-[10px] text-slate-800 leading-tight">{m.name}</h3>
                            <p className="text-[8px] text-slate-400">{m.relationship}</p>
                            <div className="mt-1 inline-block bg-green-50 text-green-700 text-[7px] px-1.5 py-0.5 rounded">প্রজন্ম {m.generation}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {viewMode === 'FOLD' && (
                      <div className="p-2 border border-slate-100 rounded bg-slate-50 w-full overflow-auto">
                        <p className="text-[10px] text-slate-400 mb-2 font-bold uppercase italic border-b border-slate-200 pb-1 italic">
                          Hierarchical Foldable View (Compact Export)
                        </p>
                        <div className="space-y-4">
                          {members.filter(m => !m.parentId).map(root => (
                            <CollapsibleNode 
                              key={root.id} 
                              member={root} 
                              allMembers={members} 
                              onSelect={() => {}} 
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <DocumentFooter settings={settings} isAwarenessPost={true} />
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 text-center border-t border-slate-100">
              <p className="text-xs text-slate-500 italic">প্রিভিউটি A4 ল্যান্ডস্কেপ লেআউটে সাজানো হয়েছে। ডাউনলোড করলে সরাসরি এই ফরম্যাটে ফাইলটি পাবেন।</p>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[250] p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">{editingMember ? 'সদস্য সম্পাদনা' : 'নতুন সদস্য যোগ'}</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">নাম *</label>
                <input 
                  type="text" 
                  required
                  value={formData.name || ''}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">প্রজন্ম নম্বর *</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    value={formData.generation || ''}
                    onChange={e => setFormData({...formData, generation: Number(e.target.value)})}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">সম্পর্ক</label>
                  <input 
                    type="text" 
                    placeholder="যেমন: পিতা, মাতা, সন্তান"
                    value={formData.relationship || ''}
                    onChange={e => setFormData({...formData, relationship: e.target.value})}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">জন্ম সাল</label>
                  <input 
                    type="text" 
                    placeholder="যেমন: ১৯৫০"
                    value={formData.birthYear || ''}
                    onChange={e => setFormData({...formData, birthYear: e.target.value})}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">মৃত্যু সাল</label>
                  <input 
                    type="text" 
                    placeholder="জীবিত থাকলে ফাঁকা রাখুন"
                    value={formData.deathYear || ''}
                    onChange={e => setFormData({...formData, deathYear: e.target.value})}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">পিতা/মাতা নির্বাচন করুন</label>
                <select 
                  value={formData.parentId || ''}
                  onChange={e => setFormData({...formData, parentId: e.target.value || null})}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                >
                  <option value="">-- মূল/প্রথম প্রজন্ম --</option>
                  {members.filter(m => m.id !== editingMember?.id).map(m => (
                    <option key={m.id} value={m.id}>{m.name} (প্রজন্ম {m.generation})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ছবি আপলোড</label>
                <div className="flex items-center gap-4">
                  {formData.photo ? (
                    <img src={formData.photo} className="w-16 h-16 rounded-lg object-cover border border-slate-200" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                      <ImageIcon size={24} />
                    </div>
                  )}
                  <div className="flex-1">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2 border border-slate-300 text-slate-700 rounded-lg font-bold hover:bg-slate-50 transition-colors"
                >
                  বাতিল
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors shadow-md"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const CollapsibleNode: React.FC<{ 
  member: FamilyMember; 
  allMembers: FamilyMember[]; 
  onSelect: (m: FamilyMember) => void;
}> = ({ member, allMembers, onSelect }) => {
  const [isOpen, setIsOpen] = useState(true);
  const children = allMembers.filter(m => m.parentId === member.id);

  return (
    <div className="ml-0 md:ml-6 border-l-2 border-slate-100 pl-4 py-1">
      <div className="flex items-center gap-2 group">
        {children.length > 0 && (
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="w-5 h-5 flex items-center justify-center bg-slate-100 rounded text-slate-500 hover:bg-slate-200 transition-colors"
          >
            {isOpen ? '-' : '+'}
          </button>
        )}
        <div 
          onClick={() => onSelect(member)}
          className="py-1.5 px-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-all flex items-center gap-2"
        >
          <span className="font-bold text-slate-800 text-sm">{member.name}</span>
          <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">প্রজন্ম {member.generation}</span>
        </div>
      </div>
      {isOpen && children.length > 0 && (
        <div className="mt-1">
          {children.map(child => (
            <CollapsibleNode 
              key={child.id} 
              member={child} 
              allMembers={allMembers} 
              onSelect={onSelect} 
            />
          ))}
        </div>
      )}
    </div>
  );
};
