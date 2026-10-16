export type Language = 'en' | 'ar';
export type Direction = 'ltr' | 'rtl';

export interface TranslationDictionary {
  // Navigation Labels
  nav: {
    receptionDesk: string;
    calendar: string;
    clinicalWorkspace: string;
    patientsDirectory: string;
    cashRegister: string;
    clinicSettings: string;
    platformAnalytics: string;
    architectureInspector: string;
    sectionClinical: string;
    sectionOperations: string;
    sectionAdministration: string;
    sectionPlatform: string;
  };
  // Roles & Badges
  roles: {
    RECEPTIONIST: string;
    DOCTOR: string;
    CLINIC_ADMIN: string;
    SUPER_ADMIN: string;
    activeRole: string;
    switchRole: string;
    impersonating: string;
    tenantBadge: string;
  };
  // Actions & Common
  common: {
    searchPlaceholder: string;
    omniboxHint: string;
    online: string;
    offline: string;
    connectionLive: string;
    connectionLost: string;
    quickBook: string;
    newPatient: string;
    closeShift: string;
    saveChanges: string;
    cancel: string;
    delete: string;
    filter: string;
    refresh: string;
    logout: string;
    profile: string;
    notifications: string;
    noResults: string;
    loading: string;
    permissionDenied: string;
    unauthorizedMessage: string;
    language: string;
    arabic: string;
    english: string;
  };
  // Workspace and Cockpit
  cockpit: {
    todayQueue: string;
    waitingPatients: string;
    inConsultation: string;
    completedToday: string;
    activeShiftDrawer: string;
    drawerStatus: string;
    expectedCash: string;
    openDrawer: string;
  };
  // Clinic / Tenant details
  tenant: {
    name: string;
    subdomain: string;
    specialty: string;
    tier: string;
    quotaDoctors: string;
  };
}

