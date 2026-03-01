'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconChevronDown } from '@/components/ui/Icons';
import { Badge } from '@/components/ui/Badge';

interface CollapsibleSectionProps {
  title: string;
  count: number;
  badge?: { label: string; variant: 'default' | 'accent' | 'muted' | 'success' | 'warning' };
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function CollapsibleSection({
  title,
  count,
  badge,
  defaultOpen = true,
  children,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mt-6 first:mt-0">
      {/* Section header — matches page heading style */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full pb-1 border-b border-border mb-1"
      >
        <motion.span
          animate={{ rotate: isOpen ? 0 : -90 }}
          transition={{ duration: 0.15 }}
          className="text-muted-foreground"
        >
          <IconChevronDown size={14} />
        </motion.span>
        <span className="text-sm font-medium text-foreground">
          {title}
        </span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {count}
        </span>
        {badge && (
          <Badge variant={badge.variant} size="sm">
            {badge.label}
          </Badge>
        )}
      </button>

      {/* Collapsible content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
            className="-mx-4 px-4"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
