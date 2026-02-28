'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/hooks/useAppStore';
import { IconX } from '@/components/ui/Icons';

export function DetailPanel() {
  const { selectedTaskId, selectTask } = useAppStore();

  return (
    <div className="flex-1 min-w-0">
      <AnimatePresence mode="wait">
        {selectedTaskId ? (
          <motion.aside
            key="detail-panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.15 } }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            className="h-full bg-card overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-border">
              <span className="text-sm text-muted-foreground">Task detail</span>
              <button
                onClick={() => selectTask(null)}
                className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close panel"
              >
                <IconX size={16} />
              </button>
            </div>

            {/* Content placeholder — will be built in Step 4 */}
            <div className="p-6 max-w-2xl">
              <p className="text-sm text-muted-foreground">
                Task detail panel content will be built in the next step.
              </p>
              <p className="text-xs text-muted-foreground/60 mt-2">
                ID: {selectedTaskId}
              </p>
            </div>
          </motion.aside>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground/40 text-sm">
            Select a task to see details
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
