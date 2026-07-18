/**
 * UTILIDAD DE ENCRIPTACIÓN - IÓN MAX
 * Encriptación de datos sensibles para retiros y pagos
 * NOTA: En producción, usar una biblioteca criptográfica robusta como crypto-js o la Web Crypto API
 */

// Función simple de encriptación base64 (para demostración)
// En producción, usar AES-256 o similar
export function encryptData(data: string): string {
  try {
    // Convertir a base64 (encriptación básica para demo)
    const encoded = btoa(encodeURIComponent(data));
    return encoded;
  } catch (error) {
    console.error('Error encriptando datos:', error);
    throw new Error('No se pudo encriptar los datos');
  }
}

// Función simple de desencriptación base64
export function decryptData(encryptedData: string): string {
  try {
    const decoded = decodeURIComponent(atob(encryptedData));
    return decoded;
  } catch (error) {
    console.error('Error desencriptando datos:', error);
    throw new Error('No se pudo desencriptar los datos');
  }
}

// Encriptar datos bancarios sensibles
export function encryptBankData(bankData: {
  accountNumber: string;
  routingNumber?: string;
  bankName?: string;
  accountHolderName: string;
}): string {
  const dataString = JSON.stringify(bankData);
  return encryptData(dataString);
}

// Desencriptar datos bancarios sensibles
export function decryptBankData(encryptedData: string): {
  accountNumber: string;
  routingNumber?: string;
  bankName?: string;
  accountHolderName: string;
} {
  const dataString = decryptData(encryptedData);
  return JSON.parse(dataString);
}

// Encriptar datos de PayPal
export function encryptPayPalData(payPalData: {
  email: string;
}): string {
  const dataString = JSON.stringify(payPalData);
  return encryptData(dataString);
}

// Desencriptar datos de PayPal
export function decryptPayPalData(encryptedData: string): {
  email: string;
} {
  const dataString = decryptData(encryptedData);
  return JSON.parse(dataString);
}

// Encriptar datos de tarjeta (CUIDADO: Nunca almacenar CVV en producción)
export function encryptCardData(cardData: {
  lastFourDigits: string;
  cardType: string;
  cardHolderName: string;
}): string {
  const dataString = JSON.stringify(cardData);
  return encryptData(dataString);
}

// Desencriptar datos de tarjeta
export function decryptCardData(encryptedData: string): {
  lastFourDigits: string;
  cardType: string;
  cardHolderName: string;
} {
  const dataString = decryptData(encryptedData);
  return JSON.parse(dataString);
}

// Generar un hash simple para verificación (en producción, usar SHA-256)
export function generateHash(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convertir a 32-bit integer
  }
  return Math.abs(hash).toString(16);
}

// Enmascarar datos sensibles para mostrar en UI
export function maskAccountNumber(accountNumber: string, showLast: number = 4): string {
  if (!accountNumber) return '••••••••';
  const lastDigits = accountNumber.slice(-showLast);
  return `••••••••${lastDigits}`;
}

export function maskEmail(email: string): string {
  if (!email) return '••••@••••.com';
  const [local, domain] = email.split('@');
  const maskedLocal = local.slice(0, 2) + '••••';
  return `${maskedLocal}@${domain}`;
}
