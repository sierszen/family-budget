import bcrypt from 'bcryptjs'

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Hasło musi mieć co najmniej 8 znaków')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Hasło musi zawierać co najmniej jedną wielką literę')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Hasło musi zawierać co najmniej jedną małą literę')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Hasło musi zawierać co najmniej jedną cyfrę')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}
