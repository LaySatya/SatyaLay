'use client';

import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { useLocale } from '../context/LocaleContext';

export default function LanguageSwitcher() {
  const { locale: currentLocale, setLocale } = useLocale();

  const changeLanguage = (newLocale) => {
    if (newLocale !== currentLocale) {
      setLocale(newLocale);
      // Force a full page reload to apply the new locale translations
      window.location.reload();
    }
  };

  return (
    <div className="dropdown dropdown-end">
      <label tabIndex={0} className="btn btn-ghost btn-circle m-1 cursor-pointer">
        <GlobeAltIcon className="w-5 h-5" />
      </label>
      <ul
        tabIndex={0}
        className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-40 z-50"
      >
        <li>
          <button
            onClick={() => changeLanguage('en')}
            className={currentLocale === 'en' ? 'font-bold text-primary' : ''}
          >
            🇺🇸 English
          </button>
        </li>
        <li>
          <button
            onClick={() => changeLanguage('kh')}
            className={currentLocale === 'kh' ? 'font-bold text-primary' : ''}
          >
            🇰🇭 ភាសាខ្មែរ
          </button>
        </li>
      </ul>
    </div>
  );
}
