import en from './en.json';
import it from './it.json';
import es from './es.json';
import pt from './pt.json';
import fr from './fr.json';
import de from './de.json';
import ru from './ru.json';
import ja from './ja.json';
import zh from './zh.json';

export type Locale = 'en' | 'it' | 'es' | 'pt' | 'fr' | 'de' | 'ru' | 'ja' | 'zh';
export type MessageKey = keyof typeof en;

export const DEFAULT_LOCALE: Locale = 'en';
/** Switcher order is part of the design contract. */
export const LOCALES: Locale[] = ['en', 'it', 'es', 'pt', 'fr', 'de', 'ru', 'ja', 'zh'];

export const LOCALE_META: Record<Locale, { native: string; flag: string; htmlLang: string; ogLocale: string }> = {
  en: { native: 'English', flag: 'gb', htmlLang: 'en', ogLocale: 'en_GB' },
  it: { native: 'Italiano', flag: 'it', htmlLang: 'it', ogLocale: 'it_IT' },
  es: { native: 'Español', flag: 'es', htmlLang: 'es', ogLocale: 'es_ES' },
  pt: { native: 'Português', flag: 'br', htmlLang: 'pt-BR', ogLocale: 'pt_BR' },
  fr: { native: 'Français', flag: 'fr', htmlLang: 'fr', ogLocale: 'fr_FR' },
  de: { native: 'Deutsch', flag: 'de', htmlLang: 'de', ogLocale: 'de_DE' },
  ru: { native: 'Русский', flag: 'ru', htmlLang: 'ru', ogLocale: 'ru_RU' },
  ja: { native: '日本語', flag: 'jp', htmlLang: 'ja', ogLocale: 'ja_JP' },
  zh: { native: '简体中文', flag: 'cn', htmlLang: 'zh-CN', ogLocale: 'zh_CN' },
};

const dictionaries: Record<Locale, Record<string, string>> = { en, it, es, pt, fr, de, ru, ja, zh };

/** Locale lookup with per-key English fallback, so a missing string never renders empty. */
export function useTranslations(locale: Locale) {
  const dict = dictionaries[locale] ?? en;
  return function t(key: MessageKey): string {
    return dict[key] ?? en[key];
  };
}

/**
 * Suggestion-banner copy for every locale, written in that locale.
 * The banner appears on a page in language A proposing language B, so B's own
 * strings have to travel with the page.
 */
export const SUGGEST_STRINGS: Record<Locale, { text: string; cta: string }> = Object.fromEntries(
  LOCALES.map((code) => [
    code,
    { text: dictionaries[code]['lang.suggestText'], cta: dictionaries[code]['lang.suggestSwitch'] },
  ])
) as Record<Locale, { text: string; cta: string }>;

const BASE = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;

/** Base-aware route builder. Default locale lives at the root — the live URL must not change. */
export function localeUrl(locale: Locale, page: 'landing' | 'feedback' = 'landing'): string {
  const prefix = locale === DEFAULT_LOCALE ? BASE : `${BASE}${locale}/`;
  return page === 'feedback' ? `${prefix}feedback/` : prefix;
}

// The host lives in TWO places: astro.config's `site` (used by the sitemap)
// and here (used by canonical, hreflang, OG and JSON-LD via absoluteUrl).
// Both read the same env var so they cannot drift apart.
export const SITE_ORIGIN = (import.meta.env.PUBLIC_SITE_URL ?? 'https://gufo-games.labyrainth.com').replace(/\/+$/, '');
export const absoluteUrl = (path: string) => `${SITE_ORIGIN}${path}`;

/** Binding external links (content contract; FIX-1/4/5 applied). */
export const LINKS = {
  steam: 'https://store.steampowered.com/app/3672600/LabyrAInth/',
  discord: 'https://discord.com/invite/Awp6WunubP',
  youtube: 'https://www.youtube.com/channel/UCvZcDsgFesIDFvXmQYffNRw',
  instagram: 'https://www.instagram.com/labyrainthpcvr/',
  tiktok: 'https://www.tiktok.com/@labyrainthpcvr',
  facebook: 'https://www.facebook.com/LABYRAINTH/',
  reddit: 'https://www.reddit.com/r/LABYRAINTH/',
  email: 'labyrainthpcvr@gmail.com',
} as const;

export const SOCIALS = [
  { icon: 'youtube', label: 'YouTube', href: LINKS.youtube },
  { icon: 'instagram', label: 'Instagram', href: LINKS.instagram },
  { icon: 'tiktok', label: 'TikTok', href: LINKS.tiktok },
  { icon: 'facebook', label: 'Facebook', href: LINKS.facebook },
  { icon: 'reddit', label: 'Reddit', href: LINKS.reddit },
] as const;

export const VIDEO_IDS = ['EXqUSbjh_9k', 'yNO7C4TddEk', 'TF1v-1nuZSI'] as const;

/**
 * Per-video metadata for the VideoObject schema. `uploadDate` is a REQUIRED
 * field for Google video rich results - without it the trailers are ineligible,
 * which the Rich Results Test reports as an error rather than a warning.
 * Values are the real YouTube publication timestamps, and the titles match the
 * ones on the channel so the two describe the same thing.
 * Deliberately kept out of the locale dictionaries: these are facts about the
 * videos, not copy, and they must not vary by language.
 */
export const VIDEO_META: Record<(typeof VIDEO_IDS)[number], { name: string; uploadDate: string }> = {
  'EXqUSbjh_9k': { name: 'LABYRAINTH Gameplay Trailer - first version', uploadDate: '2025-08-24T09:14:31-07:00' },
  'yNO7C4TddEk': { name: 'LABYRAINTH Cinematic Story Trailer',          uploadDate: '2025-08-24T09:02:07-07:00' },
  'TF1v-1nuZSI': { name: 'LABYRAINTH Teaser Trailer',                   uploadDate: '2025-08-24T08:49:51-07:00' },
};

/** Team names are never translated; role/bio come from the locale dictionary (team.mN.*). */
export const TEAM_NAMES = [
  'Pietro Dondi', 'Giorgio Morico', 'Marta Silla', 'Giulio Posati',
  'Lorenzo Passaretti', 'Diego Argiolas', 'Davide Gattini', 'Claudio Vona',
  'Francesco Ciccone', 'Davide Molitierno', 'Matteo Petruzziello',
  'Andrea Iskander', 'Lorenzo Ciani', 'Emiliano Ursu',
] as const;

/** Four Google Forms exist. Locales without one fall back to English plus a localized notice. */
export const FEEDBACK_FORMS = [
  { code: 'it', label: 'Italiano', cta: 'Dai il tuo feedback', url: 'https://forms.gle/jxX8xH9ADv21nW9u9', flag: 'it' },
  { code: 'en', label: 'English', cta: 'Give your feedback', url: 'https://forms.gle/hUC2WKos4L8bCemE6', flag: 'gb' },
  { code: 'es', label: 'Español', cta: 'Da tu opinión', url: 'https://forms.gle/dKRRxuwoxzYKSGhm9', flag: 'es' },
  { code: 'pt', label: 'Português', cta: 'Dê seu feedback', url: 'https://forms.gle/pWmyc9VCLjHKULab6', flag: 'br' },
] as const;

/** True when the visitor's locale has no native form and should see the English-form notice. */
export const needsFormNotice = (locale: Locale) => !FEEDBACK_FORMS.some((f) => f.code === locale);
