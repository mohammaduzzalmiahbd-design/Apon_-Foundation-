import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, Users, BookOpen, Banknote, Upload, Menu, X, Save, 
  DownloadCloud, UploadCloud, AlertTriangle, CheckCircle, PieChart, 
  Bell, Smartphone, FileText, Link as LinkIcon, RefreshCw, Database, 
  Globe, Code, Copy, Eye, EyeOff, ExternalLink, ArrowRight, Search, 
  Home, ClipboardList, FileDown, CreditCard, GitMerge, Droplet, Info, 
  Settings as SettingsIcon, ArrowLeft, LogOut, LogIn, User as UserIcon, ShieldCheck 
} from 'lucide-react';
import { auth, AppUser, syncUserDocument, logout, handleRedirectResult, getBloodDonors, addBloodDonor, deleteBloodDonor, getAppSettingsFromFirestore, updateAppSettingsInFirestore, verifyConnection } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { OrganizationChart } from './components/OrganizationChart';
import { MemberDirectory } from './components/MemberDirectory';
import { Constitution } from './components/Constitution';
import { FinanceManager } from './components/FinanceManager';
import { ActivityReports } from './components/ActivityReports';
import { NoticeBoard } from './components/NoticeBoard';
import { IDCardGenerator } from './components/IDCardGenerator';
import { MemberForm } from './components/MemberForm';
import { DocumentsGenerator } from './components/DocumentsGenerator';
import { FamilyTree } from './components/FamilyTree';
import { BloodDonors } from './components/BloodDonors';
import { AboutUs } from './components/AboutUs';
import { Dashboard } from './components/Dashboard';
import { Settings } from './components/Settings';
import { Homepage } from './components/Homepage';
import { Login } from './components/Login';
import { Member, Transaction, ConstitutionSection, CouncilType, FamilyMember, BloodDonor, AppSettings, Notice } from './types';

type ViewType = 'HOMEPAGE' | 'DASHBOARD' | 'MEMBERS' | 'CONSTITUTION' | 'FINANCE' | 'REPORTS' | 'BACKUP' | 'NOTICE' | 'IDCARD' | 'FORM' | 'DOCUMENTS' | 'FAMILY_TREE' | 'BLOOD_DONORS' | 'ABOUT_US' | 'SETTINGS';

