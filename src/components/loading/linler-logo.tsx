import type { CSSProperties } from 'react';

type Variant = 'light' | 'dark';

interface LinlerLogoProps {
  variant?: Variant;
  height?: number;
  iconOnly?: boolean;
  animated?: boolean;
  className?: string;
  style?: CSSProperties;
}

function buildWaveform(
  spikes: number,
  width: number,
  height: number,
  padX: number,
): string {
  const usableW = width - padX * 2;
  const midY = height / 2;
  const step = usableW / (spikes * 2);
  const maxAmp = height * 0.46;
  const points: string[] = [];

  for (let i = 0; i <= spikes * 2; i++) {
    const x = padX + step * i;
    const t = i / (spikes * 2);
    const envelope = Math.pow(Math.sin(Math.PI * t), 0.7);
    const amp = maxAmp * (0.18 + 0.82 * envelope);
    const dir = i % 2 === 0 ? -1 : 1;
    const y = midY + dir * amp;
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }

  return `M ${points.join(' L ')}`;
}

export function LinlerLogo({
  variant = 'light',
  height = 80,
  iconOnly = false,
  animated = false,
  className,
  style,
}: LinlerLogoProps) {
  const iconBg = variant === 'light' ? '#0a0a0a' : '#f2efe6';
  const waveColor = variant === 'light' ? '#f2efe6' : '#3a3a3a';
  const textColor = variant === 'light' ? '#0a0a0a' : '#f2efe6';

  const iconSize = 100;
  const wavePath = buildWaveform(15, iconSize, iconSize, 14);

  const totalWidth = iconOnly ? height : height * 3.9;
  const vbWidth = iconOnly ? 100 : 390;

  return (
    <svg
      role="img"
      aria-label="Linler"
      width={totalWidth}
      height={height}
      viewBox={`0 0 ${vbWidth} 100`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <rect x="0" y="0" width="100" height="100" rx="26" fill={iconBg} />
      <path
        d={wavePath}
        stroke={waveColor}
        strokeWidth="2.4"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      >
        {animated && (
          <animate
            attributeName="stroke-width"
            values="1.6;3;1.6"
            dur="1.6s"
            repeatCount="indefinite"
          />
        )}
      </path>

      {!iconOnly && (
        <text
          x="120"
          y="50"
          dominantBaseline="central"
          fontFamily="var(--font-sans), system-ui, sans-serif"
          fontSize="72"
          fontWeight={500}
          letterSpacing="-2"
          fill={textColor}
        >
          Linler
        </text>
      )}
    </svg>
  );
}
