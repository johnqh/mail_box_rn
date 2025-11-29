import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'react-native-localize';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import all translations bundled with the app
import en from '../../assets/locales/en/common.json';
import ar from '../../assets/locales/ar/common.json';
import de from '../../assets/locales/de/common.json';
import es from '../../assets/locales/es/common.json';
import fr from '../../assets/locales/fr/common.json';
import it from '../../assets/locales/it/common.json';
import ja from '../../assets/locales/ja/common.json';
import ko from '../../assets/locales/ko/common.json';
import pt from '../../assets/locales/pt/common.json';
import ru from '../../assets/locales/ru/common.json';
import sv from '../../assets/locales/sv/common.json';
import th from '../../assets/locales/th/common.json';
import uk from '../../assets/locales/uk/common.json';
import vi from '../../assets/locales/vi/common.json';
import zh from '../../assets/locales/zh/common.json';
import zhHant from '../../assets/locales/zh-hant/common.json';

const SUPPORTED_LANGUAGES = [
  'en', 'ar', 'de', 'es', 'fr', 'it', 'ja', 'ko',
  'pt', 'ru', 'sv', 'th', 'uk', 'vi', 'zh', 'zh-hant',
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

const LANGUAGE_STORAGE_KEY = '@app/language';

const resources = {
  en: { common: en },
  ar: { common: ar },
  de: { common: de },
  es: { common: es },
  fr: { common: fr },
  it: { common: it },
  ja: { common: ja },
  ko: { common: ko },
  pt: { common: pt },
  ru: { common: ru },
  sv: { common: sv },
  th: { common: th },
  uk: { common: uk },
  vi: { common: vi },
  zh: { common: zh },
  'zh-hant': { common: zhHant },
};

// Detect device language
const detectDeviceLanguage = (): string => {
  try {
    const locales = getLocales();
    if (locales.length > 0) {
      const deviceLanguage = locales[0].languageTag;
      // Handle Chinese variants
      if (deviceLanguage.startsWith('zh-Hant') || deviceLanguage === 'zh-TW' || deviceLanguage === 'zh-HK') {
        return 'zh-hant';
      }
      if (deviceLanguage.startsWith('zh')) {
        return 'zh';
      }
      // Get base language code
      const baseLanguage = deviceLanguage.split('-')[0];
      if (SUPPORTED_LANGUAGES.includes(baseLanguage as SupportedLanguage)) {
        return baseLanguage;
      }
    }
  } catch (error) {
    console.warn('Failed to detect device language:', error);
  }
  return 'en';
};

// Load stored language preference
const loadStoredLanguage = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
  } catch {
    return null;
  }
};

// Save language preference
export const saveLanguagePreference = async (language: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch (error) {
    console.warn('Failed to save language preference:', error);
  }
};

// Initialize i18n
export const initializeI18n = async (): Promise<typeof i18n> => {
  const storedLanguage = await loadStoredLanguage();
  const initialLanguage = storedLanguage || detectDeviceLanguage();

  await i18n
    .use(initReactI18next)
    .init({
      compatibilityJSON: 'v4', // Required for Android
      resources,
      lng: initialLanguage,
      fallbackLng: {
        'zh-hant': ['zh-hant', 'zh', 'en'],
        zh: ['zh', 'en'],
        default: ['en'],
      },
      supportedLngs: SUPPORTED_LANGUAGES as unknown as string[],
      defaultNS: 'common',
      ns: ['common'],
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    });

  return i18n;
};

// Change language
export const changeLanguage = async (language: string): Promise<void> => {
  await i18n.changeLanguage(language);
  await saveLanguagePreference(language);
};

export { SUPPORTED_LANGUAGES };
export default i18n;
