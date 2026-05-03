import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, Users, BookOpen, Banknote, Upload, Menu, X, Save, 
  DownloadCloud, UploadCloud, AlertTriangle, CheckCircle, PieChart, 
  Bell, Smartphone, FileText, Link as LinkIcon, RefreshCw, Database, 
  Globe, Code, Copy, Eye, EyeOff, ExternalLink, ArrowRight, Search, 
  Home, ClipboardList, FileDown, CreditCard, GitMerge, Droplet, Info, 
  Settings as SettingsIcon, ArrowLeft, LogOut, LogIn, User as UserIcon, ShieldCheck 
} from 'lucide-react';
import { 
  auth, AppUser, syncUserDocument, logout, handleRedirectResult, 
  getBloodDonors, addBloodDonor, deleteBloodDonor, 
  getAppSettingsFromFirestore, updateAppSettingsInFirestore, verifyConnection,
  getMembers, updateMember, deleteMember,
  getTransactions, updateTransaction, deleteTransaction,
  getNotices, updateNotice, deleteNotice,
  getConstitution, updateConstitutionSection
} from './services/firebase';
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

import { BrandText, BrandNameEn } from './components/BrandText';

import { compressImage } from './lib/imageUtils';
import { generateDeepLink } from './lib/urlUtils';

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
        intro: '"আপন ফাউন্ডেশন" একটি অরাজনৈতিক ও অলাভজনক সামাজিক সংগঠন। এটি মূলত মানবিক সহায়তা, সমাজ সংস্কার এবং তৃণমূল পর্যায়ের মানুষদের জীবনমান উন্নয়নে কাজ করে। সংগঠনের প্রধান কার্যালয় বালীগাঁও, অষ্টগ্রাম এ অবস্থিত। আমাদের লক্ষ্য একটি আদর্শ ও বৈষম্যমুক্ত সমাজ গঠন করা।',
        slogan: 'সেবাই আমাদের পরম ধর্ম',
        registration: 'প্রক্রিয়াধীন',
        bloodDonorBanner: '',
        bloodDonorDescription: 'রক্তদান জীবন বাঁচায় - আপন ফাউন্ডেশনের মাধ্যমে রক্তদাতা খুঁজুন বা নিবন্ধন করুন।'
      },
      socialLinks: {
        facebook: '',
        whatsapp: '',
        messenger: '',
        instagram: '',
        twitter: ''
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
  
  const publicViews: ViewType[] = ['BLOOD_DONORS', 'HOMEPAGE', 'ABOUT_US', 'CONSTITUTION', 'MEMBERS', 'REPORTS'];
  const isPublicMode = !currentUser && publicViews.includes(activeView);

  // Handle deep links and initial view
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view') as ViewType;
    if (viewParam && publicViews.includes(viewParam)) {
      setActiveView(viewParam);
    }
  }, []);

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
        // Fetch App Settings
        const settings = await getAppSettingsFromFirestore();
        if (settings) {
          setAppSettings(prev => ({ ...prev, ...settings }));
        }

        // Fetch Members (Now Public)
        const fbMembers = await getMembers();
        if (fbMembers.length > 0) setMembers(fbMembers);

        // Fetch Public Notices
        const fbNotices = await getNotices();
        if (fbNotices.length > 0) setNotices(fbNotices);

        // Fetch Constitution (Public)
        const fbConstitution = await getConstitution();
        if (fbConstitution.length > 0) {
          setConstitutionSections(fbConstitution);
        }
      }
    };
    initApp();
  }, []);

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN';
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  // Admin Data Sync
  useEffect(() => {
    const fetchAdminData = async () => {
      if (!currentUser || !isAdmin) return;

      try {
        // Fetch Transactions (Admin Only)
        const fbTransactions = await getTransactions();
        if (fbTransactions.length > 0) setTransactions(fbTransactions);
      } catch (e) {
        console.error("Admin data fetch failed:", e);
      }
    };
    fetchAdminData();
  }, [currentUser, isAdmin]);

  // Foundation Data Persistence Handlers
  const handleAddMember = async (member: Member) => {
    setMembers([...members, member]);
    await updateMember(member.id, member);
  };

  const handleUpdateMember = async (updatedMember: Member) => {
    setMembers(members.map(m => m.id === updatedMember.id ? updatedMember : m));
    await updateMember(updatedMember.id, updatedMember);
  };

  const handleDeleteMember = async (id: string) => {
    setMembers(members.filter(m => m.id !== id));
    await deleteMember(id);
  };

  const handleAddTransaction = async (transaction: Transaction) => {
    setTransactions([...transactions, transaction]);
    await updateTransaction(transaction.id, transaction);
  };

  const handleUpdateTransaction = async (updated: Transaction) => {
    setTransactions(transactions.map(t => t.id === updated.id ? updated : t));
    await updateTransaction(updated.id, updated);
  };

  const handleDeleteTransaction = async (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
    await deleteTransaction(id);
  };

  const handleSaveNotice = async (notice: Notice) => {
    setNotices([notice, ...notices]);
    await updateNotice(notice.id, notice);
  };

  const handleDeleteNotice = async (id: string) => {
    setNotices(notices.filter(n => n.id !== id));
    await deleteNotice(id);
  };

  const handleUpdateConstitution = async (sections: ConstitutionSection[]) => {
    setConstitutionSections(sections);
    // Sync each section
    for (const section of sections) {
      await updateConstitutionSection(section.id, section);
    }
  };

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
    const url = generateDeepLink(activeView);
    navigator.clipboard.writeText(url);
    
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const getEmbedUrl = () => {
    return generateDeepLink(activeView, { mode: 'embed' });
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

  // --- Dynamic Meta Tags for SEO/Social Sharing ---
  useEffect(() => {
    const updateMetaTags = () => {
      const getTag = (selector: string, attr: string, val: string) => {
        let el = document.querySelector(selector);
        if (!el) {
          el = document.createElement('meta');
          if (selector.includes('property')) el.setAttribute('property', val);
          else el.setAttribute('name', val);
          document.head.appendChild(el);
        }
        return el;
      };

      const ogTitle = getTag('meta[property="og:title"]', 'property', 'og:title');
      const ogImage = getTag('meta[property="og:image"]', 'property', 'og:image');
      const ogDesc = getTag('meta[property="og:description"]', 'property', 'og:description');
      const ogUrl = getTag('meta[property="og:url"]', 'property', 'og:url');
      
      const twTitle = getTag('meta[name="twitter:title"]', 'name', 'twitter:title');
      const twImage = getTag('meta[name="twitter:image"]', 'name', 'twitter:image');
      const twDesc = getTag('meta[name="twitter:description"]', 'name', 'twitter:description');

      let siteTitle = appSettings.organization.name;
      let siteDesc = appSettings.organization.slogan;
      let siteImage = logo || '/logo.png';
      
      if (activeView === 'BLOOD_DONORS') {
        siteTitle = `রক্তদাতা সেবা - ${appSettings.organization.name}`;
        siteDesc = appSettings.organization.bloodDonorDescription || 'রক্তদান জীবন বাঁচায় - আপন ফাউন্ডেশনের মাধ্যমে রক্তদাতা খুঁজুন বা নিবন্ধন করুন।';
        if (appSettings.organization.bloodDonorBanner) {
          siteImage = appSettings.organization.bloodDonorBanner;
        }
      } else if (activeView === 'ABOUT_US') {
        siteTitle = `আমাদের সম্পর্কে - ${appSettings.organization.name}`;
      }
      
      const currentUrl = generateDeepLink(activeView);

      ogTitle.setAttribute('content', siteTitle);
      ogImage.setAttribute('content', siteImage);
      ogDesc.setAttribute('content', siteDesc);
      ogUrl.setAttribute('content', currentUrl);

      twTitle.setAttribute('content', siteTitle);
      twImage.setAttribute('content', siteImage);
      twDesc.setAttribute('content', siteDesc);
      
      document.title = siteTitle;
    };
    
    updateMetaTags();
  }, [activeView, appSettings, logo]);

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

const [constitutionSections, setConstitutionSections] = useState<ConstitutionSection[]>(() => {
    const defaultConstitution: ConstitutionSection[] = [
      {
        id: 'intro',
        title: 'ভূমিকা ও পরিচয়',
        content: `বিসমিল্লাহির রাহমানির রাহিম

ভূমিকা:
মানুষ মানুষের জন্য, জীবন জীবনের জন্য—এই মহান ব্রতকে সামনে রেখে আমাদের পথচলা। সমাজ ও মানবতার কল্যাণে নিবেদিত একদল উদ্যমী তরুণের প্রচেষ্টায় "আপন ফাউন্ডেশন" প্রতিষ্ঠিত হয়েছে। আমাদের চারপাশে ছড়িয়ে থাকা সুবিধাবঞ্চিত, অসহায় ও দরিদ্র জনগোষ্ঠীর মুখে হাসি ফোটানো এবং একটি শিক্ষিত, সুস্থ ও নৈতিকতাসম্পন্ন সমাজ বিনির্মাণই আমাদের স্বপ্ন। কিশোরগঞ্জ জেলার অষ্টগ্রাম উপজেলার বালীগাঁও গ্রাম থেকে এই ক্ষুদ্র প্রয়াস শুরু হলেও আমাদের লক্ষ্য সুদূরপ্রসারী। এই গঠনতন্ত্রটি ফাউন্ডেশনের কার্যক্রম সুশৃঙ্খলভাবে পরিচালনার একটি দিকনির্দেশনা মাত্র। মহান আল্লাহ তায়ালা আমাদের এই মহৎ উদ্যোগকে কবুল করুন। আমিন।

সংকলন ও সম্পাদনায়: মুহাম্মদ উজ্জল মিয়া
পরামর্শ ক্রমে: আব্দুল জিহাদ (প্রধান উদ্যোক্তা ও প্রতিষ্ঠাতা উপদেষ্টা)

মিশন ও ভিশন:
মিশন (MISSION):
১. সমাজের অবহেলিত, দুস্থ ও সুবিধাবঞ্চিত মানুষের মৌলিক অধিকার নিশ্চিত করতে নিরলসভাবে কাজ করা।
২. মানসম্মত শিক্ষা ও স্বাস্থ্যসেবা নিশ্চিতকল্পে টেকসই প্রকল্প গ্রহণ ও বাস্তবায়ন।
৩. বেকারত্ব দূরীকরণে যুবসমাজকে কারিগরি প্রশিক্ষণ প্রদান ও কর্মসংস্থান সৃষ্টি করা।
৪. যেকোনো প্রাকৃতিক দুর্যোগ ও মহামারিকালীন সময়ে ক্ষতিগ্রস্তদের পাশে দাঁড়ানো এবং পুনর্বাসনে সহায়তা করা।

ভিশন (VISION):
একটি দারিদ্র্যমুক্ত, বৈষম্যহীন, শিক্ষিত এবং মানবিক মূল্যবোধসম্পন্ন আদর্শ সমাজ গঠন করা, যেখানে প্রতিটি মানুষ তার ন্যায্য অধিকার ও মর্যাদা নিয়ে বাঁচতে পারবে।`
      },
      {
        id: 'chapter1',
        title: 'প্রথম অধ্যায়: পরিচয় ও পরিধি',
        content: `■ ধারা ১: নামকরণ
এই ফাউন্ডেশনটি "আপন ফাউন্ডেশন" নামে পরিচিত ও অভিহিত হবে। ইংরেজিতে একে "Apon Foundation" বলা হবে।

■ ধারা ২: প্রতিষ্ঠা
ফাউন্ডেশনটি ২০২৫ খ্রিস্টাব্দের ৪ঠা এপ্রিল তারিখে প্রতিষ্ঠিত হয়েছে।

■ ধারা ৩: প্রকৃতি
এটি একটি সম্পূর্ণ অলাভজনক, অরাজনৈতিক, অসাম্প্রদায়িক, স্বেচ্ছাসেবী ও সমাজকল্যাণমূলক ফাউন্ডেশন হিসেবে গণ্য হবে।

■ ধারা ৪: প্রধান কার্যালয়
ফাউন্ডেশনের প্রধান কার্যালয় বাংলাদেশের কিশোরগঞ্জ জেলার অষ্টগ্রাম উপজেলার বালীগাঁও গ্রামে অবস্থিত। প্রয়োজনে কার্যনির্বাহী পরিষদের অনুমোদনক্রমে দেশের অভ্যন্তরে বা বাইরে শাখা কার্যালয় স্থাপন করা যাবে।

■ ধারা ৫: কার্য এলাকা
প্রাথমিকভাবে ফাউন্ডেশনের কার্য এলাকা অষ্টগ্রাম উপজেলা এবং লাখাই উপজেলাব্যাপী বিস্তৃত থাকবে। তবে প্রয়োজনে কার্যনির্বাহী পরিষদের সিদ্ধান্তক্রমে বাংলাদেশের যেকোনো অঞ্চলে অথবা বিশ্বব্যাপী এর কার্যক্রম সম্প্রসারণ করা যাবে।

■ ধারা ৬: লক্ষ্য ও উদ্দেশ্য
আপন ফাউন্ডেশনের মূল লক্ষ্য ও উদ্দেশ্যসমূহ হবে নিম্নরূপ:
১. সমাজের দুস্থ, অসহায়, সুবিধাবঞ্চিত ও অনগ্রসর জনগোষ্ঠীর আর্থ-সামাজিক অবস্থার উন্নয়ন সাধন করা।
২. শিক্ষা, স্বাস্থ্যসেবা ও পুষ্টি বিষয়ে সচেতনতা বৃদ্ধি ও সহায়তা প্রদান করা।
৩. দারিদ্র্য বিমোচন ও কর্মসংস্থান সৃষ্টির লক্ষ্যে বিভিন্ন প্রকল্প গ্রহণ ও বাস্তবায়ন করা।
৪. নারী ও শিশু অধিকার প্রতিষ্ঠা এবং তাদের ক্ষমতায়নে সহায়তা করা।
৫. পরিবেশ সংরক্ষণ ও প্রাকৃতিক দুর্যোগে ক্ষতিগ্রস্তদের পুনর্বাসনে সহায়তা প্রদান করা।
৬. যুব সমাজকে সুসংগঠিত করে সমাজ উন্নয়নমূলক কর্মকাণ্ডে উৎসাহিত করা এবং দক্ষতা বৃদ্ধিমূলক প্রশিক্ষণ প্রদান করা।
৭. সামাজিক সম্প্রীতি, মানবতাবোধ ও নৈতিক মূল্যবোধ জাগ্রত করার জন্য কাজ করা।

■ ধারা ৭: লোগো, সিলমোহর ও প্যাড
আপন ফাউন্ডেশনের নির্দিষ্ট লোগো থাকবে যা ফাউন্ডেশনের পরিচয় বহন করবে। কার্যনির্বাহী পরিষদের সদস্যদের নির্দিষ্ট সিলমোহর থাকবে এবং ফাউন্ডেশনের সকল তথ্য আদান-প্রদান ফাউন্ডেশনের নিজস্ব প্যাডে হতে হবে।`
      },
      {
        id: 'chapter2',
        title: 'দ্বিতীয় অধ্যায়: সদস্য ভর্তি',
        content: `■ ধারা ৮: সদস্য পদের যোগ্যতা ও আবেদন
উপধারা ৮.১: আপন ফাউন্ডেশনের আদর্শ, উদ্দেশ্য ও লক্ষ্যগুলোর সাথে একমত পোষণকারী এবং ধারা ৮.২, ৮.৩ ও ৮.৪ এ বর্ণিত শর্তাবলি পূরণকারী যেকোনো ব্যক্তি সদস্য পদের জন্য আবেদন করতে পারবেন।
উপধারা ৮.২: সদস্য পদের আবেদনকারীকে অবশ্যই বাংলাদেশের নাগরিক হতে হবে।
উপধারা ৮.৩: আবেদনকারীর বিরুদ্ধে বাংলাদেশের প্রচলিত ফৌজদারি আইনে কোনো মামলা বা দণ্ডাদেশ থাকতে পারবে না।
উপধারা ৮.৪: আবেদনকারীকে ফাউন্ডেশনের নীতিমালা ও গঠনতন্ত্র সম্পূর্ণরূপে পড়ে তা মেনে চলার জন্য লিখিত বা মৌখিকভাবে অঙ্গীকারবদ্ধ হতে হবে।
উপধারা ৮.৫: নির্ধারিত আবেদনপত্র পূরণ করে কার্যনির্বাহী পরিষদের নিকট জমা দিতে হবে। আবেদনপত্রের সাথে আবেদনকারীকে তাঁর নাম, পিতার নাম, মাতার নাম, স্থায়ী ঠিকানা, বর্তমান ঠিকানা, রক্তের গ্রুপ, জাতীয় পরিচয়পত্র নম্বর এবং এক কপি পাসপোর্ট সাইজ ছবি অবশ্যই প্রদান করতে হবে। কার্যনির্বাহী পরিষদ আবেদন পর্যালোচনা করে সদস্যপদ প্রদান বা বাতিলের ক্ষমতা সংরক্ষণ করে।

■ ধারা ৯: নিয়মিত সদস্যের চাঁদা সংক্রান্ত নিয়মাবলি
উপধারা ৯.১: এই ধারাটি আপন ফাউন্ডেশনের নিয়মিত সদস্যদের জন্য প্রযোজ্য। আজীবন সদস্যগণ ধারা ১২ অনুযায়ী এককালীন অর্থ প্রদানের মাধ্যমে এই ধারার অধীন নিয়মিত চাঁদা প্রদানে বাধ্য নন, তবে স্বেচ্ছায় অনুদান প্রদান করতে পারবেন।
উপধারা ৯.২: নিয়মিত প্রত্যেক সদস্যকে নিয়মিতভাবে ফাউন্ডেশনের তহবিলে চাঁদা প্রদান করতে হবে।
উপধারা ৯.৩: চাঁদা প্রতি তিন (৩) মাস অন্তর প্রদেয়।
উপধারা ৯.৪: প্রতি তিন মাসের জন্য সর্বনিম্ন চাঁদার পরিমাণ নির্ধারণ করা হয়েছে ২০০ (দুইশত) টাকা।
উপধারা ৯.৫: সদস্যগণ স্বেচ্ছায় সর্বনিম্ন হারের অধিক যেকোনো পরিমাণ চাঁদা প্রদান করতে পারবেন, এক্ষেত্রে কোনো সর্বোচ্চ সীমারেখা নেই।
উপধারা ৯.৬: নির্ধারিত সময়ের মধ্যে চাঁদা পরিশোধে ব্যর্থ হলে সদস্য সাময়িকভাবে "অনিয়মিত" বলে গণ্য হবেন। তবে পরবর্তী যেকোনো তারিখে সম্পূর্ণ বকেয়া চাঁদা পরিশোধ সাপেক্ষে তিনি পুনরায় "নিয়মিত" সদস্যের মর্যাদা লাভ করতে পারবেন।
উপধারা ৯.৭: যদি কোনো নিয়মিত সদস্য একটানা বা পরপর তিনবার (অর্থাৎ ৯ মাস) নির্ধারিত সময়ের মধ্যে চাঁদা প্রদানে ব্যর্থ হন, তবে কার্যনির্বাহী পরিষদ উক্ত সদস্যের সদস্যপদ পর্যালোচনা করবে এবং আলোচনা সাপেক্ষে সদস্যপদ বাতিলের বিষয়ে চূড়ান্ত সিদ্ধান্ত গ্রহণ করার ক্ষমতা সংরক্ষণ করবে।

■ ধারা ১০: সদস্য অধিকার ও কর্তব্য
উপধারা ১০.১: ফাউন্ডেশনের সকল সাধারণ সদস্য সাধারণ সভায় অংশগ্রহণ করতে পারবেন।
উপধারা ১০.২: যে সকল সদস্য ধারা ৯ অনুযায়ী নিয়মিতভাবে ত্রৈমাসিক চাঁদা প্রদান করবেন অথবা ধারা ১২ অনুযায়ী আজীবন সদস্য হিসেবে এককালীন নির্ধারিত অর্থ প্রদান করেছেন এবং ফাউন্ডেশনের কার্যক্রমে সক্রিয় থাকবেন, তারাই এই নীতিমালার অধীনে "নিয়মিত সদস্য" হিসেবে গণ্য হবেন।
উপধারা ১০.৩: কেবলমাত্র নিয়মিত সদস্যগণ (ধারা ১০.২ অনুযায়ী) কার্যনির্বাহী পরিষদের নির্বাচনী কার্যক্রমে (যেমন: নির্বাচনে প্রার্থী হওয়া এবং ভোট প্রদান) অংশগ্রহণের অধিকার রাখেন।
উপধারা ১০.৪: সকল সদস্য ফাউন্ডেশনের সুনাম ও শৃঙ্খলা বজায় রাখতে সচেষ্ট থাকবেন এবং ফাউন্ডেশনের নীতিমালা মেনে চলবেন।

■ ধারা ১১: সদস্যপদ সংক্রান্ত বিবিধ
উপধারা ১১.১: কার্যনির্বাহী পরিষদ প্রয়োজনে এই নীতিমালার সংশোধন, সংযোজন বা পরিমার্জন করতে পারবে।
উপধারা ১১.২: সদস্যপদ সংক্রান্ত যেকোনো বিষয়ে কার্যনির্বাহী পরিষদের সিদ্ধান্তই চূড়ান্ত বলে গণ্য হবে।

■ ধারা ১২: আজীবন সদস্যপদ
উপধারা ১২.১: কোনো ব্যক্তি আপন ফাউন্ডেশনের আজীবন সদস্যপদ গ্রহণের জন্য আবেদন করতে পারবেন। আজীবন সদস্যপদ প্রাপ্তির জন্য ধারা ৮ অনুযায়ী সদস্য পদের যোগ্যতা পূরণ এবং আবেদন প্রক্রিয়া সম্পন্ন করতে হবে।
উপধারা ১২.২: আজীবন সদস্যপদ লাভ করার জন্য আবেদনকারীকে এককালীন ১,০০,০০০ (এক লক্ষ) টাকা ফাউন্ডেশনের তহবিলে প্রদান করতে হবে।
উপধারা ১২.৩: এই এককালীন অর্থ প্রদানের মাধ্যমে আজীবন সদস্যগণ ধারা ৯ অনুযায়ী নির্ধারিত নিয়মিত ত্রৈমাসিক চাঁদা প্রদান থেকে অব্যাহতি লাভ করবেন।
উপধারা ১২.৪: আজীবন সদস্যগণ এই নীতিমালার ধারা ১০.২ অনুযায়ী "নিয়মিত সদস্য" হিসেবে গণ্য হবেন এবং তাঁরা নিয়মিত সদস্যের সকল অধিকার (যেমন: নির্বাচনী কার্যক্রমে অংশগ্রহণ) আজীবনের জন্য ভোগ করবেন, যদি না তাঁদের সদস্যপদ অন্য কোনো কারণে বাতিল হয়।`
      },
      {
        id: 'chapter3',
        title: 'তৃতীয় অধ্যায়: কার্যনির্বাহী পরিষদ',
        content: `■ ধারা ১৩: কার্যনির্বাহী পরিষদের ভূমিকা ও গঠন
উপধারা ১৩.১: আপন ফাউন্ডেশনের সকল কার্যক্রম পরিচালনা, নীতি বাস্তবায়ন এবং লক্ষ্য অর্জনের জন্য একটি কার্যনির্বাহী পরিষদ গঠিত হবে।
উপধারা ১৩.২: কার্যনির্বাহী পরিষদ ফাউন্ডেশনের প্রধান নির্বাহী পরিষদ এবং ফাউন্ডেশনের নীতি ও গঠনতন্ত্র অনুযায়ী কার্য পরিচালনা করবে।
উপধারা ১৩.৩: কার্যনির্বাহী পরিষদের গঠন, নির্বাচন প্রক্রিয়া, ক্ষমতা এবং দায়িত্ব এই অধ্যায়ে বর্ণিত নীতি অনুযায়ী পরিচালিত হবে।

■ ধারা ১৪: কার্যনির্বাহী পরিষদের গঠন ও সদস্য সংখ্যা
উপধারা ১৪.১: কার্যনির্বাহী পরিষদ মোট ১৭ সদস্যের সমন্বয়ে গঠিত হবে। বিশেষ প্রয়োজনে ইতোপূর্বে গঠিত কার্যনির্বাহী পরিষদের সিদ্ধান্তক্রমে কার্যনির্বাহী পরিষদের সদস্য সংখ্যা বৃদ্ধি করা যাবে।
উপধারা ১৪.২: কার্যনির্বাহী পরিষদের পদধারীগণ নিম্নরূপ হবেন:
ক) সভাপতি (President), খ) সহ-সভাপতি (Vice-President), গ) সাধারণ সম্পাদক (General Secretary), ঘ) যুগ্ম সাধারণ সম্পাদক (Joint General Secretary), ঙ) দপ্তর সম্পাদক (Office Secretary), চ) অর্থ সম্পাদক (Finance Secretary), ছ) সহকারী অর্থ সম্পাদক (Assistant Finance Secretary), জ) সাংগঠনিক সম্পাদক (Organizing Secretary), ঝ) আইন তত্ত্ব ও প্রচার বিষয়ক সম্পাদক, ঞ) শিশু ও মহিলা বিষয়ক সম্পাদক, ট) শিক্ষা ও স্বাস্থ্য বিষয়ক সম্পাদক, ঠ) ক্রীড়া সম্পাদক, ড) সহকারী ক্রীড়া সম্পাদক, ঢ) প্রবাসী কল্যাণ বিষয়ক সম্পাদক, ণ) সহকারী প্রবাসী ও কল্যাণ বিষয়ক সম্পাদক, ত) কৃষি ও পরিবেশ বিষয়ক সম্পাদক, থ) সংস্কৃতি ও ধর্মবিষয়ক সম্পাদক।

■ ধারা ১৫: কার্যনির্বাহী পরিষদের সদস্য পদের যোগ্যতা ও নির্বাচন
উপধারা ১৫.১: কার্যনির্বাহী পরিষদের সদস্য পদের জন্য প্রার্থীকে আপন ফাউন্ডেশনের একজন নিয়মিত সদস্য হতে হবে এবং সদস্য হিসেবে কমপক্ষে এক বছর সময় অতিবাহিত করতে হবে। সভাপতি/সহ-সভাপতি/সাধারণ সম্পাদক/যুগ্ম সাধারণ সম্পাদক প্রার্থীর জন্য বয়স কমপক্ষে ২৫ বছর হতে হবে।
উপধারা ১৫.২: অন্য প্রার্থীদের বয়স কমপক্ষে ১৮ বছর হতে হবে।
উপধারা ১৫.৩: প্রার্থীর বিরুদ্ধে নৈতিক স্খলনজনিত বা বাংলাদেশের প্রচলিত ফৌজদারি আইনে কোনো গুরুতর মামলা বা দণ্ডাদেশ থাকতে পারবে না।
উপধারা ১৫.৪: কার্যনির্বাহী পরিষদ ফাউন্ডেশনের নিয়মিত সদস্যগণ কর্তৃক সরাসরি নির্বাচনের মাধ্যমে গঠিত হবে। নির্বাচন প্রক্রিয়া ফাউন্ডেশনের গঠনতন্ত্র অনুযায়ী নির্ধারিত হবে।
উপধারা ১৫.৫: নির্বাচনী বিধিমালা কার্যনির্বাহী পরিষদ কর্তৃক প্রণীত বা অনুমোদিত হবে।

■ ধারা ১৬: কার্যনির্বাহী পরিষদের কার্যকাল
উপধারা ১৬.১: কার্যনির্বাহী পরিষদের কার্যকাল হবে নির্বাচিত হওয়ার পর হতে পরবর্তী দুই বছর।
উপধারা ১৬.২: নতুন পরিষদ দায়িত্ব গ্রহণ না করা পর্যন্ত পূর্ববর্তী পরিষদ দায়িত্ব পালন করবে।

■ ধারা ১৭: কার্যনির্বাহী পরিষদের সাধারণ দায়িত্ব ও কার্যাবলি
- ফাউন্ডেশনের উদ্দেশ্য ও লক্ষ্য বাস্তবায়নের জন্য প্রয়োজনীয় সকল সিদ্ধান্ত গ্রহণ ও পদক্ষেপ নেওয়া।
- ফাউন্ডেশনের তহবিল সংগ্রহ, ব্যবস্থাপনা ও ব্যয় তত্ত্বাবধান করা।
- ফাউন্ডেশনের বার্ষিক কর্মপরিকল্পনা ও বাজেট প্রণয়ন এবং অনুমোদন করা।
- ফাউন্ডেশনের সকল নীতিমালা ও বিধিমালা প্রণয়ন, সংশোধন বা পরিমার্জন করা।
- ফাউন্ডেশনের কার্যক্রম সুষ্ঠুভাবে পরিচালনার জন্য বিভিন্ন উপ-পরিষদ গঠন করা।
- ফাউন্ডেশনের সকল সভার কার্যবিবরণী ও রেকর্ডপত্র সংরক্ষণ করা।
- ফাউন্ডেশনের কর্মকর্তা ও কর্মচারীদের নিয়োগ, দায়িত্ব বণ্টন এবং তত্ত্বাবধান করা।
- বার্ষিক সাধারণ সভায় ফাউন্ডেশনের কার্যক্রম ও আর্থিক প্রতিবেদন পেশ করা।
- ফাউন্ডেশনের পক্ষে সকল প্রকার চুক্তি ও বাধ্যবাধকতা সম্পাদন করা।

■ ধারা ১৮: সভাপতি (President)-এর দায়িত্ব
উপধারা ১৮.১: ফাউন্ডেশনের প্রধান হিসেবে নেতৃত্ব দেবেন, সকল সভায় সভাপতিত্ব করবেন, নীতিনির্ধারণে ভূমিকা রাখবেন, ফাউন্ডেশনকে প্রতিনিধিত্ব করবেন এবং প্রয়োজনীয় কাগজপত্রে স্বাক্ষর করবেন।
উপধারা ১৮.২: তিনি সভায় সমসংখ্যক ভোট (টাই) হওয়ার ক্ষেত্রে নির্ণায়ক ভোট (Casting Vote) প্রদান করতে পারবেন।

■ ধারা ১৯: সহ-সভাপতি (Vice-President)-এর দায়িত্ব
উপধারা ১৯.১: সভাপতি অনুপস্থিত থাকলে সভায় সভাপতিত্ব করবেন এবং সভাপতির কার্য সম্পাদনে সহায়তা করবেন।
উপধারা ১৯.২: সভাপতি কর্তৃক অর্পিত অন্যান্য দায়িত্ব পালন করবেন।

■ ধারা ২০: সাধারণ সম্পাদক (General Secretary)-এর দায়িত্ব
উপধারা ২০.১: ফাউন্ডেশনের প্রধান নির্বাহী কর্মকর্তা হিসেবে দৈনন্দিন কার্যক্রম পরিচালনা করবেন, সভা আহ্বান করবেন, সভার কার্যবিবরণী প্রস্তুত ও সংরক্ষণ করবেন এবং প্রতিবেদন তৈরি করবেন।
উপধারা ২০.২: তিনি ফাউন্ডেশনের পক্ষে আর্থিক ও দাপ্তরিক বিষয়ে স্বাক্ষরের অধিকার রাখবেন।

■ ধারা ২১: যুগ্ম সাধারণ সম্পাদক (Joint General Secretary)-এর দায়িত্ব
উপধারা ২১.১: সাধারণ সম্পাদককে তাঁর কার্য সম্পাদনে সহায়তা করবেন এবং তাঁর অনুপস্থিতিতে দায়িত্ব পালন করবেন।

■ ধারা ২২: দপ্তর সম্পাদক (Office Secretary)-এর দায়িত্ব
উপধারা ২২.১: কার্যালয়ের শৃঙ্খলা ও ব্যবস্থাপনা বজায় রাখা, দাপ্তরিক সরঞ্জাম রক্ষণাবেক্ষণ, চিঠিপত্র গ্রহণ ও বিতরণ, সভার নোটিশ প্রেরণ এবং গুরুত্বপূর্ণ ফাইল সংরক্ষণ করা।

■ ধারা ২৩: অর্থ সম্পাদক (Finance Secretary)-এর দায়িত্ব
উপধারা ২৩.১: ফাউন্ডেশনের সকল প্রকার আর্থিক হিসাব সংরক্ষণ করবেন, আয়-ব্যয়ের সঠিক হিসাব রাখবেন, বাজেট প্রণয়ন করবেন এবং ব্যাংক হিসাব পরিচালনা করবেন (সভাপতি বা সাধারণ সম্পাদকের সাথে যৌথ স্বাক্ষরে)।

■ ধারা ২৪: সহকারী অর্থ সম্পাদক (Assistant Finance Secretary)-এর দায়িত্ব
উপধারা ২৪.১: অর্থ সম্পাদককে সহায়তা করা এবং তাঁর অনুপস্থিতিতে দায়িত্ব পালন করা।

■ ধারা ২৫: সাংগঠনিক সম্পাদক (Organizing Secretary)-এর দায়িত্ব
উপধারা ২৫.১: সাংগঠনিক কাঠামো শক্তিশালী করা, সদস্য সংগ্রহে ভূমিকা রাখা এবং সদস্যদের মধ্যে সৌহার্দ্য ও ঐক্য বৃদ্ধি করা।

■ ধারা ২৬: আইন তত্ত্ব ও প্রচার বিষয়ক সম্পাদক-এর দায়িত্ব
উপধারা ২৬.১: আইনি বিষয়াদি দেখভাল করা, গঠনতন্ত্র সম্পর্কে সদস্যদের অবহিত রাখা এবং ফাউন্ডেশনের কার্যক্রম জনসমক্ষে প্রচার করা।

■ ধারা ২৭: শিশু ও মহিলা বিষয়ক সম্পাদক-এর দায়িত্ব
উপধারা ২৭.১: শিশু ও মহিলাদের উন্নয়নে বিশেষ প্রকল্প গ্রহণ, সচেতনতামূলক কর্মসূচি আয়োজন এবং তাদের অধিকার প্রতিষ্ঠায় কাজ করা।

■ ধারা ২৮: শিক্ষা ও স্বাস্থ্য বিষয়ক সম্পাদক-এর দায়িত্ব
উপধারা ২৮.১: শিক্ষা ও স্বাস্থ্য সংক্রান্ত প্রকল্প বাস্তবায়ন, বৃত্তি প্রদান এবং স্বাস্থ্য ক্যাম্প ও পুষ্টি সচেতনতা কর্মসূচি আয়োজন করা।

■ ধারা ২৯: ক্রীড়া সম্পাদক (Sports Secretary)-এর দায়িত্ব
উপধারা ২৯.১: ক্রীড়া প্রতিযোগিতা আয়োজন এবং সদস্যদের শারীরিক ও মানসিক বিকাশে ক্রীড়া কার্যক্রমে উৎসাহিত করা।

■ ধারা ৩০: সহকারী ক্রীড়া সম্পাদক-এর দায়িত্ব
উপধারা ৩০.১: ক্রীড়া সম্পাদককে সহায়তা করা।

■ ধারা ৩১: প্রবাসী কল্যাণ বিষয়ক সম্পাদক-এর দায়িত্ব
উপধারা ৩১.১: প্রবাসী সদস্যদের সাথে সার্বক্ষণিক যোগাযোগ রক্ষা করা এবং তাদের কল্যাণে ও অংশগ্রহণে বিভিন্ন উদ্যোগ নেওয়া।

■ ধারা ৩২: সহকারী প্রবাসী ও কল্যাণ বিষয়ক সম্পাদক-এর দায়িত্ব
উপধারা ৩২.১: প্রবাসী কল্যাণ বিষয়ক সম্পাদককে সহায়তা করা।

■ ধারা ৩৩: কৃষি ও পরিবেশ বিষয়ক সম্পাদক-এর দায়িত্ব
উপধারা ৩৩.১: কৃষি উন্নয়ন ও পরিবেশ সংরক্ষণে কার্যক্রম পরিচালনা, বৃক্ষরোপণ অভিযান পরিচালনা এবং পরিবেশ সচেতনতা সৃষ্টি করা।

■ ধারা ৩৪: সংস্কৃতি ও ধর্মবিষয়ক সম্পাদক-এর দায়িত্ব
উপধারা ৩৪.১: সাংস্কৃতিক অনুষ্ঠান আয়োজন, ধর্মীয় সম্প্রীতি রক্ষা এবং মানবিক ও নৈতিক মূল্যবোধ বৃদ্ধিতে কাজ করা।

■ ধারা ৩৫: সাধারণ সদস্যগণের দায়িত্ব
উপধারা ৩৫.১: কার্যনির্বাহী পরিষদের সভায় আমন্ত্রিত হলে সক্রিয়ভাবে অংশগ্রহণ করবেন এবং নিজ নিজ অর্পিত দায়িত্ব ও বিভাগীয় কার্য সুষ্ঠুভাবে সম্পাদন করবেন।

■ ধারা ৩৬: কার্যনির্বাহী পরিষদের সভা
উপধারা ৩৬.১: কার্যনির্বাহী পরিষদের নিয়মিত সভা প্রতি মাসের নির্ধারিত রবিবার রাত ৯ টায় প্রধান কার্যালয়ে অনুষ্ঠিত হবে।
উপধারা ৩৬.২: বিশেষ পরিস্থিতিতে সভা ভার্চুয়ালি অনুষ্ঠিত হতে পারবে।
উপধারা ৩৬.৩: সাধারণ সম্পাদক সভাপতির সাথে পরামর্শক্রমে সভার তারিখ, সময় ও স্থান নির্ধারণ করবেন এবং কমপক্ষে ৭ দিনের নোটিশে সদস্যদের সভা সম্পর্কে অবহিত করবেন।
উপধারা ৩৬.৪: জরুরি প্রয়োজনে, সভাপতি বা সাধারণ সম্পাদক যেকোনো সময় কার্যনির্বাহী পরিষদের সভা আহ্বান করতে পারবেন।
উপধারা ৩৬.৫: সভার কোরামে কমপক্ষে সভাপতি/সহ-সভাপতি এবং সাধারণ সম্পাদক/যুগ্ম সাধারণ সম্পাদক এবং অর্থ সম্পাদকসহ মোট ১০ জনের উপস্থিতি প্রয়োজন হবে।
উপধারা ৩৬.৬: সভার সকল সিদ্ধান্ত সাধারণ সংখ্যাগরিষ্ঠ ভোটে গৃহীত হবে। সভার কার্যবিবরণী লিপিবদ্ধ করতে হবে এবং পরবর্তী সভায় অনুমোদন করতে হবে।

■ ধারা ৩৭: সদস্য পদের অবসান, পদত্যাগ ও অপসারণ
উপধারা ৩৭.১: কোনো সদস্য লিখিতভাবে পদত্যাগপত্র জমা দিলে এবং তা গৃহীত হলে সদস্য পদের অবসান ঘটবে।
উপধারা ৩৭.২: যুক্তিসঙ্গত কারণ ছাড়া পরপর তিনটি সভায় অনুপস্থিত থাকলে সদস্যপদ বাতিলের সিদ্ধান্ত গ্রহণ করা যাবে।
উপধারা ৩৭.৩: ফাউন্ডেশনের স্বার্থ পরিপন্থী কাজ করলে তদন্ত সাপেক্ষে অপসারণ করা যাবে।

■ ধারা ৩৮: শূন্য পদ পূরণ
উপধারা ৩৮.১: কোনো পদ শূন্য হলে, অবশিষ্ট কার্যকালের জন্য কার্যনির্বাহী পরিষদ শূন্য পদে কোনো যোগ্য নিয়মিত সদস্যকে কো-অপ্ট (Co-opt) করতে পারবে।
উপধারা ৩৮.২: কো-অপ্টকৃত সদস্য মূল পরিষদের অবশিষ্ট মেয়াদের জন্য দায়িত্ব পালন করবেন অথবা উক্ত শূন্য পদের জন্য নির্বাচন অনুষ্ঠান করা যেতে পারে।

■ ধারা ৩৯: জবাবদিহিতা
উপধারা ৩৯.১: কার্যনির্বাহী পরিষদ তাদের সকল কাজের জন্য সাধারণ পরিষদের নিকট জবাবদিহি করতে বাধ্য থাকবে এবং বার্ষিক সাধারণ সভায় বার্ষিক প্রতিবেদন ও আর্থিক হিসাব পেশ করবে।

■ ধারা ৪০: নীতিমালা সংশোধন
উপধারা ৪০.১: এই নীতিমালা প্রয়োজন ও চাহিদার প্রেক্ষিতে সংশোধিত হতে পারে। তবে গুরুত্বপূর্ণ সংশোধনের ক্ষেত্রে সাধারণ পরিষদের অনুমোদন গ্রহণ করতে হবে।`
      },
      {
        id: 'chapter4',
        title: 'চতুর্থ অধ্যায়: অর্থনৈতিক ব্যবস্থাপনা নীতিমালা',
        content: `■ ধারা ৪১: তহবিলের উৎস
উপধারা ৪১.১: ফাউন্ডেশনের তহবিলের উৎসসমূহ নিম্নরূপ হবে:
ক) সদস্য ভর্তি ফি, ত্রৈমাসিক ও বার্ষিক চাঁদা।
খ) দেশি/বিদেশি ব্যক্তি, প্রতিষ্ঠান বা সংস্থার অনুদান (দেশের প্রচলিত আইন অনুসারে)।
গ) সরকারি/বেসরকারি প্রতিষ্ঠানের আর্থিক সহায়তা।
ঘ) ব্যাংক হিসাব বা MFS (বিকাশ, নগদ, রকেট ইত্যাদি) মাধ্যমে অনুদান গ্রহণ।
ঙ) বৈধ ও নীতিসম্মত অন্য কোনো উৎস।

■ ধারা ৪২: ব্যাংক ও MFS হিসাব পরিচালনা
উপধারা ৪২.১: তফসিলি ব্যাংকে ফাউন্ডেশনের নামে এক বা একাধিক হিসাব খোলা হবে।
উপধারা ৪২.২: কার্যনির্বাহী পরিষদের সিদ্ধান্তে MFS একাউন্ট খোলা যাবে।
উপধারা ৪২.৩: ব্যাংক হিসাব সভাপতি, সাধারণ সম্পাদক ও অর্থ সম্পাদক কর্তৃক যৌথভাবে পরিচালিত হবে।
উপধারা ৪২.৪: ব্যাংক লেনদেনে কমপক্ষে ২ জনের স্বাক্ষর থাকতে হবে (যাতে অর্থ সম্পাদকের স্বাক্ষর বাধ্যতামূলক)।
উপধারা ৪২.৫: MFS একাউন্টের অর্থ নির্দিষ্ট সময় পর পর মূল ব্যাংক হিসাবে জমা দিতে হবে।

■ ধারা ৪৩: বাজেট প্রণয়ন ও অনুমোদন
উপধারা ৪৩.১: অর্থ সম্পাদক প্রতি বছর বার্ষিক বাজেট প্রণয়ন করবেন।
উপধারা ৪৩.২: বাজেটে আয়-ব্যয়ের সুস্পষ্ট খাত উল্লেখ থাকবে এবং এটি কার্যনির্বাহী পরিষদ দ্বারা অনুমোদিত হতে হবে।
উপধারা ৪৩.৩: জরুরি প্রয়োজনে অতিরিক্ত বাজেট কার্যনির্বাহী পরিষদ দ্বারা অনুমোদিত হতে পারবে।

■ ধারা ৪৪: অর্থ ব্যয় প্রক্রিয়া ও অনুমোদন সীমা
উপধারা ৪৪.১: সকল ব্যয় বাজেট অনুযায়ী হবে। বাজেট বহির্ভূত ব্যয়ের ক্ষেত্রে পরিষদের অনুমোদন প্রয়োজন।
উপধারা ৪৪.২: সকল ব্যয়ের ভাউচার বা রসিদ সংরক্ষণ করতে হবে।
উপধারা ৪৪.৩: অনুমোদন সীমা: i) ৫০০/- টাকা পর্যন্ত: অর্থ সম্পাদকের একক অনুমোদন। ii) ২০০০/- টাকা পর্যন্ত: অর্থ সম্পাদক ও সাধারণ সম্পাদক/সভাপতির যৌথ অনুমোদন। iii) ২০০০/- টাকার ঊর্ধ্বে: সম্পূর্ণ কার্যনির্বাহী পরিষদের অনুমোদন।

■ ধারা ৪৫: হিসাব সংরক্ষণ
উপধারা ৪৫.১: অর্থ সম্পাদক আয়-ব্যয়ের হালনাগাদ হিসাব সহজবোধ্য পদ্ধতিতে রাখবেন। ভাউচার, ব্যাংক স্টেটমেন্ট ও MFS রেকর্ড যথাযথভাবে সংরক্ষণ করতে হবে।

■ ধারা ৪৬: নিরীক্ষা (Audit)
উপধারা ৪৬.১: প্রতি অর্থ বছরে অভ্যন্তরীণ অথবা বহিঃস্থ নিরীক্ষক দ্বারা ব্যাংক ও MFS হিসাবসহ সকল আর্থিক লেনদেন নিরীক্ষা করা হবে এবং প্রতিবেদন বার্ষিক সভায় পেশ করতে হবে।

■ ধারা ৪৭: আর্থিক প্রতিবেদন
উপধারা ৪৭.১: অর্থ সম্পাদক মাসিক বা ত্রৈমাসিক আয়-ব্যয় প্রতিবেদন পরিষদের নিকট পেশ করবেন এবং বার্ষিক প্রতিবেদন সাধারণ সভায় উপস্থাপন করবেন।

■ ধারা ৪৮: নগদ অর্থ ব্যবস্থাপনা
উপধারা ৪৮.১: বড় অঙ্কের লেনদেন ব্যাংক বা MFS-এর মাধ্যমে করতে হবে। দৈনন্দিন জরুরি ব্যয়ের জন্য ক্যাশ-ইন-হ্যান্ড হিসেবে সর্বোচ্চ ১০,০০০/- (দশ হাজার) টাকা নগদ রাখা যাবে।

■ ধারা ৪৯: তহবিল ব্যবহার নীতিমালা
উপধারা ৪৯.১: তহবিল শুধুমাত্র ফাউন্ডেশনের লক্ষ্য অর্জনে ও জনকল্যাণমূলক কাজে ব্যয় হবে। ব্যক্তিগত বা গোষ্ঠী স্বার্থে ব্যবহার সম্পূর্ণ নিষিদ্ধ।`
      },
      {
        id: 'chapter5',
        title: 'পঞ্চম অধ্যায়: উপদেষ্টা পরিষদ নীতিমালা',
        content: `■ ধারা ৫০: উপদেষ্টা পরিষদের ভূমিকা ও উদ্দেশ্য
উপধারা ৫০.১: উপদেষ্টা পরিষদের মূল ভূমিকা হলো ফাউন্ডেশনের কার্যক্রম পরিচালনা ও নীতি নির্ধারণে কার্যনির্বাহী পরিষদকে মূল্যবান পরামর্শ ও মতামত প্রদান করা। পরিষদ কার্যনির্বাহী পরিষদের সিদ্ধান্ত গ্রহণে সহায়তা করবে, তবে কোনো সিদ্ধান্ত এককভাবে চাপিয়ে দিতে পারবে না।

■ ধারা ৫১: উপদেষ্টা পরিষদের গঠন
উপধারা ৫১.১: উপদেষ্টা পরিষদ নিম্নরূপ সদস্যের সমন্বয়ে গঠিত হবে: ক) প্রধান উপদেষ্টা (Chief Advisor) - ১ জন খ) বিশেষ উপদেষ্টা (Special Advisors) - ২ জন গ) সাধারণ উপদেষ্টা (General Advisors) - ১০ জন

■ ধারা ৫২: সদস্য মনোনয়ন
উপধারা ৫২.১: উপদেষ্টা পরিষদের সদস্যগণ কার্যনির্বাহী পরিষদ কর্তৃক মনোনীত হবেন। মনোনীত সদস্যরা সমাজসেবা, শিক্ষা, স্বাস্থ্য, আইন অথবা প্রশাসনের যেকোনো ক্ষেত্রে উল্লেখযোগ্য অভিজ্ঞতা ও সুনাম সম্পন্ন ব্যক্তি হবেন।

■ ধারা ৫৩: উপদেষ্টা পরিষদের মেয়াদ
উপধারা ৫৩.১: উপদেষ্টা পরিষদের মেয়াদ সাধারণত কার্যনির্বাহী পরিষদের মেয়াদের সমান্তরাল (অর্থাৎ ২ বছর) হবে। নতুন কার্যনির্বাহী পরিষদ গঠিত হলে তারা পুনরায় উপদেষ্টা পরিষদ গঠন বা পূর্ববর্তী পরিষদকে বহাল রাখতে পারবে।

■ ধারা ৫৪: উপদেষ্টার পদত্যাগ ও অপসারণ
উপধারা ৫৪.১: যেকোনো উপদেষ্টা লিখিতভাবে পদত্যাগ করতে পারবেন। কোনো উপদেষ্টার ভূমিকা ফাউন্ডেশনের স্বার্থের পরিপন্থী বিবেচিত হলে কার্যনির্বাহী পরিষদ আলোচনা সাপেক্ষে ব্যবস্থা গ্রহণ করতে পারবে।`
      },
      {
        id: 'chapter6',
        title: 'ষষ্ঠ অধ্যায়: সভা সংক্রান্ত নীতিমালা',
        content: `■ ধারা ৫৫: বার্ষিক সাধারণ সভা (AGM)
উপধারা ৫৫.১: প্রতি বছর অন্তত একবার সাধারণ সভা অনুষ্ঠিত হবে। এই সভায় ফাউন্ডেশনের সকল নিয়মিত সদস্য অংশগ্রহণ করবেন। বার্ষিক প্রতিবেদন ও আর্থিক হিসাব এই সভায় অনুমোদিত হতে হবে।

■ ধারা ৫৬: বিশেষ সাধারণ সভা (EGM)
উপধারা ৫৬.১: জরুরি নীতিনির্ধারণী সিদ্ধান্ত বা গঠনতন্ত্র সংশোধনের প্রয়োজনে কার্যনির্বাহী পরিষদ বিশেষ সাধারণ সভা আহ্বান করতে পারবে।

■ ধারা ৫৭: সভার নোটিশ ও কোরাম
উপধারা ৫৭.১: সাধারণ সভার জন্য কমপক্ষে ১৫ দিন এবং বিশেষ সাধারণ সভার জন্য ৭ দিন আগে সদস্যদের লিখিত বা ডিজিটাল মাধ্যমে নোটিশ দিতে হবে।
উপধারা ৫৭.২: মোট নিয়মিত সদস্যের এক-তৃতীয়াংশ উপস্থিত থাকলে সভার কোরাম পূর্ণ হবে।`
      },
      {
        id: 'chapter7',
        title: 'সপ্তম অধ্যায়: নির্বাচন পরিচালনা বিধিমালা',
        content: `■ ধারা ৫৮: নির্বাচন কমিশন
উপধারা ৫৮.১: কার্যনির্বাহী পরিষদের মেয়াদ শেষ হওয়ার অন্তত ৬০ দিন আগে ৩ সদস্যের একটি নিরপেক্ষ নির্বাচন কমিশন গঠিত হবে। কমিশনের সদস্যগণ নির্বাচনে প্রার্থী হতে পারবেন না।

■ ধারা ৫৯: ভোটাধিকার ও প্রার্থীতা
উপধারা ৫৯.১: ধারা ১০.৩ অনুযায়ী কেবল নিয়মিত সদস্যগণই ভোট দিতে এবং প্রার্থী হতে পারবেন।

■ ধারা ৬০: ফলাফল ঘোষণা
উপধারা ৬০.১: নির্বাচন কমিশন সুষ্ঠুভাবে ভোট গ্রহণ সম্পন্ন করে ফলাফল ঘোষণা করবে এবং নবনির্বাচিত পরিষদের নিকট দায়িত্ব হস্তান্তরের প্রক্রিয়া তদারকি করবে।`
      },
      {
        id: 'chapter8',
        title: 'অষ্টম অধ্যায়: শৃঙ্খলা ও আচরণবিধি নীতিমালা',
        content: `■ ধারা ৬১: সদস্যদের আচরণবিধি
উপধারা ৬১.১: সকল সদস্যকে ফাউন্ডেশনের ভাবমূর্তি রক্ষা করে চলতে হবে। ব্যক্তিগত দ্বন্দ্বে ফাউন্ডেশনের কার্যক্রম ব্যাহত করা যাবে না।

■ ধারা ৬২: সামাজিক যোগাযোগ মাধ্যম পরিচালনা
উপধারা ৬২.১: ফাউন্ডেশনের ফেসবুক পেজ, গ্রুপ বা হোয়াটসঅ্যাপ গ্রুপে কোনো প্রকার অশালীন, রাজনৈতিক বা সাম্প্রদায়িক পোস্ট করা সম্পূর্ণ নিষিদ্ধ।

■ ধারা ৬৩: শাস্তিমূলক ব্যবস্থা
উপধারা ৬৩.১: কোনো সদস্য গঠনতন্ত্র পরিপন্থী কাজ করলে কার্যনির্বাহী পরিষদ তাঁকে কারণ দর্শানোর নোটিশ প্রদান করবে এবং প্রয়োজনে সদস্যপদ স্থগিত বা বাতিল করতে পারবে।`
      },
      {
        id: 'chapter9',
        title: 'নবম অধ্যায়: গঠনতন্ত্র সংশোধন ও বিলুপ্তি',
        content: `■ ধারা ৬৪: গঠনতন্ত্র সংশোধন
উপধারা ৬৪.১: গঠনতন্ত্রের কোনো ধারা পরিবর্তন বা পরিমার্জন করতে হলে সাধারণ সভায় দুই-তৃতীয়াংশ সদস্যের সমর্থন প্রয়োজন হবে।

■ ধারা ৬৫: ফাউন্ডেশনের বিলুপ্তি
উপধারা ৬৫.১: যদি বিশেষ কারণে ফাউন্ডেশনটি বিলুপ্ত করতে হয়, তবে সাধারণ সভায় উপস্থিত ৭৫% সদস্যের সম্মতিতে তা করা যাবে।
উপধারা ৬৫.২: বিলুপ্তির পর ফাউন্ডেশনের সকল সম্পদ সমজাতীয় কোনো সেবামূলক সংস্থায় হস্তান্তর করতে হবে।`
      },
      {
        id: 'chapter10',
        title: 'দশম অধ্যায়: আইনি প্রক্রিয়া ও বিধিবদ্ধ ঘোষণা',
        content: `■ ধারা ৬৬: আইনি সুরক্ষা
উপধারা ৬৬.১: আপন ফাউন্ডেশনের সকল কার্যক্রম বাংলাদেশের প্রচলিত আইন অনুযায়ী পরিচালিত হবে।

■ ধারা ৬৭: মামলা পরিচালনা
উপধারা ৬৭.১: কোনো প্রকার আইনি জটিলতা বা মামলার ক্ষেত্রে ফাউন্ডেশনের পক্ষে সভাপতি ও সাধারণ সম্পাদক প্রতিনিধিত্ব করবেন।

■ ধারা ৬৮: আইনি পরামর্শক
উপধারা ৬৮.১: প্রয়োজনে কার্যনির্বাহী পরিষদ একজন আইনি পরামর্শক নিয়োগ করতে পারবে।

■ ধারা ৬৯: নথিপত্র সংরক্ষণ
উপধারা ৬৯.১: সকল আইনি দলিলপত্র এবং নিবন্ধনের কপি দপ্তর সম্পাদকের হেফাজতে থাকবে।

■ ধারা ৭০: বিরোধ নিষ্পত্তি
উপধারা ৭০.১: ফাউন্ডেশনের অভ্যন্তরীণ যেকোনো বিরোধ বা সমস্যা প্রথমে কার্যনির্বাহী পরিষদের মাধ্যমে আলোচনার ভিত্তিতে মিমাংসা করা হবে।

■ ধারা ৭১: চূড়ান্ত ক্ষমতা
উপধারা ৭১.১: গঠনতন্ত্রে উল্লেখ নেই এমন যেকোনো বিষয়ে সিদ্ধান্ত গ্রহণের চূড়ান্ত ক্ষমতা কার্যনির্বাহী পরিষদ সংরক্ষণ করবে।

■ ধারা ৭২: বিধিবদ্ধ ঘোষণা
উপধারা ৭২.১: এই গঠনতন্ত্রটি আপন ফাউন্ডেশনের সকল কার্যক্রমের প্রধান এবং চূড়ান্ত নির্দেশিকা হিসেবে গণ্য হবে। এটি ২০২৫ সালের ৪ঠা এপ্রিল তারিখ থেকে কার্যকর বলে ঘোষিত হলো।`
      }
    ];

    const saved = localStorage.getItem('foundation_constitution');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // If the saved version is the old short one, we upgrade it to the new default
        if (Array.isArray(parsed) && parsed.length < defaultConstitution.length) {
           return defaultConstitution;
        }
        return parsed;
      } catch (e) {
        console.error("Error parsing constitution:", e);
      }
    }
    return defaultConstitution;
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
      reader.onloadend = async () => {
        try {
          const compressed = await compressImage(reader.result as string, 400, 400, 0.8);
          setLogo(compressed);
        } catch (err) {
          console.error("Logo compression failed", err);
          setLogo(reader.result as string);
        }
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
          ? 'bg-slate-100 text-slate-900 shadow-sm' 
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <Icon size={20} className={`transition-transform duration-300 ${activeView === view ? 'text-yellow-600 scale-110' : 'text-slate-400 group-hover:text-yellow-600 group-hover:scale-110'}`} />
      <span className="font-bold text-sm tracking-wide hidden md:block"><BrandText text={label} /></span>
      <span className="font-bold text-sm tracking-wide md:hidden"><BrandText text={label} /></span>
    </button>
  );

  if ((isAuthLoading || authError) && !isPublicMode) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-6 max-w-sm w-full text-center">
          {!authError ? (
            <>
              <div className="relative">
                <div className="w-24 h-24 bg-slate-200/50 rounded-full border-4 border-slate-200 border-t-yellow-500 animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg overflow-hidden border-2 border-yellow-500/30">
                    {logo ? <img src={logo} className="w-full h-full object-cover" /> : <ShieldCheck className="text-slate-900" size={32} />}
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <h1 className="text-yellow-600 font-bold text-2xl font-bengali"><BrandText text="আপন ফাউন্ডেশন" /></h1>
                  <p className="text-slate-500 text-xs font-bengali uppercase tracking-widest">মানবসেবায় আমরা</p>
                </div>
                <p className="text-slate-600 text-sm font-bengali animate-pulse">অ্যাপটি প্রস্তুত করা হচ্ছে...</p>
              </div>
              <div className={`transition-all duration-700 ${showForceProceed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <button 
                  onClick={() => setIsAuthLoading(false)}
                  className="text-xs text-slate-400 underline underline-offset-4 hover:text-slate-600 transition-colors"
                >
                  বেশি সময় লাগলে এখানে ক্লিক করুন
                </button>
              </div>
            </>
          ) : (
            <div className="bg-red-50 border border-red-200 p-6 rounded-2xl space-y-4 animate-fade-in shadow-sm">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600">
                <AlertTriangle size={24} />
              </div>
              <div className="space-y-2">
                <h2 className="text-slate-800 font-bold text-lg font-bengali">অপ্রত্যাশিত সমস্যা!</h2>
                <p className="text-red-800 text-xs leading-relaxed font-bengali">{authError}</p>
              </div>
              <div className="pt-2 flex flex-col gap-2">
                <button 
                  onClick={() => window.location.reload()}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-xl text-sm transition-colors shadow-sm"
                >
                  পুনরায় চেষ্টা করুন
                </button>
                <button 
                  onClick={() => logout()}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 py-2 rounded-xl text-xs transition-colors"
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


  return (
    <div className={`min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-700 ${isEmbedMode ? 'bg-transparent' : ''}`}>
      
      {/* Sidebar - ALWAYS SHOW ON DESKTOP UNLESS EMBED MODE */}
      {!isEmbedMode && isMenuVisible && (
        <aside className={`fixed top-0 left-0 z-[200] h-screen w-64 md:w-72 bg-white border-r border-slate-200 p-5 flex flex-col transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} overflow-y-auto custom-scrollbar shadow-2xl md:shadow-none`}>
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 overflow-hidden relative shadow-sm shrink-0 border border-slate-200">
                {logo ? <img src={logo} className="w-full h-full object-cover" /> : <Upload size={20} />}
                {!logo && <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleLogoUpload} accept="image/*" />}
              </div>
              <div>
                <h1 className="font-bold text-slate-800 text-lg leading-tight tracking-wide"><BrandText text="আপন ফাউন্ডেশন" /></h1>
                <p className="text-[10px] text-slate-500 font-bold mt-0.5 uppercase tracking-wider">মানবসেবায় আমরা</p>
              </div>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400 hover:text-slate-600">
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
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 rounded-lg text-sm text-slate-800 placeholder-slate-400 transition-all outline-none"
            />
          </div>

          {/* User Profile Hook */}
          {currentUser ? (
            <div className="mb-6 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-3">
                <img 
                  src={currentUser.photoURL || 'https://via.placeholder.com/40'} 
                  className="w-9 h-9 rounded-lg border border-slate-200"
                  alt="User"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-slate-800 truncate">{currentUser.displayName}</p>
                  <p className="text-[9px] text-yellow-600 font-black uppercase tracking-tighter">
                    {currentUser.role === 'SUPER_ADMIN' ? 'সুপার এডমিন' : currentUser.role === 'ADMIN' ? 'এডমিন' : 'সাধারণ ইউজার'}
                  </p>
                </div>
                <button 
                  onClick={() => logout()}
                  className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
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
                className="w-full flex items-center justify-center gap-2 bg-yellow-500 text-slate-900 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-yellow-400 transition-all"
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
                  <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-3 px-2">{section.title}</h3>
                  <div className="space-y-1">
                    {filteredItems.map((item, itemIdx) => (
                      <NavItem key={itemIdx} view={item.view} icon={item.icon} label={item.label} />
                    ))}
                  </div>
                  {idx < menuSections.length - 1 && <hr className="border-slate-100 mt-6" />}
                </div>
              );
            })}
          </nav>

          {/* PWA Install Button & Copy Link Button Area */}
          <div className="mt-6 space-y-3 pt-6 border-t border-slate-100">
            {deferredPrompt && (
                <button
                  onClick={handleInstallClick}
                  className="w-full flex items-center justify-center gap-2 bg-yellow-500 text-slate-900 py-2.5 px-4 rounded-lg shadow-md hover:bg-yellow-400 transition-all font-bold text-sm"
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
                  className="w-full flex items-center justify-center gap-2 bg-slate-100 border border-slate-200 text-slate-600 py-2.5 px-4 rounded-lg hover:bg-slate-200 transition-all font-bold text-sm"
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
                  : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
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
                  : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
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
        <div className="md:hidden bg-white p-4 flex items-center gap-4 shadow-sm sticky top-0 z-[150] border-b border-slate-200">
          <button 
            onClick={() => {
              setIsMenuVisible(true);
              setIsMobileMenuOpen(true);
            }} 
            className="p-2 bg-slate-50 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            {logo && <img src={logo} className="w-8 h-8 rounded-full object-cover border border-slate-200" />}
            <span className="font-bold text-slate-800 tracking-tight text-lg"><BrandText text="আপন ফাউন্ডেশন" /></span>
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
                     onUpdateSections={handleUpdateConstitution}
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
                    onSaveNotice={handleSaveNotice}
                    onDeleteNotice={handleDeleteNotice}
                    isAdmin={isAdmin}
                  />
                </div>
              )}

              {activeView === 'MEMBERS' && (
                <div className="animate-fade-in">
                  <MemberDirectory 
                    members={members} 
                    onAddMember={handleAddMember}
                    onUpdateMember={handleUpdateMember}
                    onDeleteMember={handleDeleteMember}
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
                    onAddTransaction={handleAddTransaction}
                    onUpdateTransaction={handleUpdateTransaction}
                    onDeleteTransaction={handleDeleteTransaction}
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