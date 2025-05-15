// SPDX-License-Identifier: AGPL-3.0-only
// Badge component
// Copyright (C) 2025 Goetze, Scharpff & Toews GbR

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Affero General Public License for more details.

// You should have received a copy of the GNU Affero General Public License
// along with this program. If not, see <https://www.gnu.org/licenses/>.

import {
  Button,
  type ButtonProps as HeadlessButtonProps,
} from '@headlessui/react';
import { forwardRef } from 'preact/compat';
import type { VNode } from 'preact';
import { cn } from '@/utils';

export interface BadgeProps extends HeadlessButtonProps {
  children?: VNode;
  className?: string;
  selected?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Badge = forwardRef<HTMLButtonElement, BadgeProps>(
  ({ children, className, selected = false, size = 'md', ...props }, ref) => {
    const sizeClasses = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-0.5 text-sm',
      lg: 'px-3 py-1 text-base',
    };

    const baseStyle =
      'inline-flex items-center justify-center rounded-full font-semibold transition-colors duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2';

    // Selected: blue border, blue background
    const selectedStyle =
      'border border-blue-600 bg-blue-500/85 text-blue-50 hover:bg-blue-600/60';
    // Unselected: very light grey
    const unselectedStyle =
      'border border-zinc-200/65 bg-zinc-200/65 text-zinc-700/30 hover:bg-zinc-300/90';

    return (
      <Button
        ref={ref}
        {...props}
        className={cn(
          baseStyle,
          sizeClasses[size],
          selected ? selectedStyle : unselectedStyle,
          className,
        )}
      >
        {children}
      </Button>
    );
  },
);

Badge.displayName = 'Badge';
