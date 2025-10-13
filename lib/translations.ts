// lib/translations.ts

/** 
 * Define full English keys here. Other languages can be partial;
 * the app will fall back to English for any missing key.
 */
const en = {
  // Navigation
  home: "Home",
  weather: "Weather",
  marketplace: "Marketplace",
  chat: "AI Chat",
  diseaseDetection: "Disease Detection",
  login: "Login",
  register: "Register",
  dashboard: "Dashboard",
  logout: "Logout",

  // Homepage
  welcomeTitle: "Welcome to AgriGuide",
  welcomeSubtitle: "Your Complete Agricultural Solution Platform",
  welcomeDescription:
    "Get weather updates, AI-powered farming advice, disease detection, and access to our marketplace - all in one place.",
  getStarted: "Get Started",
  learnMore: "Learn More",

  // Features
  featuresTitle: "Our Features",
  weatherTitle: "Weather Information",
  weatherDesc: "Get accurate weather forecasts and agricultural recommendations",
  aiChatTitle: "AI Agricultural Assistant",
  aiChatDesc: "Get expert farming advice from our AI-powered chatbot",
  diseaseTitle: "Crop Disease Detection",
  diseaseDesc: "Upload crop images to detect diseases and get treatment solutions",
  marketplaceTitle: "Farmer Marketplace",
  marketplaceDesc: "Buy and sell agricultural products directly from farmers",

  // Authentication
  loginTitle: "Login to Your Account",
  registerTitle: "Create New Account",
  email: "Email Address",
  password: "Password",
  confirmPassword: "Confirm Password",
  fullName: "Full Name",
  userType: "User Type",
  farmer: "Farmer",
  customer: "Customer",
  loginButton: "Login",
  registerButton: "Register",
  alreadyHaveAccount: "Already have an account?",
  dontHaveAccount: "Don't have an account?",

  // Weather
  searchLocation: "Search location...",
  currentWeather: "Current Weather",
  forecast: "5-Day Forecast",
  temperature: "Temperature",
  humidity: "Humidity",
  windSpeed: "Wind Speed",
  pressure: "Pressure",

  // AI Chat
  chatTitle: "Agricultural AI Assistant",
  chatPlaceholder: "Ask me anything about farming...",
  sendMessage: "Send",
  typing: "AI is typing...",

  // Disease Detection
  uploadImage: "Upload Crop Image",
  analyzeImage: "Analyze Image",
  selectSymptoms: "Select Symptoms",
  getRecommendations: "Get Recommendations",
  confidence: "Confidence",
  severity: "Severity",
  treatment: "Treatment",
  prevention: "Prevention",

  // Marketplace
  searchProducts: "Search products...",
  allCategories: "All Categories",
  vegetables: "Vegetables",
  fruits: "Fruits",
  grains: "Grains",
  dairy: "Dairy",
  addToCart: "Add to Cart",
  buyNow: "Buy Now",
  price: "Price",
  quantity: "Quantity",

  // Checkout
  checkout: "Checkout",
  orderSummary: "Order Summary",
  shippingAddress: "Shipping Address",
  paymentMethod: "Payment Method",
  cashOnDelivery: "Cash on Delivery",
  creditCard: "Credit/Debit Card",
  upiPayment: "UPI Payment",
  placeOrder: "Place Order",
  total: "Total",

  // Order Confirmation
  orderSuccess: "Order Placed Successfully!",
  orderThankYou: "Thank you for your order. We'll process it shortly.",
  orderId: "Order ID",
  trackingNumber: "Tracking Number",
  status: "Status",
  estimatedDelivery: "Estimated Delivery",
  viewOrders: "View Orders",
  continueShopping: "Continue Shopping",

  // Common
  loading: "Loading...",
  error: "Error",
  success: "Success",
  cancel: "Cancel",
  save: "Save",
  edit: "Edit",
  delete: "Delete",
  search: "Search",
  filter: "Filter",
  sort: "Sort",
  back: "Back",
  next: "Next",
  previous: "Previous",
  submit: "Submit",
  close: "Close",
} as const;

// Export the type based on the English keys
export type TranslationKey = keyof typeof en;

/**
 * Allow partial translations for non-English languages.
 * Any missing key will fall back to en in the t() function.
 */