export const translations: Record<Language, TranslationDictionary> = {
  en: {
    nav: {
      receptionDesk: 'Reception Desk & Queue',
      calendar: 'Calendar & Appointments',
      clinicalWorkspace: 'Clinical Workspace',
      patientsDirectory: 'Patients Directory',
      cashRegister: 'Cash Register & Shifts',
      clinicSettings: 'Clinic Settings & EAV',
      platformAnalytics: 'Platform 360 Analytics',
      architectureInspector: 'Architecture & Code',
      sectionClinical: 'Clinical Care',
      sectionOperations: 'Front Desk & Operations',
      sectionAdministration: 'Practice Administration',
      sectionPlatform: 'SaaS Control Plane'
    },
    roles: {
      RECEPTIONIST: 'Front Desk Receptionist',
      DOCTOR: 'Physician / Specialist',
      CLINIC_ADMIN: 'Practice Administrator',
      SUPER_ADMIN: 'Platform Super Admin',
      activeRole: 'Active Security Role',
      switchRole: 'Simulate Staff Role',
      impersonating: 'Temporal Support Session',
      tenantBadge: 'Multi-Tenant Workspace'
    },
    common: {
      searchPlaceholder: 'Search patients (MRN, phone, name), appointments, or jump to page...',
      omniboxHint: 'Press Ctrl+K to open Omnibox',
      online: 'Online',
      offline: 'Offline',
      connectionLive: 'Database & Redis Sync Live',
      connectionLost: 'Offline - Changes Queue in IndexedDB',
      quickBook: 'Quick Book Appointment',
      newPatient: 'Register Patient',
      closeShift: 'Close & Reconcile Shift',
      saveChanges: 'Save Changes',
      cancel: 'Cancel',
      delete: 'Delete',
      filter: 'Filter',
      refresh: 'Refresh Data',
      logout: 'Sign Out',
      profile: 'Staff Profile & Security',
      notifications: 'Notifications',
      noResults: 'No records matching query',
      loading: 'Loading workspace data...',
      permissionDenied: 'Access Restricted: You lack the fine-grained authority for this view.',
      unauthorizedMessage: 'Please authenticate with valid clinic credentials.',
      language: 'Language',
      arabic: 'العربية (RTL)',
      english: 'English (LTR)'
    },
    cockpit: {
      todayQueue: "Today's Patient Queue",
      waitingPatients: 'Waiting in Lobby',
      inConsultation: 'In Consultation',
      completedToday: 'Discharged Today',
      activeShiftDrawer: 'Active Register Drawer',
      drawerStatus: 'Shift Status: OPEN',
      expectedCash: 'Expected Cash Drawer Balance',
      openDrawer: 'Daily Reconciliation'
    },
    tenant: {
      name: 'Clinic Workspace',
      subdomain: 'Practice Subdomain',
      specialty: 'Clinical Specialty',
      tier: 'Subscription Plan',
      quotaDoctors: 'Doctor Quota Limit'
    }
  },
  ar: {
    nav: {
      receptionDesk: 'مكتب الاستقبال وقائمة الانتظار',
      calendar: 'المواعيد وجدول الحجوزات',
      clinicalWorkspace: 'العيادة وسجل الفحص الطبي',
      patientsDirectory: 'دليل المرضى والملفات الطبية',
      cashRegister: 'الخزينة والورديات اليومية',
      clinicSettings: 'إعدادات العيادة والحقول المخصصة',
      platformAnalytics: 'تحليلات المنصة الشاملة',
      architectureInspector: 'هيكلية النظام وشيفرة المصدر',
      sectionClinical: 'الرعاية والخدمات الطبية',
      sectionOperations: 'الاستقبال والعمليات اليومية',
      sectionAdministration: 'إدارة العيادة والاشتراكات',
      sectionPlatform: 'لوحة التحكم السحابية'
    },
    roles: {
      RECEPTIONIST: 'موظف استقبال',
      DOCTOR: 'طبيب ممارس / أخصائي',
      CLINIC_ADMIN: 'مدير العيادة والممارسة',
      SUPER_ADMIN: 'مسؤول النظام السحابي',
      activeRole: 'الصلاحية الأمنية الحالية',
      switchRole: 'تبديل دور الكادر للتجربة',
      impersonating: 'جلسة دعم فني مؤقتة',
      tenantBadge: 'مساحة العمل المتعددة المستأجرين'
    },
    common: {
      searchPlaceholder: 'ابحث عن مريض (الرقم الطبي، الهاتف، الاسم) أو تنقل سريعاً...',
      omniboxHint: 'اضغط Ctrl+K لفتح البحث السريع',
      online: 'متصل بالشبكة',
      offline: 'غير متصل',
      connectionLive: 'مزامنة حية مع قاعدة البيانات وRedis',
      connectionLost: 'غير متصل - حفظ مؤقت في IndexedDB',
      quickBook: 'حجز موعد سريع',
      newPatient: 'تسجيل مريض جديد',
      closeShift: 'إغلاق وتسوية الوردية',
      saveChanges: 'حفظ التغييرات',
      cancel: 'إلغاء',
      delete: 'حذف',
      filter: 'تصفية',
      refresh: 'تحديث البيانات',
      logout: 'تسجيل الخروج',
      profile: 'الملف الشخصي والأمان',
      notifications: 'التنبيهات',
      noResults: 'لا توجد نتائج مطابقة',
      loading: 'جارٍ تحميل البيانات...',
      permissionDenied: 'تم تقييد الوصول: لا تملك الصلاحية الدقيقة المطلوبة لهذه الشاشة.',
      unauthorizedMessage: 'يرجى تسجيل الدخول بحساب العيادة المعتمد.',
      language: 'اللغة',
      arabic: 'العربية (RTL)',
      english: 'English (LTR)'
    },
    cockpit: {
      todayQueue: 'قائمة انتظار المرضى اليوم',
      waitingPatients: 'في قاعة الانتظار',
      inConsultation: 'داخل غرفة الفحص',
      completedToday: 'تم إتمام الكشف اليوم',
      activeShiftDrawer: 'صندوق النقدية للوردية الحالية',
      drawerStatus: 'حالة الوردية: مفتوحة',
      expectedCash: 'الرصيد النقدي المتوقع بالصندوق',
      openDrawer: 'تسوية الوردية اليومية'
    },
    tenant: {
      name: 'مساحة العيادة',
      subdomain: 'النطاق الفرعي للمركز',
      specialty: 'التخصص الطبي',
      tier: 'باقة الاشتراك',
      quotaDoctors: 'الحد الأقصى للأطباء'
    }
  }
};
