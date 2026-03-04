'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import { theme } from '@/config/theme';

interface ColourPickerProps {
  value: string;
  onChange: (colour: string) => void;
  /** Compact mode for sidebar inline form */
  compact?: boolean;
}

// Fixed saturation & lightness for readable project dots in both themes
const HSL_SATURATION = 55;
const HSL_LIGHTNESS = 50;

function hslToHex(h: number, s: number, l: number): string {
  const a = s / 100;
  const b = l / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = b - a * Math.min(b, 1 - b) * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHue(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  if (d === 0) return 0;
  let h = 0;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h = Math.round(h * 60);
  return h < 0 ? h + 360 : h;
}

const PRESET_VALUES: Set<string> = new Set(theme.projectColors.map((c) => c.value));

// Pre-compute the gradient string (never changes)
const GRADIENT_STOPS = Array.from({ length: 13 }, (_, i) =>
  hslToHex(i * 30, HSL_SATURATION, HSL_LIGHTNESS)
).join(', ');

const DEFAULT_CUSTOM = hslToHex(180, HSL_SATURATION, HSL_LIGHTNESS);

export function ColourPicker({ value, onChange, compact }: ColourPickerProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [sliderOpen, setSliderOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [customColour, setCustomColour] = useState(DEFAULT_CUSTOM);

  const isPreset = PRESET_VALUES.has(value);

  // If current value is custom (non-preset), sync customColour to it
  useEffect(() => {
    if (!isPreset && value && value.length >= 7) {
      setCustomColour(value);
      setSliderOpen(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const hue = customColour.length >= 7 ? hexToHue(customColour) : 0;

  const computeColour = useCallback(
    (clientX: number) => {
      const el = sliderRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const h = Math.round((x / rect.width) * 360);
      const hex = hslToHex(h, HSL_SATURATION, HSL_LIGHTNESS);
      setCustomColour(hex);
      onChange(hex);
    },
    [onChange]
  );

  // Window-level listeners for reliable drag
  useEffect(() => {
    if (!dragging) return;
    const handleMove = (e: PointerEvent) => computeColour(e.clientX);
    const handleUp = () => setDragging(false);
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [dragging, computeColour]);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setDragging(true);
    computeColour(e.clientX);
  };

  const handlePresetClick = (colour: string) => {
    onChange(colour);
    setSliderOpen(false);
  };

  const handleCustomClick = () => {
    if (sliderOpen && !isPreset) return; // already active
    setSliderOpen(true);
    onChange(customColour);
  };

  const dotSize = compact ? 'w-5 h-5' : 'w-6 h-6';
  const ringOffset = compact ? 'ring-offset-sidebar' : 'ring-offset-card';
  const thumbLeft = `${(hue / 360) * 100}%`;

  return (
    <div>
      {/* 7 presets + 1 custom dot */}
      <div className="flex items-center gap-1.5">
        {theme.projectColors.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => handlePresetClick(c.value)}
            className={`${dotSize} rounded-full transition-all ${
              value === c.value
                ? `ring-2 ring-offset-2 ${ringOffset} ring-accent scale-110`
                : 'hover:scale-110'
            }`}
            style={{ backgroundColor: c.value }}
            aria-label={c.name}
          />
        ))}
        {/* Custom colour dot — shows solid custom colour when active, rainbow when inactive */}
        <button
          type="button"
          onClick={handleCustomClick}
          className={`${dotSize} rounded-full transition-all ${
            sliderOpen && !isPreset
              ? `ring-2 ring-offset-2 ${ringOffset} ring-accent scale-110`
              : 'hover:scale-110'
          }`}
          style={{
            background: sliderOpen
              ? customColour
              : `conic-gradient(from 0deg, ${GRADIENT_STOPS})`,
          }}
          aria-label="Custom colour"
        />
      </div>

      {/* Hue slider — only visible when custom is active */}
      {sliderOpen && (
        <div
          ref={sliderRef}
          className="relative mt-2.5 h-5 rounded-full cursor-pointer touch-none select-none"
          style={{ background: `linear-gradient(to right, ${GRADIENT_STOPS})` }}
          onPointerDown={handlePointerDown}
        >
          <div
            className="absolute w-4 h-4 rounded-full border-2 border-white shadow-md pointer-events-none"
            style={{
              left: thumbLeft,
              top: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: customColour,
            }}
          />
        </div>
      )}
    </div>
  );
}