export const translations: Record<string, Partial<Record<TranslationKey, string>>> = {
  en,

  // Hindi
  hi: {
    home: "होम",
    weather: "मौसम",
    marketplace: "बाज़ार",
    chat: "AI चैट",
    diseaseDetection: "रोग पहचान",
    login: "लॉगिन",
    register: "रजिस्टर",
    dashboard: "डैशबोर्ड",
    logout: "लॉगआउट",
    welcomeTitle: "एग्रीगाइड में आपका स्वागत है",
    welcomeSubtitle: "आपका संपूर्ण कृषि समाधान प्लेटफॉर्म",
    weatherTitle: "मौसम की जानकारी",
    loading: "लोड हो रहा है...",
    error: "त्रुटि",
    success: "सफलता",
    search: "खोजें",
  },

  // Spanish (kept minimal; fallback to en for the rest)
  es: {
    home: "Inicio",
    weather: "Clima",
    marketplace: "Mercado",
    chat: "Chat IA",
    diseaseDetection: "Detección de Enfermedades",
    login: "Iniciar Sesión",
    register: "Registrarse",
    dashboard: "Panel",
    logout: "Cerrar Sesión",
    welcomeTitle: "Bienvenido a AgriGuide",
    welcomeSubtitle: "Tu Plataforma Completa de Soluciones Agrícolas",
    loading: "Cargando...",
    error: "Error",
  },

  // Tamil
  ta: {
    home: "முகப்பு",
    weather: "வானிலை",
    marketplace: "சந்தை",
    chat: "AI உரையாடல்",
    diseaseDetection: "நோய் கண்டறிதல்",
    login: "உள்நுழை",
    register: "பதிவு செய்",
    dashboard: "டாஷ்போர்டு",
    logout: "வெளியேறு",
    welcomeTitle: "AgriGuide-க்கு வரவேற்கிறோம்",
    welcomeSubtitle: "உங்கள் முழுமையான விவசாய தீர்வு தளம்",
    loading: "ஏற்றுகிறது...",
    error: "பிழை",
  },

  // Telugu
  te: {
    home: "హోమ్",
    weather: "వాతావరణం",
    marketplace: "మార్కెట్",
    chat: "AI చాట్",
    diseaseDetection: "వ్యాధి గుర్తింపు",
    login: "లాగిన్",
    register: "రిజిస్టర్",
    dashboard: "డాష్‌బోర్డ్",
    logout: "లాగౌట్",
    welcomeTitle: "AgriGuide కు స్వాగతం",
    welcomeSubtitle: "మీ సంపూర్ణ వ్యవసాయ పరిష్కార వేదిక",
    loading: "లోడ్ అవుతోంది...",
    error: "లోపం",
  },

  // Bengali
  bn: {
    home: "হোম",
    weather: "আবহাওয়া",
    marketplace: "বাজার",
    chat: "AI চ্যাট",
    diseaseDetection: "রোগ শনাক্তকরণ",
    login: "লগইন",
    register: "রেজিস্টার",
    dashboard: "ড্যাশবোর্ড",
    logout: "লগআউট",
    welcomeTitle: "AgriGuide-এ স্বাগতম",
    welcomeSubtitle: "আপনার সম্পূর্ণ কৃষি সমাধান প্ল্যাটফর্ম",
    loading: "লোড হচ্ছে...",
    error: "ত্রুটি",
  },

  // Marathi
  mr: {
    home: "मुख्यपृष्ठ",
    weather: "हवामान",
    marketplace: "बाजार",
    chat: "AI चॅट",
    diseaseDetection: "आजार शोध",
    login: "लॉगिन",
    register: "नोंदणी",
    dashboard: "डॅशबोर्ड",
    logout: "लॉगआउट",
    welcomeTitle: "AgriGuide मध्ये आपले स्वागत आहे",
    welcomeSubtitle: "आपले संपूर्ण कृषी समाधान प्लॅटफॉर्म",
    loading: "लोड होत आहे...",
    error: "त्रुटी",
  },

  // Gujarati
  gu: {
    home: "મુખ્ય પૃષ્ઠ",
    weather: "હવામાન",
    marketplace: "બજાર",
    chat: "AI ચેટ",
    diseaseDetection: "રોગ શોધ",
    login: "લૉગિન",
    register: "રજિસ્ટર",
    dashboard: "ડેશબોર્ડ",
    logout: "લૉગઆઉટ",
    welcomeTitle: "AgriGuide માં આપનું સ્વાગત છે",
    welcomeSubtitle: "તમારું સંપૂર્ણ કૃષિ સોલ્યુશન પ્લેટફોર્મ",
    loading: "લોડ થઈ રહ્યું છે...",
    error: "ભૂલ",
  },

  // Kannada
  kn: {
    home: "ಮುಖಪುಟ",
    weather: "ಹವಾಮಾನ",
    marketplace: "ಮಾರುಕಟ್ಟೆ",
    chat: "AI ಚಾಟ್",
    diseaseDetection: "ರೋಗ ಪತ್ತೆ",
    login: "ಲಾಗಿನ್",
    register: "ನೋಂದಣಿ",
    dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    logout: "ಲಾಗ್‌ಔಟ್",
    welcomeTitle: "AgriGuide ಗೆ ಸುಸ್ವಾಗತ",
    welcomeSubtitle: "ನಿಮ್ಮ ಸಂಪೂರ್ಣ ಕೃಷಿ ಪರಿಹಾರ ವೇದಿಕೆ",
    loading: "ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
    error: "ದೋಷ",
  },

  // Malayalam
  ml: {
    home: "ഹോം",
    weather: "കാലാവസ്ഥ",
    marketplace: "മാർക്കറ്റ്",
    chat: "AI ചാറ്റ്",
    diseaseDetection: "രോഗനിർണയം",
    login: "ലോഗിൻ",
    register: "രജിസ്റ്റർ",
    dashboard: "ഡാഷ്ബോർഡ്",
    logout: "ലോഗൗട്ട്",
    welcomeTitle: "AgriGuide-ലേക്ക് സ്വാഗതം",
    welcomeSubtitle: "നിങ്ങളുടെ സമ്പൂർണ്ണ കൃഷി പരിഹാര പ്ലാറ്റ്ഫോം",
    loading: "ലോഡ് ചെയ്യുന്നു...",
    error: "പിശക്",
  },

  // Odia
  or: {
    home: "ହୋମ୍",
    weather: "ଆବହାବିଜ୍ଞାନ",
    marketplace: "ବଜାର",
    chat: "AI ଚାଟ୍",
    diseaseDetection: "ରୋଗ ସନ୍ଧାନ",
    login: "ଲଗଇନ୍",
    register: "ରେଜିଷ୍ଟର",
    dashboard: "ଡ୍ୟାଶବୋର୍ଡ",
    logout: "ଲଗଆଉଟ୍",
    welcomeTitle: "AgriGuide କୁ ସ୍ୱାଗତ",
    welcomeSubtitle: "ଆପଣଙ୍କ ପୂର୍ଣ୍ଣ କୃଷି ସମାଧାନ ପ୍ଲାଟଫର୍ମ",
    loading: "ଲୋଡ଼ ହେଉଛି...",
    error: "ତ୍ରୁଟି",
  },

  // Punjabi
  pa: {
    home: "ਮੁੱਖ ਪੰਨਾ",
    weather: "ਮੌਸਮ",
    marketplace: "ਬਾਜ਼ਾਰ",
    chat: "AI ਚੈਟ",
    diseaseDetection: "ਬਿਮਾਰੀ ਪਛਾਣ",
    login: "ਲਾਗਇਨ",
    register: "ਰਜਿਸਟਰ",
    dashboard: "ਡੈਸ਼ਬੋਰਡ",
    logout: "ਲਾਗਆਊਟ",
    welcomeTitle: "AgriGuide ਵਿੱਚ ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ",
    welcomeSubtitle: "ਤੁਹਾਡਾ ਪੂਰਾ ਖੇਤੀਬਾੜੀ ਹੱਲ ਪਲੇਟਫਾਰਮ",
    loading: "ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...",
    error: "ਗਲਤੀ",
  },
} as const;

// Export available languages
export type Language = keyof typeof translations;

// Export the default language
export const DEFAULT_LANGUAGE: Language = 'en';

// Helper function to get available languages
export const getAvailableLanguages = (): Language[] => {
  return Object.keys(translations) as Language[];
};

// Helper function to check if a language is supported
export const isLanguageSupported = (lang: string): lang is Language => {
  return lang in translations;
};

// Export everything for easy import
export default translations;