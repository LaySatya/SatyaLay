// 'use client';
// import { useTranslations } from 'next-intl';
// import { useState, useEffect } from 'react';

// export default function RotatingText() {
//   const t = useTranslations('welcomePage');
//   const textsObj = t('rotatingTexts', { returnObjects: true });
//   const texts = Object.values(textsObj); // convert object to array

//   const [index, setIndex] = useState(0);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setIndex((prev) => (prev + 1) % texts.length);
//     }, 1500);
//     return () => clearInterval(interval);
//   }, [texts.length]);

//   return (
//     <span className="text-4xl md:text-6xl font-bold text-cyan-500">
//       {texts[index]}
//     </span>
//   );
// }
