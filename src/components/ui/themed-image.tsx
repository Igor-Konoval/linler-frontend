import { cn } from '@/src/utils/utils';
import Image, { type ImageProps } from 'next/image';

type ThemedImageProps = Omit<ImageProps, 'src'> & {
  lightSrc: string;
  darkSrc: string;
};

export function ThemedImage({
  lightSrc,
  darkSrc,
  alt,
  className,
  ...props
}: ThemedImageProps) {
  return (
    <>
      <Image
        src={lightSrc}
        alt={alt}
        className={cn('block dark:hidden', className)}
        {...props}
      />
      <Image
        src={darkSrc}
        alt={alt}
        className={cn('hidden dark:block', className)}
        {...props}
      />
    </>
  );
}
