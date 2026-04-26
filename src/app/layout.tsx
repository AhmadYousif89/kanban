import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Kanban',
  description: 'Advanced Kanban task management dashboard',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang='en'
      className={cn('h-svh', 'antialiased', 'font-sans', plusJakartaSans.variable)}
      suppressHydrationWarning
    >
      <body className='min-h-svh flex flex-col'>
        <ThemeProvider attribute='class' enableSystem disableTransitionOnChange>
          <div className='container'>{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
