'use client';

import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();

  const changeLanguage = (locale) => {
    router.push(`${pathname}${queryString ? `?${queryString}` : ''}`, { locale });
  };

  return (
    <div className="dropdown dropdown-end">
      <label tabIndex={0} className="btn btn-ghost btn-circle m-1">
        <GlobeAltIcon  className='w-5 h-5'/>
      </label>
      <ul
        tabIndex={0}
        className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-32"
      >
        <li>
          <button onClick={() => changeLanguage('en')}>🏴󠁧󠁢󠁥󠁮󠁧󠁿 English</button>
        </li>
        <li>
          <button onClick={() => changeLanguage('kh')}>🇰🇭 Khmer</button>
        </li>
      </ul>
    </div>
  );
}
