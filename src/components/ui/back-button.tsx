'use client';

import { useRouter } from 'next/navigation';
import { Button } from './button';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  className?: string;
}

export function BackButton({ className }: BackButtonProps) {
  const router = useRouter();

  function handleClick() {
    router.back();
  }
  return (
    <Button
      className={className}
      onClick={handleClick}
      type="button"
      variant="ghost"
    >
      <ArrowLeft /> Back
    </Button>
  );
}
