/**
 * Utility functions for the Settings module
 */

/**
 * Mask phone number to hide sensitive digits
 * @param number - Phone number to mask
 * @returns Masked phone number
 */
export function maskPhone(number: string | null | undefined): string {
  if (!number) return 'Not provided'
  
  // Remove any non-digit characters for processing
  const digits = number.replace(/\D/g, '')
  
  if (digits.length < 4) return number
  
  // For Indian numbers (+91 XXXXX XXXXX), show country code and mask middle digits
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+91 XXXXX ${digits.slice(-5)}`
  }
  
  // For 10-digit numbers, mask middle digits
  if (digits.length === 10) {
    return `${digits.slice(0, 2)}XXXXX${digits.slice(-3)}`
  }
  
  // For other formats, show first 2 and last 3 digits
  const visible = Math.min(5, digits.length)
  const masked = 'X'.repeat(Math.max(0, digits.length - visible))
  
  return `${digits.slice(0, 2)}${masked}${digits.slice(-3)}`
}

/**
 * Extract only digits from a phone number
 * @param input - Input string that may contain phone number
 * @returns String containing only digits
 */
export function onlyDigits(input: string | null | undefined): string {
  if (!input) return ''
  return input.replace(/\D/g, '')
}

/**
 * Generate initials from a person's name
 * @param name - Full name
 * @returns Initials (max 2 characters)
 */
export function initialsFromName(name: string | null | undefined): string {
  if (!name || !name.trim()) return 'VN' // Default to VetNefits
  
  const words = name.trim().split(/\s+/)
  
  if (words.length === 1) {
    // Single word - take first 2 characters
    return words[0].slice(0, 2).toUpperCase()
  }
  
  // Multiple words - take first character of first two words
  return words
    .slice(0, 2)
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
}

/**
 * Format currency amount for display
 * @param amount - Amount in smallest currency unit (paise for INR)
 * @param currency - Currency code
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number | null | undefined, currency: string = 'INR'): string {
  if (amount === null || amount === undefined) return '₹0.00'
  
  const value = amount / 100 // Convert paise to rupees
  
  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(value)
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value)
}

/**
 * Format subscription status for display
 * @param status - Subscription status
 * @returns Formatted status with appropriate styling
 */
export function formatSubscriptionStatus(status: string): {
  label: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
  color: string
} {
  switch (status.toLowerCase()) {
    case 'active':
      return { label: 'Active', variant: 'default', color: 'text-green-600' }
    case 'trial':
      return { label: 'Trial', variant: 'secondary', color: 'text-blue-600' }
    case 'expired':
      return { label: 'Expired', variant: 'destructive', color: 'text-red-600' }
    case 'inactive':
      return { label: 'Inactive', variant: 'outline', color: 'text-gray-600' }
    default:
      return { label: status, variant: 'outline', color: 'text-gray-600' }
  }
}

/**
 * Generate WhatsApp message URL
 * @param phoneNumber - Phone number (with country code)
 * @param message - Message to send
 * @returns WhatsApp URL
 */
export function generateWhatsAppUrl(phoneNumber: string, message: string = ''): string {
  const cleanNumber = onlyDigits(phoneNumber)
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${cleanNumber}${message ? `?text=${encodedMessage}` : ''}`
}

/**
 * Validate phone number format
 * @param phone - Phone number to validate
 * @returns Boolean indicating if phone is valid
 */
export function isValidPhoneNumber(phone: string): boolean {
  const digits = onlyDigits(phone)
  
  // Indian mobile numbers: 10 digits starting with 6-9
  if (digits.length === 10 && /^[6-9]/.test(digits)) {
    return true
  }
  
  // International format with country code
  if (digits.length >= 10 && digits.length <= 15) {
    return true
  }
  
  return false
}

/**
 * Format date for display
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return 'Not set'
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(dateObj.getTime())) return 'Invalid date'
  
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj)
}

/**
 * Check if subscription is expiring soon (within 7 days)
 * @param validTill - Subscription valid till date
 * @returns Boolean indicating if expiring soon
 */
export function isSubscriptionExpiringSoon(validTill: string | Date | null | undefined): boolean {
  if (!validTill) return false
  
  const expiryDate = typeof validTill === 'string' ? new Date(validTill) : validTill
  const now = new Date()
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  
  return expiryDate <= sevenDaysFromNow && expiryDate > now
}