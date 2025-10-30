import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  if (!date) return 'N/A';
  
  try {
    // Si date es una cadena, convertirla a objeto Date
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Verificar si la fecha es válida
    if (isNaN(dateObj.getTime())) {
      return 'Fecha inválida';
    }
    
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(dateObj);
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return 'Error de formato';
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}