import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class strings and resolves Tailwind CSS conflicts
 * 
 * @param {...string} inputs - Class strings to be combined
 * @returns {string} - Combined class string with conflicts resolved
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
} 