function App() {
  const [activeView, setActiveView] = useState<ViewType>(() => {
    // Immediate URL detection for correct initial render
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view') as ViewType | null;
    const validViews: ViewType[] = ['HOMEPAGE', 'DASHBOARD', 'MEMBERS', 'CONSTITUTION', 'FINANCE', 'REPORTS', 'BACKUP', 'NOTICE', 'IDCARD', 'FORM', 'DOCUMENTS', 'FAMILY_TREE', 'BLOOD_DONORS', 'ABOUT_US', 'SETTINGS'];
    if (viewParam && validViews.includes(viewParam)) return viewParam;
    return 'HOMEPAGE';
  });
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showForceProceed, setShowForceProceed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(true);
  const [isInIframe, setIsInIframe] = useState(false);
  const [menuSearch, setMenuSearch] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [embedCodeCopied, setEmbedCodeCopied] = useState(false);
  const [showEmbedCode, setShowEmbedCode] = useState(false);
  const [isEmbedMode, setIsEmbedMode] = useState(false);
  
  // Google Sheet Sync State
  const [sheetUrl, setSheetUrl] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  
  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<{msg: string, type: 'success'|'error'} | null>(null);
  const [firestoreStatus, setFirestoreStatus] = useState<{success: boolean, error?: string} | null>(null);

  // Fetch App Settings from Firestore
  useEffect(() => {
    const initApp = async () => {
      // First verify connection
      const conn = await verifyConnection();
      setFirestoreStatus(conn);
      
      if (conn.success) {
        const settings = await getAppSettingsFromFirestore();
        if (settings) {
          setAppSettings(prev => ({ ...prev, ...settings }));
        }
      }
    };
    initApp();
  }, []);

  const handleUpdateSettings = async (newSettings: AppSettings | ((prev: AppSettings) => AppSettings)) => {
    if (typeof newSettings === 'function') {
      const updated = newSettings(appSettings);
      setAppSettings(updated);
      await updateAppSettingsInFirestore(updated);
    } else {
      setAppSettings(newSettings);
      await updateAppSettingsInFirestore(newSettings);
    }
  };

  // --- Auth & Role Management ---
  useEffect(() => {
    let isMounted = true;
    let authResolved = false;

    // Safety timeout: Ensure loading screen eventually disappears (e.g. if SDK blocked)
    const safetyTimeout = setTimeout(() => {
      if (isMounted && !authResolved) {
        console.warn("Auth check timed out, proceeding to default state.");
        setIsAuthLoading(false);
      }
    }, 6000); // Increased to 6s for slower networks

    const subscribeToAuth = async () => {
      // 1. Handle Redirect Result FIRST
      try {
        const user = await handleRedirectResult();
        if (user && isMounted) {
          const appUser = await syncUserDocument(user);
          setCurrentUser(appUser);
          setIsAuthLoading(false);
          authResolved = true;
          return; // Stop here if redirect resolved
        }
      } catch (error: any) {
        console.error("Redirect login error", error);
        // Don't set hard error here, let onAuthStateChanged try to recover
      }

      // 2. Main Auth Listener
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!isMounted) return;
        
        authResolved = true;
        setAuthError(null);
        
        try {
          if (user) {
            const appUser = await syncUserDocument(user);
            setCurrentUser(appUser);
          } else {
            setCurrentUser(null);
          }
        } catch (error: any) {
          console.error("Error syncing user", error);
          
          // If profile sync fails (e.g. session expired or Firestore blocked)
          // we should still allow entrance if the user is verified, 
          // or show a clear way to re-login.
          if (error.code === 'permission-denied' || error.message?.includes('permission')) {
             setAuthError("আপনার প্রোফাইল এক্সেস করার অনুমতি নেই। এডমিনের সাথে যোগাযোগ করুন।");
          } else {
             setAuthError(error.message || "ইউজার প্রোফাইল সিঙ্ক করতে সমস্যা হয়েছে।");
          }
          
          // If it's a transient error, we don't necessarily want to block the whole app 
          // but we MUST ensure currentUser is null if we can't verify them.
          setCurrentUser(null);
        } finally {
          setIsAuthLoading(false);
        }
      });

      return unsubscribe;
    };

    const authUnsubscribePromise = subscribeToAuth();

    return () => {
      isMounted = false;
      clearTimeout(safetyTimeout);
      authUnsubscribePromise.then(unsub => unsub && typeof unsub === 'function' && unsub());
    };
  }, []);

  // Handle loading fallback link
  useEffect(() => {
    if (isAuthLoading) {
      const timer = setTimeout(() => {
        setShowForceProceed(true);
      }, 2000); // Show link after 2s of loading
      return () => clearTimeout(timer);
    }
  }, [isAuthLoading]);

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN';
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  // --- Handle URL Routing & PWA Install ---
  useEffect(() => {
    setIsInIframe(window.self !== window.top);
    // 1. Handle PWA Install Prompt
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log("Install prompt captured");
    };
    window.addEventListener('beforeinstallprompt', handler);

    // 2. Handle URL Query Params for Routing
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view') as ViewType | null;
    const modeParam = params.get('mode');

    // Set Embed Mode
    if (modeParam === 'embed') {
      setIsEmbedMode(true);
    }
    
    // Validate view param
    const validViews: ViewType[] = ['HOMEPAGE', 'DASHBOARD', 'MEMBERS', 'CONSTITUTION', 'FINANCE', 'REPORTS', 'BACKUP', 'NOTICE', 'IDCARD', 'FORM', 'DOCUMENTS', 'FAMILY_TREE', 'BLOOD_DONORS', 'ABOUT_US', 'SETTINGS'];
    
    if (viewParam && validViews.includes(viewParam)) {
      setActiveView(viewParam);
    }

    // 3. Load Sheet URL
    const savedUrl = localStorage.getItem('foundation_sheet_url');
    if (savedUrl) setSheetUrl(savedUrl);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  // --- Navigation Handler ---
  const handleNavigate = (view: ViewType) => {
    setActiveView(view);
    setIsMobileMenuOpen(false);
    // Don't hide menu on navigation to prevent user confusion
    
    // Update URL without reloading - WRAPPED IN TRY CATCH
    try {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('view', view);
      if (isEmbedMode) newUrl.searchParams.set('mode', 'embed');
      window.history.pushState({}, '', newUrl);
    } catch (e) {
      // Ignore SecurityError in sandboxed environments (like CodeSandbox/StackBlitz previews)
      console.warn("Navigation state update skipped due to environment restrictions:", e);
    }
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  const handleCopyLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('view', activeView);
    // Remove mode=embed for normal sharing
    url.searchParams.delete('mode');
    navigator.clipboard.writeText(url.toString());
    
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const getEmbedUrl = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('view', activeView);
    url.searchParams.set('mode', 'embed'); // Force embed mode
    return url.toString();
  };

  const handleCopyEmbedCode = () => {
    const url = getEmbedUrl();
    const code = `<iframe src="${url}" style="width:100%; height:800px; border:none; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);"></iframe>`;
    navigator.clipboard.writeText(code);
    setEmbedCodeCopied(true);
    setTimeout(() => setEmbedCodeCopied(false), 2000);
  };

  // --- State Data ---
  const [logo, setLogo] = useState<string | null>(() => {
    return localStorage.getItem('foundation_logo') || null;
  });

  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('foundation_members');
    if (saved) return JSON.parse(saved);
    return [];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('foundation_transactions');
    if (saved) return JSON.parse(saved);
    return [];
  });

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(() => {
    const saved = localStorage.getItem('foundation_family_members');
    if (saved) return JSON.parse(saved);
    return [];
  });

  const [bloodDonors, setBloodDonors] = useState<BloodDonor[]>([]);

  // Fetch Blood Donors from Firestore
  useEffect(() => {
    const fetchDonors = async () => {
      const donors = await getBloodDonors();
      setBloodDonors(donors);
    };
    fetchDonors();
  }, []);

  const [notices, setNotices] = useState<Notice[]>(() => {
    const saved = localStorage.getItem('foundation_notices');
    if (saved) return JSON.parse(saved);
    return [];
  });

  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    const defaultSettings: AppSettings = {
      contact: {
        email: 'admin@aponfoundation.org',
        whatsapp: '+8801XXXXXXXXX',
        phone: '+8801XXXXXXXXX',
        address: 'বালীগাঁও, অষ্টগ্রাম, কিশোরগঞ্জ, বাংলাদেশ'
      },
      organization: {
        name: 'আপন ফাউন্ডেশন',
        established: '২০২৫',
        slogan: 'সেবাই আমাদের পরম ধর্ম',
        registration: 'প্রক্রিয়াধীন'
      },
      admin: {
        username: 'admin',
        passwordHash: 'admin'
      }
    };
    try {
      const saved = localStorage.getItem('foundation_app_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.organization) {
          return { ...defaultSettings, ...parsed, organization: { ...defaultSettings.organization, ...parsed.organization } };
        }
      }
    } catch (e) {
      console.error("Error parsing settings:", e);
    }
    return defaultSettings;
  });

  const [constitutionSections, setConstitutionSections] = useState<ConstitutionSection[]>(() => {
    const saved = localStorage.getItem('foundation_constitution');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error("Error parsing constitution:", e);
      }
    }
    return [
      {
        id: 'cover',
        title: 'প্রচ্ছদ',
        content: `বিসমিল্লাহির রাহমানির রাহিম

আপন ফাউন্ডেশন
এর
গঠনতন্ত্র ও নীতিমালা

সংকলন ও সম্পাদনায় - মুহাম্মদ উজ্জল মিয়া , উপদেষ্টা, আপন ফাউন্ডেশন।
সার্বিক সহযোগিতায় - আব্দুল জিহাদ, প্রধান উদ্যোক্তা ও প্রতিষ্ঠাতা উপদেষ্টা।

স্থাপিত: ২০২৫`
      }
    ];
  });









  // Dynamic Manifest generation for PWA Icon
  useEffect(() => {
    if (logo) {
      const manifestUrl = `/manifest.json`;
      // Instead of relying on static manifest, we construct a blob dynamically
      const manifest = {
        "short_name": "Apon Foundation",
        "name": "Apon Foundation Management System",
        "icons": [
          {
            "src": logo,
            "sizes": "192x192 512x512",
            "type": "image/png"
          }
        ],
        "start_url": "/",
        "display": "standalone",
        "theme_color": "#2563eb",
        "background_color": "#ffffff"
      };
      
      const stringManifest = JSON.stringify(manifest);
      const blob = new Blob([stringManifest], {type: 'application/json'});
      const manifestObjectURL = URL.createObjectURL(blob);
      
      const linkElements = document.querySelectorAll('link[rel="manifest"]');
      if (linkElements.length > 0) {
        linkElements.forEach(el => el.setAttribute('href', manifestObjectURL));
      } else {
        const link = document.createElement('link');
        link.rel = 'manifest';
        link.href = manifestObjectURL;
        document.head.appendChild(link);
      }
      
      // Add favicon too
      let favicon = document.querySelector('link[rel="icon"]');
      if (!favicon) {
          favicon = document.createElement('link');
          favicon.setAttribute('rel', 'icon');
          document.head.appendChild(favicon);
      }
      favicon.setAttribute('href', logo);

      return () => {
        URL.revokeObjectURL(manifestObjectURL);
      };
    }
  }, [logo]);

  // --- Data Cleanup & Initialization ---
  useEffect(() => {
    // Purge specific dummy IDs from localStorage if they exist
    const dummyMemberIds = ['1', '2', '3', '4'];
    const dummyTransactionIds = ['101', '102', '103', '104', '105'];
    
    setMembers(prev => prev.filter(m => !dummyMemberIds.includes(m.id)));
    setTransactions(prev => prev.filter(t => !dummyTransactionIds.includes(t.id)));
    setFamilyMembers(prev => prev.filter(fm => !dummyMemberIds.includes(fm.id)));
  }, []);

  // Persist state changes
  useEffect(() => {
    localStorage.setItem('foundation_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('foundation_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('foundation_family_members', JSON.stringify(familyMembers));
  }, [familyMembers]);

  useEffect(() => {
    localStorage.setItem('foundation_blood_donors', JSON.stringify(bloodDonors));
  }, [bloodDonors]);

  useEffect(() => {
    localStorage.setItem('foundation_app_settings', JSON.stringify(appSettings));
  }, [appSettings]);

  useEffect(() => {
    localStorage.setItem('foundation_constitution', JSON.stringify(constitutionSections));
  }, [constitutionSections]);

  useEffect(() => {
    localStorage.setItem('foundation_notices', JSON.stringify(notices));
  }, [notices]);

  useEffect(() => {
    if (logo) {
      localStorage.setItem('foundation_logo', logo);
    } else {
      localStorage.removeItem('foundation_logo');
    }
  }, [logo]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Google Sheet Logic ---
  const handleSheetSync = async () => {
    if (!sheetUrl) return;
    setIsSyncing(true);
    setImportStatus(null);
    localStorage.setItem('foundation_sheet_url', sheetUrl);

    try {
      // Fetch CSV
      const response = await fetch(sheetUrl);
      if (!response.ok) throw new Error('Network error');
      const csvText = await response.text();
      
      // Parse CSV (Simple parsing)
      const rows = csvText.split('\n').map(row => row.split(','));
      // Assume Headers: Name, Phone, Council, Designation, NID, Address, BloodGroup
      // Skip Header row
      const newMembers: Member[] = [];
      
      for (let i = 1; i < rows.length; i++) {
        const cols = rows[i].map(c => c.replace(/"/g, '').trim()); // Clean quotes
        if (cols.length < 3) continue; // Skip empty rows

        const [name, phone, council, designation, nid, address, bloodGroup] = cols;
        
        // Map Council Type safely
        let councilType: CouncilType = 'GENERAL';
        const cUp = council?.toUpperCase() || '';
        if (cUp.includes('ADV') || cUp.includes('উপদেষ্টা')) councilType = 'ADVISORY';
        else if (cUp.includes('EXE') || cUp.includes('নির্বাহী')) councilType = 'EXECUTIVE';

        if (name && phone) {
           newMembers.push({
             id: `sheet-${i}`,
             name,
             phone,
             council: councilType,
             designation: designation || '',
             nid: nid || '',
             address: address || '',
             bloodGroup: bloodGroup || '',
             joinDate: new Date().toISOString().split('T')[0]
           });
        }
      }

      if (newMembers.length > 0) {
        setMembers(newMembers);
        setImportStatus({ msg: `গুগল শিট থেকে ${newMembers.length} জন সদস্যের তথ্য আপডেট হয়েছে!`, type: 'success' });
      } else {
        setImportStatus({ msg: 'শিটে কোনো সঠিক তথ্য পাওয়া যায়নি। কলামগুলো চেক করুন।', type: 'error' });
      }

    } catch (error) {
      console.error(error);
      setImportStatus({ msg: 'লিংকটি কাজ করছে না। দয়া করে "Publish to Web > CSV" লিংকটি দিন।', type: 'error' });
    } finally {
      setIsSyncing(false);
    }
  };

  // --- Backup Functions ---
  const handleExportData = () => {
    const data = {
      members,
      transactions,
      constitutionSections,
      exportDate: new Date().toISOString(),
      appName: 'FoundationManagerPro'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `foundation_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        
        if (json.appName === 'FoundationManagerPro') {
          if (json.members) setMembers(json.members);
          if (json.transactions) setTransactions(json.transactions);
          if (json.constitutionSections) setConstitutionSections(json.constitutionSections);
          setImportStatus({ msg: 'সফলভাবে ডাটা রিস্টোর করা হয়েছে!', type: 'success' });
        } else {
          setImportStatus({ msg: 'ভুল ফাইল ফরম্যাট! সঠিক ব্যাকআপ ফাইল নির্বাচন করুন।', type: 'error' });
        }
      } catch (error) {
        setImportStatus({ msg: 'ফাইল রিড করতে সমস্যা হয়েছে।', type: 'error' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const menuSections = useMemo(() => [
    {
      title: 'মূল বিভাগ',
      items: [
        { view: 'HOMEPAGE' as ViewType, icon: Globe, label: 'হোমপেজ', roles: ['SUPER_ADMIN', 'ADMIN', 'USER'] },
      ]
    },
    {
      title: 'প্রশাসনিক',
      items: [
        { view: 'DASHBOARD' as ViewType, icon: Home, label: 'ড্যাশবোর্ড', roles: ['SUPER_ADMIN', 'ADMIN', 'USER'] },
        { view: 'MEMBERS' as ViewType, icon: Users, label: 'সদস্য তালিকা', roles: ['SUPER_ADMIN', 'ADMIN', 'USER'] },
        { view: 'CONSTITUTION' as ViewType, icon: BookOpen, label: 'গঠনতন্ত্র', roles: ['SUPER_ADMIN', 'ADMIN', 'USER'] },
        { view: 'FINANCE' as ViewType, icon: Banknote, label: 'আর্থিক ব্যবস্থাপনা', roles: ['SUPER_ADMIN', 'ADMIN'] },
        { view: 'IDCARD' as ViewType, icon: CreditCard, label: 'আইডি কার্ড', roles: ['SUPER_ADMIN', 'ADMIN'] },
        { view: 'FORM' as ViewType, icon: FileText, label: 'ভর্তি ফরম', roles: ['SUPER_ADMIN', 'ADMIN'] },
      ]
    },
    {
      title: 'তথ্য ও রিপোর্ট',
      items: [
        { view: 'NOTICE' as ViewType, icon: Bell, label: 'নোটিশ বোর্ড', roles: ['SUPER_ADMIN', 'ADMIN'] },
        { view: 'DOCUMENTS' as ViewType, icon: ClipboardList, label: 'রেজুলেশন প্যাড', roles: ['SUPER_ADMIN', 'ADMIN'] },
        { view: 'REPORTS' as ViewType, icon: FileDown, label: 'রিপোর্ট ও এক্সপোর্ট', roles: ['SUPER_ADMIN', 'ADMIN'] },
        { view: 'BACKUP' as ViewType, icon: Database, label: 'ডাটা ব্যাকআপ', roles: ['SUPER_ADMIN'] },
      ]
    },
    {
      title: 'বিশেষ ফিচার',
      items: [
        { view: 'FAMILY_TREE' as ViewType, icon: GitMerge, label: 'বংশপরম্পরা চার্ট', roles: ['SUPER_ADMIN', 'ADMIN', 'USER'] },
        { view: 'BLOOD_DONORS' as ViewType, icon: Droplet, label: 'রক্তদাতা গ্রুপ', roles: ['SUPER_ADMIN', 'ADMIN', 'USER'] },
      ]
    },
    {
      title: 'সিস্টেম সেটিংস',
      items: [
        { view: 'SETTINGS' as ViewType, icon: SettingsIcon, label: 'সেটিংস', roles: ['SUPER_ADMIN'] },
      ]
    },
    {
      title: 'অতিরিক্ত তথ্য',
      items: [
        { view: 'ABOUT_US' as ViewType, icon: Info, label: 'আমাদের সম্পর্কে', roles: ['SUPER_ADMIN', 'ADMIN', 'USER'] },
      ]
    }
  ], []);

  const NavItem = ({ view, icon: Icon, label }: { view: ViewType, icon: any, label: string, key?: any }) => (
    <button
      onClick={() => handleNavigate(view)}
      className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-300 group ${
        activeView === view 
          ? 'bg-white/10 text-white shadow-inner' 
          : 'text-slate-200 hover:bg-white/5 hover:text-white'
      }`}
    >
      <Icon size={20} className={`transition-transform duration-300 ${activeView === view ? 'text-yellow-500 scale-110' : 'text-yellow-500/80 group-hover:text-yellow-500 group-hover:scale-110'}`} />
      <span className="font-medium text-sm tracking-wide hidden md:block">{label}</span>
      <span className="font-medium text-sm tracking-wide md:hidden">{label}</span>
    </button>
  );

  if (isAuthLoading || authError) {
    return (
      <div className="min-h-screen bg-[#143d27] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-6 max-w-sm w-full text-center">
          {!authError ? (
            <>
              <div className="relative">
                <div className="w-24 h-24 bg-white/5 rounded-full border-4 border-white/10 border-t-yellow-500 animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg overflow-hidden border-2 border-yellow-500/30">
                    {logo ? <img src={logo} className="w-full h-full object-cover" /> : <ShieldCheck className="text-[#143d27]" size={32} />}
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <h1 className="text-yellow-500 font-bold text-2xl font-bengali">আপন ফাউন্ডেশন</h1>
                  <p className="text-white/60 text-xs font-bengali uppercase tracking-widest">মানবসেবায় আমরা</p>
                </div>
                <p className="text-slate-300 text-sm font-bengali animate-pulse">অ্যাপটি প্রস্তুত করা হচ্ছে...</p>
              </div>
              <div className={`transition-all duration-700 ${showForceProceed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <button 
                  onClick={() => setIsAuthLoading(false)}
                  className="text-xs text-slate-400 underline underline-offset-4 hover:text-slate-200 transition-colors"
                >
                  বেশি সময় লাগলে এখানে ক্লিক করুন
                </button>
              </div>
            </>
          ) : (
            <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl space-y-4 animate-fade-in">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto text-red-500">
                <AlertTriangle size={24} />
              </div>
              <div className="space-y-2">
                <h2 className="text-white font-bold text-lg font-bengali">অপ্রত্যাশিত সমস্যা!</h2>
                <p className="text-red-200/70 text-xs leading-relaxed font-bengali">{authError}</p>
              </div>
              <div className="pt-2 flex flex-col gap-2">
                <button 
                  onClick={() => window.location.reload()}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-xl text-sm transition-colors"
                >
                  পুনরায় চেষ্টা করুন
                </button>
                <button 
                  onClick={() => logout()}
                  className="w-full bg-white/5 hover:bg-white/10 text-white/70 py-2 rounded-xl text-xs transition-colors"
                >
                  অন্য অ্যাকাউন্ট দিয়ে লগইন করুন
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const publicViews: ViewType[] = ['BLOOD_DONORS', 'HOMEPAGE', 'ABOUT_US', 'CONSTITUTION'];

  const isPublicMode = !currentUser && publicViews.includes(activeView);

  return (
    <div className={`min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-700 ${isEmbedMode ? 'bg-transparent' : ''}`}>
      
      {/* Sidebar - ALWAYS SHOW ON DESKTOP UNLESS EMBED MODE */}
      {!isEmbedMode && isMenuVisible && (
        <aside className={`fixed top-0 left-0 z-[200] h-screen w-64 md:w-72 bg-[#143d27] border-r border-[#1a4f33] p-5 flex flex-col transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} overflow-y-auto custom-scrollbar shadow-2xl`}>
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#143d27] overflow-hidden relative shadow-lg shrink-0 border-2 border-yellow-500/30">
                {logo ? <img src={logo} className="w-full h-full object-cover" /> : <Upload size={20} />}
                {!logo && <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleLogoUpload} accept="image/*" />}
              </div>
              <div>
                <h1 className="font-bold text-yellow-500 text-lg leading-tight tracking-wide">আপন ফাউন্ডেশন</h1>
                <p className="text-xs text-slate-300 font-medium mt-0.5">মানবসেবায় আমরা</p>
              </div>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400 hover:text-white">
              <X size={24} />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="মেনু খুঁজুন..." 
              value={menuSearch}
              onChange={(e) => setMenuSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-[#0f2e1d] border border-[#1a4f33] focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 rounded-lg text-sm text-white placeholder-slate-400 transition-all outline-none"
            />
          </div>

          {/* User Profile Hook */}
          {currentUser ? (
            <div className="mb-6 p-3 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <img 
                  src={currentUser.photoURL || 'https://via.placeholder.com/40'} 
                  className="w-9 h-9 rounded-lg border border-yellow-500/30"
                  alt="User"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-white truncate">{currentUser.displayName}</p>
                  <p className="text-[9px] text-yellow-500/70 font-black uppercase tracking-tighter">
                    {currentUser.role === 'SUPER_ADMIN' ? 'সুপার এডমিন' : currentUser.role === 'ADMIN' ? 'এডমিন' : 'সাধারণ ইউজার'}
                  </p>
                </div>
                <button 
                  onClick={() => logout()}
                  className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <button 
                onClick={() => {
                  // Direct to dashboard will trigger login screen
                  setActiveView('DASHBOARD');
                }}
                className="w-full flex items-center justify-center gap-2 bg-yellow-500 text-[#143d27] py-2.5 rounded-xl font-bold text-sm shadow-lg hover:bg-yellow-400 transition-all"
              >
                <LogIn size={18} /> লগইন করুন
              </button>
            </div>
          )}

          {/* Navigation Sections */}
          <nav className="space-y-6 flex-1 pb-4">
            {menuSections.map((section, idx) => {
              const filteredItems = section.items.filter(item => {
                const searchMatch = item.label.toLowerCase().includes(menuSearch.toLowerCase());
                const roleMatch = item.roles.includes(currentUser?.role || 'USER');
                return searchMatch && roleMatch;
              });
              
              if (filteredItems.length === 0) return null;
              
              return (
                <div key={idx} className="space-y-2">
                  <h3 className="text-yellow-500/90 text-xs font-bold tracking-wider mb-3 px-2">{section.title}</h3>
                  <div className="space-y-1">
                    {filteredItems.map((item, itemIdx) => (
                      <NavItem key={itemIdx} view={item.view} icon={item.icon} label={item.label} />
                    ))}
                  </div>
                  {idx < menuSections.length - 1 && <hr className="border-[#1a4f33] mt-6" />}
                </div>
              );
            })}
          </nav>

          {/* PWA Install Button & Copy Link Button Area */}
          <div className="mt-6 space-y-3 pt-6 border-t border-[#1a4f33]">
            {deferredPrompt && (
                <button
                  onClick={handleInstallClick}
                  className="w-full flex items-center justify-center gap-2 bg-yellow-500 text-[#143d27] py-2.5 px-4 rounded-lg shadow-lg hover:bg-yellow-400 transition-all font-bold text-sm"
                >
                  <Smartphone size={18} /> <span>অ্যাপ ইনস্টল করুন</span>
                </button>
            )}

            {!deferredPrompt && isInIframe && (
              <div className="space-y-2">
                <p className="text-[10px] text-slate-400 text-center px-2">ইনস্টল করতে অ্যাপটি নতুন ট্যাবে ওপেন করুন</p>
                <a
                  href={window.location.href.split('?')[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 py-2.5 px-4 rounded-lg hover:bg-yellow-500/20 transition-all font-bold text-sm"
                >
                  <ExternalLink size={18} /> <span>নতুন ট্যাবে খুলুন</span>
                </a>
              </div>
            )}
            
            <button 
              onClick={handleCopyLink}
              className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg transition-all font-bold text-sm ${
                linkCopied 
                  ? 'bg-green-600 text-white' 
                  : 'bg-[#0f2e1d] border border-[#1a4f33] text-slate-300 hover:bg-[#1a4f33] hover:text-white'
              }`}
            >
              {linkCopied ? <CheckCircle size={18} /> : <LinkIcon size={18} />} 
              <span className="hidden md:inline">{linkCopied ? 'লিংক কপি হয়েছে!' : 'লিংক শেয়ার করুন'}</span>
            </button>

            <button 
              onClick={handleCopyEmbedCode}
              className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg transition-all font-bold text-sm ${
                embedCodeCopied 
                  ? 'bg-green-600 text-white' 
                  : 'bg-[#0f2e1d] border border-[#1a4f33] text-slate-300 hover:bg-[#1a4f33] hover:text-white'
              }`}
              title="অন্য ওয়েবসাইটে ব্যবহারের জন্য এমবেড কোড কপি করুন"
            >
              {embedCodeCopied ? <CheckCircle size={18} /> : <Code size={18} />} 
              <span className="hidden md:inline">{embedCodeCopied ? 'কোড কপি হয়েছে!' : 'এমবেড কোড কপি করুন'}</span>
            </button>
          </div>
        </aside>
      )}

      {/* Mobile Header - ALWAYS SHOW UNLESS EMBED MODE */}
      {!isEmbedMode && (
        <div className="md:hidden bg-[#143d27] p-4 flex items-center gap-4 shadow-lg sticky top-0 z-[150] border-b border-[#1a4f33]">
          <button 
            onClick={() => {
              setIsMenuVisible(true);
              setIsMobileMenuOpen(true);
            }} 
            className="p-1 bg-[#0f2e1d] rounded-lg text-white hover:bg-[#1a4f33] transition-colors border border-[#1a4f33]"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            {logo && <img src={logo} className="w-8 h-8 rounded-full object-cover border border-yellow-500/50" />}
            <span className="font-bold text-yellow-500 tracking-wide text-lg">আপন ফাউন্ডেশন</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={`flex-1 overflow-y-auto max-h-screen ${isEmbedMode ? 'p-0' : 'p-4 md:p-8'} ${(isMenuVisible && !isEmbedMode) ? 'md:ml-72' : ''}`}>
        <div className={isEmbedMode ? '' : 'max-w-6xl mx-auto space-y-8 relative'}>
          
          {/* Firestore Connection Warning */}
          {firestoreStatus && !firestoreStatus.success && (
            <div className="bg-white/80 backdrop-blur-sm border-l-4 border-amber-500 p-3 rounded-r-xl shadow-md mb-6 border border-amber-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                  <AlertTriangle size={18} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 text-xs">Cloud Sync Offline</h3>
                  <p className="text-slate-500 text-[10px] sm:text-xs">
                    রিয়েল-টাইম ডাটা সিঙ্ক হচ্ছে না। আপনার ইন্টারনেট সংযোগ নিশ্চিত করুন।
                    {firestoreStatus.error?.toLowerCase().includes('quota') && ' (সীমা অতিক্রম করেছে)'}
                  </p>
                </div>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-3 py-1.5 bg-amber-600 text-white text-[10px] font-bold rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-1"
                >
                  <RefreshCw size={12} className="animate-spin-slow" /> Refresh
                </button>
              </div>
            </div>
          )}
          
          {!isEmbedMode && !isMenuVisible && (
            <div className="w-full flex justify-start mb-2">
              <button 
                onClick={() => {
                  setIsMenuVisible(true);
                  if (window.innerWidth < 768) {
                    setIsMobileMenuOpen(true);
                  }
                }}
                className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-[11px] md:text-sm font-medium transition-colors"
              >
                <ArrowLeft size={14} /> মেনু বারে ফিরুন
              </button>
            </div>
          )}

          {/* Protected View Check */}
          {!currentUser && !publicViews.includes(activeView) && !isEmbedMode ? (
            <div className="animate-fade-in flex items-center justify-center min-h-[60vh]">
              <Login onLoginSuccess={() => {}} />
            </div>
          ) : (
            <>
              {activeView === 'HOMEPAGE' && (
                <div className="animate-fade-in">
                  <Homepage 
                    settings={appSettings} 
                    members={members} 
                    transactions={transactions} 
                    notices={notices} 
                    logoUrl={logo}
                    onNavigate={handleNavigate}
                  />
                </div>
              )}

              {activeView === 'DASHBOARD' && (
                <div className="animate-fade-in space-y-8">
                  <Dashboard transactions={transactions} onNavigate={handleNavigate} isEmbedMode={isEmbedMode} />
                </div>
              )}

              {activeView === 'CONSTITUTION' && (
                <div className="animate-fade-in">
                  <Constitution 
                    logoUrl={logo} 
                    sections={constitutionSections}
                    onUpdateSections={setConstitutionSections}
                    settings={appSettings}
                  />
                </div>
              )}

              {activeView === 'NOTICE' && (
                <div className="animate-fade-in">
                  <header className={`mb-6 ${isEmbedMode ? 'hidden' : ''}`}>
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">নোটিশ বোর্ড</h1>
                    <p className="text-slate-600">আনুষ্ঠানিক নোটিশ তৈরি করুন এবং সদস্যদের কাছে পাঠান।</p>
                  </header>
                  <NoticeBoard 
                    members={members} 
                    logoUrl={logo} 
                    settings={appSettings} 
                    notices={notices}
                    onSaveNotice={(n) => setNotices([n, ...notices])}
                    onDeleteNotice={(id) => setNotices(notices.filter(n => n.id !== id))}
                    isAdmin={isAdmin}
                  />
                </div>
              )}

              {activeView === 'MEMBERS' && (
                <div className="animate-fade-in">
                  <MemberDirectory 
                    members={members} 
                    onAddMember={(m) => setMembers([...members, m])}
                    onUpdateMember={(updatedMember) => setMembers(members.map(m => m.id === updatedMember.id ? updatedMember : m))}
                    onDeleteMember={(id) => setMembers(members.filter(m => m.id !== id))}
                    logoUrl={logo}
                    settings={appSettings}
                    isAdmin={isAdmin}
                  />
                </div>
              )}

              {activeView === 'IDCARD' && (
                <div className="animate-fade-in">
                  <header className={`mb-6 ${isEmbedMode ? 'hidden' : ''}`}>
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">আইডি কার্ড জেনারেটর</h1>
                    <p className="text-slate-600">সদস্যদের জন্য প্রফেশনাল আইডি কার্ড তৈরি করুন।</p>
                  </header>
                  <IDCardGenerator members={members} logoUrl={logo} settings={appSettings} />
                </div>
              )}

              {activeView === 'FORM' && (
                <div className="animate-fade-in">
                  <MemberForm logoUrl={logo} settings={appSettings} />
                </div>
              )}

              {activeView === 'DOCUMENTS' && (
                <div className="animate-fade-in">
                  <header className={`mb-6 ${isEmbedMode ? 'hidden' : ''}`}>
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">অফিসিয়াল ডকুমেন্টস</h1>
                    <p className="text-slate-600">প্যাড, রসিদ এবং ভাউচার তৈরি করুন।</p>
                  </header>
                  <DocumentsGenerator logoUrl={logo} settings={appSettings} />
                </div>
              )}

              {activeView === 'FAMILY_TREE' && (
                <div className="animate-fade-in">
                  <header className={`mb-6 ${isEmbedMode ? 'hidden' : ''}`}>
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">বংশপরম্পরা চার্ট — আপন ফাউন্ডেশন</h1>
                    <p className="text-slate-600">সদস্যদের বংশপরম্পরা এবং সম্পর্ক দেখুন।</p>
                  </header>
                  <FamilyTree 
                    members={familyMembers} 
                    setMembers={setFamilyMembers} 
                    logoUrl={logo}
                    settings={appSettings}
                  />
                </div>
              )}

              {activeView === 'BLOOD_DONORS' && (
                <div className={`animate-fade-in ${isPublicMode ? 'min-h-screen bg-white p-4 md:p-10' : ''}`}>
                  <BloodDonors 
                    donors={bloodDonors} 
                    setDonors={setBloodDonors} 
                    onDeleteDonor={async (id) => {
                      await deleteBloodDonor(id);
                      setBloodDonors(prev => prev.filter(d => d.id !== id));
                    }}
                    logoUrl={logo} 
                    settings={appSettings} 
                    onUpdateSettings={handleUpdateSettings}
                    isAdmin={isAdmin}
                    isPublic={isPublicMode}
                  />
                </div>
              )}

              {activeView === 'ABOUT_US' && (
                <div className="animate-fade-in">
                  <AboutUs logoUrl={logo} settings={appSettings} />
                </div>
              )}

              {activeView === 'SETTINGS' && (
                <div className="animate-fade-in">
                  <Settings 
                    settings={appSettings} 
                    onUpdateSettings={handleUpdateSettings} 
                    logoUrl={logo} 
                    onUpdateLogo={setLogo} 
                    isSuperAdmin={isSuperAdmin}
                  />
                </div>
              )}

              {activeView === 'FINANCE' && (
                <div className="animate-fade-in">
                  <FinanceManager 
                    transactions={transactions} 
                    members={members}
                    onAddTransaction={(t) => setTransactions([...transactions, t])}
                    onUpdateTransaction={(updated) => setTransactions(transactions.map(t => t.id === updated.id ? updated : t))}
                    onDeleteTransaction={(id) => setTransactions(transactions.filter(t => t.id !== id))}
                    logoUrl={logo}
                    settings={appSettings}
                  />
                </div>
              )}

              {activeView === 'REPORTS' && (
                <div className="animate-fade-in">
                  <header className={`mb-6 ${isEmbedMode ? 'hidden' : ''}`}>
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">ইনফোগ্রাফিক রিপোর্ট</h1>
                    <p className="text-slate-600">বিভিন্ন কার্যক্রমের রিপোর্ট তৈরি করুন এবং সোশ্যাল মিডিয়ায় শেয়ার করুন।</p>
                  </header>
                  <ActivityReports transactions={transactions} logoUrl={logo} settings={appSettings} />
                </div>
              )}

              {activeView === 'BACKUP' && !isEmbedMode && (
                <div className="animate-fade-in">
                  <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 p-8 max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold text-indigo-900 mb-6 flex items-center gap-2">
                      <Database className="text-blue-600" /> ডাটা ম্যানেজমেন্ট ও সেটিংস
                    </h2>
                    
                    <div className="space-y-8">
                      
                      {/* Blogger Integration Section */}
                      <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-xl border border-orange-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Globe className="w-20 h-20 text-orange-500" />
                        </div>
                        
                        <h3 className="font-bold text-xl text-orange-800 mb-3 flex items-center gap-2">
                          <Globe size={24} /> গুগল ব্লগারে যুক্ত করুন
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="text-sm text-slate-700 space-y-2">
                              <p className="font-bold mb-2">কীভাবে যুক্ত করবেন?</p>
                              <ul className="list-disc pl-5 space-y-1">
                                <li>প্রথমে এই অ্যাপটি <b>Netlify</b> বা <b>Vercel</b> এ হোস্ট করুন।</li>
                                <li>এরপর পাশের বাটন থেকে <b>Embed Code</b> কপি করুন।</li>
                                <li>ব্লগারের ড্যাশবোর্ডে <b>HTML View</b> তে পেস্ট করুন।</li>
                              </ul>
                            </div>

                            <div className="bg-white p-3 rounded-lg border border-orange-200 shadow-inner flex flex-col gap-3">
                              <p className="text-xs font-bold text-slate-400 uppercase">Embed Code Generator</p>
                              
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => setShowEmbedCode(!showEmbedCode)}
                                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-bold text-xs"
                                >
                                  {showEmbedCode ? <EyeOff size={14}/> : <Eye size={14}/>} {showEmbedCode ? 'কোড লুকান' : 'কোড দেখুন'}
                                </button>
                                <button 
                                  onClick={() => window.open(getEmbedUrl(), '_blank')}
                                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-100 hover:bg-blue-200 rounded text-blue-700 font-bold text-xs"
                                >
                                  <ExternalLink size={14}/> লাইভ প্রিভিউ
                                </button>
                              </div>

                              {showEmbedCode && (
                                <code className="text-[10px] md:text-xs font-mono bg-slate-100 p-2 rounded text-slate-600 break-all h-24 overflow-y-auto border border-slate-200">
                                  {`<iframe src="${getEmbedUrl()}" style="width:100%; height:800px; border:none; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);"></iframe>`}
                                </code>
                              )}

                              <button 
                                onClick={handleCopyEmbedCode}
                                className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg font-bold text-sm transition-all ${
                                  embedCodeCopied ? 'bg-green-600 text-white' : 'bg-orange-600 text-white hover:bg-orange-700'
                                }`}
                              >
                                {embedCodeCopied ? <CheckCircle size={16} /> : <Copy size={16} />}
                                {embedCodeCopied ? 'কপি হয়েছে!' : 'কোড কপি করুন'}
                              </button>
                            </div>
                        </div>
                      </div>

                      <hr className="border-slate-200" />

                      {/* Google Sheet Sync Section */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/3/30/Google_Sheets_logo_%282014-2020%29.svg" className="w-16 h-16" />
                        </div>
                        
                        <h3 className="font-bold text-lg text-green-800 mb-2 flex items-center gap-2">
                          <RefreshCw size={20} className={isSyncing ? "animate-spin" : ""} /> গুগল শিট থেকে ডাটা আনুন
                        </h3>
                        <p className="text-sm text-slate-600 mb-4">
                            আপনার গুগল শিটের <b>"Publish to Web"</b> লিংকটি (CSV ফরম্যাটে) নিচে পেস্ট করুন। অ্যাপটি অটোমেটিক সেখান থেকে সদস্যদের তথ্য নিয়ে আসবে।
                        </p>

                        <div className="flex gap-2">
                            <input 
                              type="text" 
                              placeholder="https://docs.google.com/spreadsheets/d/e/.../pub?output=csv"
                              value={sheetUrl}
                              onChange={(e) => setSheetUrl(e.target.value)}
                              className="flex-1 p-2 border border-green-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white"
                            />
                            <button 
                              onClick={handleSheetSync}
                              disabled={isSyncing}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                              {isSyncing ? 'লোড হচ্ছে...' : 'Sync'}
                            </button>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-2">
                            কলামের সিরিয়াল: নাম, মোবাইল, পরিষদ (Advisory/Executive/General), পদবী, NID, ঠিকানা, রক্তের গ্রুপ
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Export Section */}
                        <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-200">
                            <h3 className="font-bold text-lg text-indigo-800 mb-2 flex items-center gap-2">
                            <DownloadCloud size={20} /> ব্যাকআপ ডাউনলোড করুন
                            </h3>
                            <p className="text-xs text-slate-600 mb-4">
                            মোবাইল ফরম্যাট দেওয়ার আগে ব্যাকআপ ফাইলটি সেভ করে রাখুন।
                            </p>
                            <button 
                            onClick={handleExportData}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-blue-700 transition-colors w-full text-sm"
                            >
                            ডাউনলোড JSON
                            </button>
                        </div>

                        {/* Import Section */}
                        <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                            <h3 className="font-bold text-lg text-purple-800 mb-2 flex items-center gap-2">
                            <UploadCloud size={20} /> ব্যাকআপ রিস্টোর করুন
                            </h3>
                            <p className="text-xs text-slate-600 mb-4">
                            আপনার সেভ করা ব্যাকআপ JSON ফাইলটি এখানে আপলোড করুন।
                            </p>
                            
                            <input 
                            type="file" 
                            ref={fileInputRef}
                            onChange={handleImportData}
                            accept=".json"
                            className="hidden"
                            />
                            
                            <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-purple-700 transition-colors w-full text-sm"
                            >
                            আপলোড ফাইল
                            </button>
                        </div>
                      </div>

                      {importStatus && (
                        <div className={`p-3 rounded-lg flex items-center gap-2 ${importStatus.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {importStatus.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                        <span className="font-medium text-sm">{importStatus.msg}</span>
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </main>
      
      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-[190] md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}

export default App;