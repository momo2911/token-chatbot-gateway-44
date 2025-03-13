
// Email validation regex
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password strength checker
export const isStrongPassword = (password: string): boolean => {
  // At least 6 characters, 1 uppercase letter, and 1 number
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
  return passwordRegex.test(password);
};

// Check if a string contains only alphanumeric characters
export const isAlphanumeric = (text: string): boolean => {
  const alphanumericRegex = /^[a-zA-Z0-9]+$/;
  return alphanumericRegex.test(text);
};

// Check if a chat message is valid (not empty and within character limit)
export const isValidChatMessage = (message: string, maxLength: number = 1000): boolean => {
  return message.trim().length > 0 && message.length <= maxLength;
};

// Check if a string is within a certain length
export const isWithinLength = (text: string, min: number, max: number): boolean => {
  return text.length >= min && text.length <= max;
};

// Check if a string contains sensitive information (credit card, SSN)
export const containsSensitiveInfo = (text: string): boolean => {
  const creditCardRegex = /\b(?:\d[ -]*?){13,16}\b/;
  const ssnRegex = /\b\d{3}[-]?\d{2}[-]?\d{4}\b/;
  
  return creditCardRegex.test(text) || ssnRegex.test(text);
};
