'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { CrossIcon } from 'lucide-react';

import Wheel from '@uiw/react-color-wheel';

import { Button } from '@/components/ui/button';
import { InputGroupAddon } from '@/components/ui/input-group';

type ColorWheelProps = {
  value: string;
  label?: string;
  onDismiss?(): void;
  onChange(value: string): void;
  onOpenChange?(open: boolean): void;
};

export const ColorWheel = ({
  value,
  label = 'Column color',
  onDismiss,
  onChange,
  onOpenChange,
}: ColorWheelProps) => {
  const panelId = useId();
  const contentRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    onOpenChange?.(isOpen);

    const handlePointerDown = (event: PointerEvent) => {
      if (!contentRef.current?.contains(event.target as Node)) setIsOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onOpenChange]);

  return (
    <InputGroupAddon align='inline-end' className='pl-2'>
      <div ref={contentRef} className='flex'>
        <button
          type='button'
          aria-label={label}
          aria-haspopup='dialog'
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => setIsOpen((current) => !current)}
          className='size-6 overflow-hidden rounded-full cursor-pointer'
        >
          <span
            aria-hidden
            className='block size-full rounded-full'
            style={{ backgroundColor: value }}
          />
        </button>

        {isOpen && (
          <dialog
            id={panelId}
            aria-label={label}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            className='fixed inset-0 size-full z-200 grid items-center justify-center rounded-xl bg-black/50 p-3 shadow-lg cursor-default'
          >
            <Wheel
              className='cursor-pointer'
              color={value}
              onChange={(color) => onChange(color.hex)}
            />
            <Button
              type='button'
              size='icon-lg'
              variant='outline'
              onClick={() => {
                onDismiss?.();
                setIsOpen(false);
              }}
              className='absolute top-0 right-0 rounded-xl'
            >
              <CrossIcon aria-hidden className='rotate-45' />
              <span className='sr-only'>Close</span>
            </Button>
          </dialog>
        )}
      </div>
    </InputGroupAddon>
  );
};
