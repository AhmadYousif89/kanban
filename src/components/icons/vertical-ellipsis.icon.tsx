import type { SVGProps } from 'react';

import { cn } from '@/lib/utils';

export function VerticalEllipsisIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width='5'
      height='20'
      xmlns='http://www.w3.org/2000/svg'
      className={cn('size-fit fill-current', className)}
      {...props}
    >
      <title>Vertical Ellipsis</title>
      <g fillRule='evenodd'>
        <circle cx='2.308' cy='2.308' r='2.308' />
        <circle cx='2.308' cy='10' r='2.308' />
        <circle cx='2.308' cy='17.692' r='2.308' />
      </g>
    </svg>
  );
}
