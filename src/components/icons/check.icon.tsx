import type { SVGProps } from 'react';

import { cn } from '@/lib/utils';

export function CheckIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width='10'
      height='8'
      xmlns='http://www.w3.org/2000/svg'
      className={cn('size-fit', className)}
      {...props}
    >
      <title>Check</title>
      <path stroke='#FFF' strokeWidth='2' fill='none' d='m1.276 3.066 2.756 2.756 5-5' />
    </svg>
  );
}
