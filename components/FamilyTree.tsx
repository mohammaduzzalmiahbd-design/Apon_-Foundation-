import React, { useState, useRef, useMemo } from 'react';
import { Download, Search, Plus, ArrowLeft, Edit, Trash2, X, Image as ImageIcon, FileText, List, Table as TableIcon, Clock, LayoutGrid, Layers, GitMerge, Save, UploadCloud } from 'lucide-react';
import { FamilyMember } from '../types';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface FamilyTreeProps {
  members: FamilyMember[];
  setMembers: React.Dispatch<React.SetStateAction<FamilyMember[]>>;
  onBack: () => void;
}

type ViewMode = 'TREE' | 'LIST' | 'TABLE' | 'TIMELINE' | 'CARD' | 'FOLD' | 'HYBRID';

export const FamilyTree: React.FC<FamilyTreeProps> = ({ members, setMembers, onBack }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('TREE');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  
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

  const handleDownload = async (format: 'PDF' | 'JPG' | 'PNG' | 'SVG') => {
    if (!chartRef.current) return;
    
    try {
      // Use a higher scale for high-resolution (16K-like) output
      const canvas = await html2canvas(chartRef.current, { scale: 4, useCORS: true });
      
      if (format === 'PDF') {
        const imgData = canvas.toDataURL('image/png', 1.0);
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4'
        });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('family-tree.pdf');
      } else if (format === 'JPG' || format === 'PNG') {
        const link = document.createElement('a');
        link.download = `family-tree.${format.toLowerCase()}`;
        link.href = canvas.toDataURL(`image/${format.toLowerCase()}`, 1.0);
        link.click();
      } else if (format === 'SVG') {
        // Basic SVG export (not true vector, just embedded image for simplicity in this context)
        const imgData = canvas.toDataURL('image/png', 1.0);
        const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}"><image href="${imgData}" width="${canvas.width}" height="${canvas.height}"/></svg>`;
        const blob = new Blob([svgString], {type: 'image/svg+xml'});
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'family-tree.svg';
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Download failed:', error);
      alert('ডাউনলোড করতে সমস্যা হয়েছে।');
    }
  };

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

  const renderTree = (parentId: string | null = null, level = 0) => {
    const children = members.filter(m => m.parentId === parentId);
    if (children.length === 0) return null;

    return (
      <div className={`flex justify-center gap-6 ${level > 0 ? 'mt-10 relative pt-10' : ''}`}>
        {level > 0 && (
          <div className="absolute top-0 left-1/2 w-px h-10 bg-[#a855f7] -translate-x-1/2"></div>
        )}
        {level > 0 && children.length > 1 && (
          <div className="absolute top-10 left-0 right-0 h-px bg-[#a855f7]" style={{
            left: 'calc(25%)', right: 'calc(25%)' // Approximate connecting line
          }}></div>
        )}
        {children.map((child, index) => (
          <div key={child.id} className="flex flex-col items-center relative">
            {level > 0 && (
              <div className="absolute top-0 left-1/2 w-px h-10 bg-[#a855f7] -translate-x-1/2 -mt-10"></div>
            )}
            <div 
              className="bg-white border border-[#8b4513] rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-all w-40 text-center z-10 relative"
              onClick={() => setSelectedMember(child)}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white border border-[#8b4513] rounded px-2 py-0.5 text-[10px] text-[#8b4513] font-bold whitespace-nowrap">
                প্রজন্ম {child.generation}
              </div>
              <div className="p-3 pt-5 pb-4">
                <h3 className="font-bold text-slate-800 text-sm">{child.name}</h3>
              </div>
            </div>
            {renderTree(child.id, level + 1)}
          </div>
        ))}
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
            <button onClick={onBack} className="p-2 hover:bg-[#1a4f33] rounded-lg text-white transition-colors">
              <ArrowLeft size={24} />
            </button>
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
          
          <button onClick={() => handleDownload('PDF')} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-50 transition-colors">
            <Download size={16} /> PDF
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

      {/* Main View Area */}
      <div className="bg-slate-50 rounded-xl shadow-inner border border-slate-200 p-6 overflow-auto min-h-[600px] relative" ref={chartRef}>
        {viewMode === 'TREE' && (
          <div className="min-w-max p-8">
            {renderTree(null)}
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

        {(viewMode === 'TIMELINE' || viewMode === 'FOLD' || viewMode === 'HYBRID') && (
           <div className="flex items-center justify-center h-64 text-slate-500">
             এই ভিউ মোডটি শীঘ্রই আসছে...
           </div>
        )}
      </div>

      {/* Download Dropdown */}
      <div className="flex flex-col items-center mt-8">
        <div className="relative group">
          <button className="flex items-center gap-2 bg-[#143d27] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#1a4f33] transition-colors shadow-md">
            <Download size={18} /> ↓ ডাউনলোড করুন <span className="text-xs ml-1">^</span>
          </button>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-80 bg-[#143d27] rounded-xl shadow-2xl border border-[#1a4f33] p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
            <button onClick={() => handleDownload('PDF')} className="flex items-start gap-3 w-full text-left p-3 hover:bg-[#1a4f33] rounded-lg transition-colors group/item">
              <FileText className="text-blue-300 mt-1" size={20} />
              <div>
                <p className="text-yellow-500 font-bold text-sm group-hover/item:text-yellow-400">Download as PDF (16K)</p>
                <p className="text-slate-300 text-xs mt-0.5">ভেক্টর • A4 ল্যান্ডস্কেপ</p>
              </div>
            </button>
            <button onClick={() => handleDownload('JPG')} className="flex items-start gap-3 w-full text-left p-3 hover:bg-[#1a4f33] rounded-lg transition-colors group/item">
              <ImageIcon className="text-green-300 mt-1" size={20} />
              <div>
                <p className="text-yellow-500 font-bold text-sm group-hover/item:text-yellow-400">Download as JPG (16K)</p>
                <p className="text-slate-300 text-xs mt-0.5">রাস্টার • 15360x8640px</p>
              </div>
            </button>
            <button onClick={() => handleDownload('PNG')} className="flex items-start gap-3 w-full text-left p-3 hover:bg-[#1a4f33] rounded-lg transition-colors group/item">
              <ImageIcon className="text-purple-300 mt-1" size={20} />
              <div>
                <p className="text-yellow-500 font-bold text-sm group-hover/item:text-yellow-400">Download as PNG (16K)</p>
                <p className="text-slate-300 text-xs mt-0.5">রাস্টার • 15360x8640px</p>
              </div>
            </button>
            <button onClick={() => handleDownload('SVG')} className="flex items-start gap-3 w-full text-left p-3 hover:bg-[#1a4f33] rounded-lg transition-colors group/item">
              <Layers className="text-orange-300 mt-1" size={20} />
              <div>
                <p className="text-yellow-500 font-bold text-sm group-hover/item:text-yellow-400">Download as SVG (Vector, 16K)</p>
                <p className="text-slate-300 text-xs mt-0.5">ভেক্টর • যেকোনো জুমে শার্প</p>
              </div>
            </button>
          </div>
        </div>
        <p className="text-[10px] text-slate-500 mt-3 text-center max-w-md">
          PDF — ব্রাউজার প্রিন্ট ডায়ালগে A4 Landscape বেছে নিন | JPG/PNG — 15360x8640px (16K) | SVG — ভেক্টর, যেকোনো জুমে শার্প
        </p>
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
