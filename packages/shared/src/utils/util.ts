import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
export function formatCompact(value:number){return new Intl.NumberFormat('en',{notation:'compact',maximumFractionDigits:1}).format(value)}
export function formatCurrency(value:number,currency='USD'){return new Intl.NumberFormat('en',{style:'currency',currency,maximumFractionDigits:0}).format(value)}
