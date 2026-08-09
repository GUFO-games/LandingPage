import en from './en.json';

export type Locale = 'en' | 'it' | 'es' | 'pt' | 'fr' | 'de' | 'ru' | 'ja' | 'zh';

export const DEFAULT_LOCALE: Locale = 'en';
export const LOCALES: Locale[] = ['en', 'it', 'es', 'pt', 'fr', 'de', 'ru', 'ja', 'zh'];

/** Locale metadata: native name + flag asset key (circle-flags file in src/assets/flags). */
export const LOCALE_META: Record<Locale, { native: string; flag: string; htmlLang: string }> = {
  en: { native: 'English', flag: 'gb', htmlLang: 'en' },
  it: { native: 'Italiano', flag: 'it', htmlLang: 'it' },
  es: { native: 'Español', flag: 'es', htmlLang: 'es' },
  pt: { native: 'Português', flag: 'br', htmlLang: 'pt-BR' },
  fr: { native: 'Français', flag: 'fr', htmlLang: 'fr' },
  de: { native: 'Deutsch', flag: 'de', htmlLang: 'de' },
  ru: { native: 'Русский', flag: 'ru', htmlLang: 'ru' },
  ja: { native: '日本語', flag: 'jp', htmlLang: 'ja' },
  zh: { native: '简体中文', flag: 'cn', htmlLang: 'zh-CN' },
};

type Dict = Record<string, string>;
const dictionaries: Partial<Record<Locale, Dict>> = { en };

/** Returns a t() lookup for the locale, falling back to English key-by-key. */
export function useTranslations(locale: Locale) {
  const dict = dictionaries[locale] ?? en;
  return function t(key: keyof typeof en): string {
    return (dict as Dict)[key] ?? en[key];
  };
}

/** Locales that have their own Google Form on the feedback page; others fall back to English. */
export const FEEDBACK_FORMS: Record<string, { label: string; cta: string; url: string }> = {
  it: { label: 'Italiano', cta: 'Dai il tuo feedback', url: 'https://forms.gle/jxX8xH9ADv21nW9u9' },
  en: { label: 'English', cta: 'Give your feedback', url: 'https://forms.gle/hUC2WKos4L8bCemE6' },
  es: { label: 'Español', cta: 'Da tu opinión', url: 'https://forms.gle/dKRRxuwoxzYKSGhm9' },
  pt: { label: 'Português', cta: 'Dê seu feedback', url: 'https://forms.gle/pWmyc9VCLjHKULab6' },
};

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

export const VIDEO_IDS = ['EXqUSbjh_9k', 'yNO7C4TddEk', 'TF1v-1nuZSI'] as const;

/** Team roster (content contract — all 14, order fixed). */
export const TEAM: { name: string; role: string; bio: string }[] = [
  { name: 'Pietro Dondi', role: 'Lead Developer & Game Designer', bio: 'Pietro is the leader of G.U.F.O. games and the original creator of LABYRAINTH. He designed and worked on every parts of the game.' },
  { name: 'Giorgio Morico', role: 'Vice Lead Developer', bio: 'Giorgio is the creator of LABYRAINTH and main partner of G.U.F.O. Games. He is the main working force of LABYRAINTH.' },
  { name: 'Marta Silla', role: 'UI/UX Developer', bio: 'Without Marta LABYRAINTH would not be as beautiful as it is. She is also the original member of G.U.F.O. games.' },
  { name: 'Giulio Posati', role: 'Gameplay and VFX Developer', bio: 'All the traps, power ups, orbs and many VFX effects you see in the game are thanks to Giulio.' },
  { name: 'Lorenzo Passaretti', role: 'UI/UX and Game Developer', bio: 'Lorenzo made sure many UIs are behaving correctly, also he made the game speak 16 languages.' },
  { name: 'Diego Argiolas', role: 'Gameplay and AI Developer', bio: 'Enemies move and think thanks to Diego. He also designed the labyrinth parsing algorithms with Pietro.' },
  { name: 'Davide Gattini', role: 'Performance Optimization and MacOs porting', bio: 'Davide optimized the game to run well on both Windows and MacOs computers, so you can run the game on your potato pc.' },
  { name: 'Claudio Vona', role: 'Tools Engineer', bio: 'Claudio worked behind the curtains to create many software tools for the game to make it work flawlessly.' },
  { name: 'Francesco Ciccone', role: 'Gameplay Developer', bio: 'Francesco has only recently joined the team and is already adding sparks to the game.' },
  { name: 'Davide Molitierno', role: 'Main BE Developer', bio: 'Davide was one of the first to join the team and has been working on the Backend Game Server ever since.' },
  { name: 'Matteo Petruzziello', role: 'BE developer', bio: 'If you see yourself in the Leaderboards, and see your progress in online modes, then that is thanks to Matteo.' },
  { name: 'Andrea Iskander', role: 'AWS developer', bio: 'Andrea makes sure the Game Server is always up and running making sure you can play the online game modes.' },
  { name: 'Lorenzo Ciani', role: 'AWS developer', bio: 'Lorenzo designed the AWS game server to make sure you can play the game with no halts and waiting time.' },
  { name: 'Emiliano Ursu', role: 'Community and Social Media Manager', bio: 'If you found this game is probably thanks to Emiliano, and his great work in making sure many people know about LABYRAINTH.' },
];
