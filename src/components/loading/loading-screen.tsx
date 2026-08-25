'use client';

import { LinlerLogo } from './linler-logo';

export function LoadingScreen() {
  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-white px-6 text-[#0a0a0a] transition-colors duration-500 dark:bg-[#0a0a0a] dark:text-[#f2efe6]">
      <div className="linler-breathe">
        <LinlerLogo
          variant="light"
          height={72}
          animated
          className="dark:hidden"
        />
        <LinlerLogo
          variant="dark"
          height={72}
          animated
          className="hidden dark:block"
        />
      </div>

      <div className="mt-12 flex flex-col items-center gap-5">
        <div className="h-1 w-56 overflow-hidden rounded-full bg-[#ececec] dark:bg-[#1f1f1f]">
          <div className="linler-bar h-full w-1/3 rounded-full bg-[#0a0a0a] dark:bg-[#f2efe6]" />
        </div>
        <p className="text-sm tracking-wide opacity-60">Загрузка…</p>
      </div>
    </main>
  );
}
