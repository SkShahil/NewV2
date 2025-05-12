import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get initials from a name or text
 * @param name The name to get initials from
 * @returns The first two initials
 */
export function getInitials(name: string): string {
  if (!name) return "?";
  
  const parts = name.split(/[\s.-]+/).filter(Boolean);
  
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
}

/**
 * Format seconds into a MM:SS time format
 * @param seconds Total seconds
 * @returns Formatted time string (MM:SS)
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');
  
  return `${formattedMinutes}:${formattedSeconds}`;
}

/**
 * Truncate text to a specific length
 * @param text Text to truncate
 * @param maxLength Maximum length
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Shuffle an array (Fisher-Yates algorithm)
 * @param array Array to shuffle
 * @returns New shuffled array
 */
export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

/**
 * Safely converts a Firestore timestamp or other date format to a JavaScript Date object
 * @param dateValue - The date value to convert (can be Firebase Timestamp, Date object, timestamp in seconds, or string)
 * @param fallback - Optional fallback date if conversion fails (defaults to current date)
 * @returns JavaScript Date object
 */
export function safelyConvertFirestoreTimestamp(dateValue: any, fallback: Date = new Date()): Date {
  try {
    if (!dateValue) {
      return fallback;
    }
    
    if (dateValue instanceof Date) {
      return dateValue;
    }
    
    if (dateValue.toDate && typeof dateValue.toDate === 'function') {
      // Firebase Timestamp object with toDate() method
      return dateValue.toDate();
    }
    
    if (dateValue.seconds) {
      // Firestore timestamp in seconds format
      return new Date(dateValue.seconds * 1000);
    }
    
    // Try to parse as date string or timestamp
    const parsedDate = new Date(dateValue);
    return isNaN(parsedDate.getTime()) ? fallback : parsedDate;
  } catch (err) {
    console.error("Error parsing date value:", err);
    return fallback;
  }
}

/**
 * Safely formats a date value to a string with the specified format
 * @param dateValue - The date value to format (can be any format supported by safelyConvertFirestoreTimestamp)
 * @param formatType - The format type: 'date', 'datetime', 'relative', 'time' (default: 'date')
 * @returns Formatted date string
 */
export function safelyFormatDate(
  dateValue: any, 
  formatType: 'date' | 'datetime' | 'relative' | 'time' = 'date'
): string {
  try {
    const date = safelyConvertFirestoreTimestamp(dateValue);
    
    switch (formatType) {
      case 'datetime':
        return date.toLocaleString();
      case 'time':
        return date.toLocaleTimeString();
      case 'relative':
        // Simple relative time formatting
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);
        
        if (diffDay > 30) {
          return date.toLocaleDateString();
        } else if (diffDay > 0) {
          return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
        } else if (diffHour > 0) {
          return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
        } else if (diffMin > 0) {
          return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
        } else {
          return 'Just now';
        }
      case 'date':
      default:
        return date.toLocaleDateString();
    }
  } catch (err) {
    console.error("Error formatting date:", err);
    return 'Unknown date';
  }
}
