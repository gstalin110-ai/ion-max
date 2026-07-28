/**
 * Sanitizador de Inputs - IÓN MAX
 * Sanitización manual de inputs para prevenir XSS e inyecciones
 * Sin dependencias externas
 */

/**
 * Escapa caracteres HTML peligrosos
 */
export function escapeHtml(unsafe: string): string {
  if (typeof unsafe !== 'string') return '';
  
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Sanitiza texto para prevenir XSS
 */
export function sanitizeText(text: string): string {
  if (typeof text !== 'string') return '';
  
  // Remover caracteres de control
  let sanitized = text.replace(/[\x00-\x1F\x7F]/g, '');
  
  // Escapar HTML
  sanitized = escapeHtml(sanitized);
  
  // Limitar longitud (previene ataques de buffer overflow)
  const MAX_LENGTH = 10000;
  if (sanitized.length > MAX_LENGTH) {
    sanitized = sanitized.substring(0, MAX_LENGTH);
  }
  
  return sanitized;
}

/**
 * Sanitiza email
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') return '';
  
  const sanitized = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(sanitized)) {
    return '';
  }
  
  return sanitized;
}

/**
 * Sanitiza URL
 */
export function sanitizeUrl(url: string): string {
  if (typeof url !== 'string') return '';
  
  try {
    const parsed = new URL(url);
    
    // Solo permitir http y https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '';
    }
    
    // Prevenir javascript: protocol
    if (url.toLowerCase().startsWith('javascript:')) {
      return '';
    }
    
    return parsed.toString();
  } catch {
    return '';
  }
}

/**
 * Sanitiza número de teléfono (Ecuador)
 */
export function sanitizePhone(phone: string): string {
  if (typeof phone !== 'string') return '';
  
  // Remover todo excepto dígitos
  const sanitized = phone.replace(/\D/g, '');
  
  // Validar formato de Ecuador (9 o 10 dígitos)
  if (sanitized.length === 9) {
    return '+593' + sanitized;
  } else if (sanitized.length === 10 && sanitized.startsWith('0')) {
    return '+593' + sanitized.substring(1);
  } else if (sanitized.length === 10) {
    return '+593' + sanitized;
  } else if (sanitized.length === 12 && sanitized.startsWith('593')) {
    return '+' + sanitized;
  }
  
  return sanitized;
}

/**
 * Sanitiza nombre (solo letras, espacios y acentos)
 */
export function sanitizeName(name: string): string {
  if (typeof name !== 'string') return '';
  
  // Permitir letras, espacios, acentos y caracteres comunes en español
  const sanitized = name.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]/g, '');
  
  // Limitar longitud
  const MAX_LENGTH = 100;
  if (sanitized.length > MAX_LENGTH) {
    return sanitized.substring(0, MAX_LENGTH);
  }
  
  return sanitized.trim();
}

/**
 * Sanitiza ID de usuario (UUID)
 */
export function sanitizeUUID(uuid: string): string {
  if (typeof uuid !== 'string') return '';
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  if (uuidRegex.test(uuid)) {
    return uuid.toLowerCase();
  }
  
  return '';
}

/**
 * Sanitiza número decimal (precio)
 */
export function sanitizeDecimal(value: string | number): number {
  if (typeof value === 'number') {
    return Math.max(0, Math.min(value, 999999999.99));
  }
  
  if (typeof value === 'string') {
    const sanitized = value.replace(/[^0-9.]/g, '');
    const parsed = parseFloat(sanitized);
    
    if (!isNaN(parsed)) {
      return Math.max(0, Math.min(parsed, 999999999.99));
    }
  }
  
  return 0;
}

/**
 * Sanitiza texto largo (descripción, bio, etc.)
 */
export function sanitizeLongText(text: string): string {
  if (typeof text !== 'string') return '';
  
  // Remover scripts y eventos
  let sanitized = text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/g, '')
    .replace(/on\w+='[^']*'/g, '')
    .replace(/javascript:/gi, '');
  
  // Escapar HTML
  sanitized = escapeHtml(sanitized);
  
  // Limitar longitud
  const MAX_LENGTH = 50000;
  if (sanitized.length > MAX_LENGTH) {
    sanitized = sanitized.substring(0, MAX_LENGTH);
  }
  
  return sanitized;
}

/**
 * Sanitiza array de strings
 */
export function sanitizeStringArray(arr: string[]): string[] {
  if (!Array.isArray(arr)) return [];
  
  return arr
    .filter(item => typeof item === 'string')
    .map(item => sanitizeText(item))
    .filter(item => item.length > 0);
}

/**
 * Validador de objeto con sanitización
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  schema: Record<keyof T, (value: any) => any>
): Partial<T> {
  const sanitized: Partial<T> = {};
  
  for (const key in schema) {
    if (obj.hasOwnProperty(key)) {
      sanitized[key] = schema[key](obj[key]);
    }
  }
  
  return sanitized;
}

/**
 * Detecta si un string contiene contenido malicioso
 */
export function detectMaliciousContent(text: string): boolean {
  if (typeof text !== 'string') return false;
  
  const maliciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /eval\(/i,
    /expression\(/i,
    /fromCharCode/i,
    /document\.cookie/i,
    /document\.location/i,
    /window\.location/i,
  ];
  
  return maliciousPatterns.some(pattern => pattern.test(text));
}

/**
 * Sanitiza prompt para IA (previene prompt injection)
 */
export function sanitizeAIPrompt(prompt: string): string {
  if (typeof prompt !== 'string') return '';
  
  // Remover intentos de prompt injection
  let sanitized = prompt
    .replace(/ignore\s+(all\s+)?previous\s+instructions/gi, '')
    .replace(/forget\s+(everything|all)/gi, '')
    .replace(/system:\s*/gi, '')
    .replace(/assistant:\s*/gi, '')
    .replace(/user:\s*/gi, '');
  
  // Limitar longitud
  const MAX_LENGTH = 10000;
  if (sanitized.length > MAX_LENGTH) {
    sanitized = sanitized.substring(0, MAX_LENGTH);
  }
  
  return sanitized.trim();
}
