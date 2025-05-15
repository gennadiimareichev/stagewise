// SPDX-License-Identifier: AGPL-3.0-only
// Button component
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
  Button as HeadlessButton,
  type ButtonProps as HeadlessButtonProps,
} from '@headlessui/react';
import { forwardRef } from 'preact/compat';
import type { VNode } from 'preact';
import { cn } from '@/utils';

export interface ButtonProps extends HeadlessButtonProps {
  children?: VNode;
  className?: string;
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  icon?: VNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { children, className, variant = 'default', size = 'md', icon, ...props },
    ref,
  ) => {
    const sizeClasses = {
      sm: 'h-7 gap-1 rounded-md px-2 py-0.5 text-xs',
      md: 'h-8 gap-1.5 rounded-md px-3 py-1.5 text-sm',
      lg: 'h-9 gap-1.5 rounded-md px-4 py-1.5 text-base',
      icon: 'h-8 w-8 p-1.5 rounded-md',
    };

    const variantClasses = {
      default:
        'bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus-visible:ring-blue-500/50',
      destructive:
        'bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:ring-red-500/50',
      outline:
        'border border-zinc-200 bg-transparent shadow-sm hover:bg-zinc-100 focus-visible:ring-blue-500/50',
      secondary:
        'bg-zinc-200 text-zinc-900 shadow-sm hover:bg-zinc-300 focus-visible:ring-zinc-400/50',
      ghost: 'bg-transparent hover:bg-zinc-100 focus-visible:ring-blue-500/50',
      link: 'bg-transparent text-blue-600 underline-offset-4 hover:underline focus-visible:ring-blue-500/50',
    };

    const baseStyle =
      'inline-flex items-center justify-center font-medium transition-colors duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

    return (
      <HeadlessButton
        ref={ref}
        {...props}
        className={cn(
          baseStyle,
          sizeClasses[size],
          variantClasses[variant],
          className,
        )}
      >
        {icon}
        {children}
      </HeadlessButton>
    );
  },
);

Button.displayName = 'Button';
