import type { SVGProps } from 'react';

import { cn } from '@/lib/utils';

export function ChevronUpIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width='10'
      height='7'
      xmlns='http://www.w3.org/2000/svg'
      className={cn('size-fit fill-current', className)}
      {...props}
    >
      <title>Chevron Up</title>
      <path stroke='#635FC7' strokeWidth='2' fill='none' d='M9 6 5 2 1 6' />
    </svg>
  );
}
