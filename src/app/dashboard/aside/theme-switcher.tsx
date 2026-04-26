'use client';

import { useTheme } from 'next-themes';

import { cn } from '@/lib/utils';
import { useHydrate } from '@/hooks/use-hydrate';
import { DarkThemeIcon, LightThemeIcon } from '@/components/icons';

export function ThemeSwitcher() {
  const { resolvedTheme, setTheme } = useTheme();
  const hydrated = useHydrate();

  if (!hydrated) {
    return <div className='h-12 rounded-md bg-background px-3' />;
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type='button'
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      className='group border border-transparent w-full flex h-12 items-center justify-center gap-6 rounded-md bg-background px-3 cursor-pointer focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-ring/50 outline-0 transition'
    >
      <LightThemeIcon aria-hidden className={cn(isDark && 'opacity-50')} />
      <span className='inline-flex h-5 w-10 items-center rounded-full bg-primary px-1 group-hover:bg-accent transition duration-(--sidebar-duration)'>
        <span className={cn('size-3.5 rounded-full bg-white', isDark && 'translate-x-4.5')} />
      </span>
      <DarkThemeIcon aria-hidden className={cn(!isDark && 'opacity-50')} />
    </button>
  );
}
