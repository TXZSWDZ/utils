interface PasswordOptions {
  length?: number
  useLowercase?: boolean
  useUppercase?: boolean
  useDigits?: boolean
  useSpecial?: boolean
  excludeAmbiguous?: boolean
}

interface PasswordStrength {
  lengthOk: boolean
  hasLowercase: boolean
  hasUppercase: boolean
  hasDigit: boolean
  hasSpecial: boolean
  score: number
  strength: 'weak' | 'medium' | 'strong'
}

export class PasswordGenerator {
  private readonly lowercase: string = 'abcdefghijklmnopqrstuvwxyz'
  private readonly uppercase: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  private readonly digits: string = '0123456789'
  private readonly specialChars: string = '!@#$%^&*()_+-=[]{}|;:,.<>?'
  private readonly ambiguousChars: string = 'l1Io0O'

  /**
   * 生成随机密码
   * @param options 密码生成选项
   * @returns 生成的随机密码
   */
  public generate(options: PasswordOptions = {}): string {
    const {
      length = 8,
      useLowercase = true,
      useUppercase = true,
      useDigits = true,
      useSpecial = true,
      excludeAmbiguous = true,
    } = options

    if (length < 8) {
      throw new Error('Password length must be at least 8')
    }

    // 构建字符集
    const charSets: string[] = []
    if (useLowercase) {
      charSets.push(this.getLowercase(excludeAmbiguous))
    }
    if (useUppercase) {
      charSets.push(this.getUppercase(excludeAmbiguous))
    }
    if (useDigits) {
      charSets.push(this.getDigits(excludeAmbiguous))
    }
    if (useSpecial) {
      charSets.push(this.getSpecialChars(excludeAmbiguous))
    }

    if (charSets.length === 0) {
      throw new Error('At least one character type must be selected')
    }

    // 确保每种类型至少有一个字符
    const password: string[] = []
    if (useLowercase) {
      password.push(this.getRandomChar(this.getLowercase(excludeAmbiguous)))
    }
    if (useUppercase) {
      password.push(this.getRandomChar(this.getUppercase(excludeAmbiguous)))
    }
    if (useDigits) {
      password.push(this.getRandomChar(this.getDigits(excludeAmbiguous)))
    }
    if (useSpecial) {
      password.push(this.getRandomChar(this.getSpecialChars(excludeAmbiguous)))
    }

    // 填充剩余长度
    const allChars = charSets.join('')
    const remainingLength = length - password.length
    for (let i = 0; i < remainingLength; i++) {
      password.push(this.getRandomChar(allChars))
    }

    // 打乱顺序
    return this.shuffleArray(password).join('')
  }

  /**
   * 验证密码强度
   * @param password 要验证的密码
   * @param minLength 最小长度要求 (默认8)
   * @returns 密码强度分析结果
   */
  public validateStrength(password: string, length: number = 8): PasswordStrength {
    const result = {
      lengthOk: password.length >= length,
      hasLowercase: false,
      hasUppercase: false,
      hasDigit: false,
      hasSpecial: false,
      score: 0,
      strength: 'weak' as 'weak' | 'medium' | 'strong',
    }

    // 检查字符类型
    for (const char of password) {
      if (this.lowercase.includes(char))
        result.hasLowercase = true
      if (this.uppercase.includes(char))
        result.hasUppercase = true
      if (this.digits.includes(char))
        result.hasDigit = true
      if (this.specialChars.includes(char))
        result.hasSpecial = true
    }

    // 计算分数 (0-100)
    result.score = 0
    if (result.lengthOk)
      result.score += 25
    if (result.hasLowercase)
      result.score += 15
    if (result.hasUppercase)
      result.score += 15
    if (result.hasDigit)
      result.score += 20
    if (result.hasSpecial)
      result.score += 25

    // 评估强度
    if (result.score < 50) {
      result.strength = 'weak'
    }
    else if (result.score < 75) {
      result.strength = 'medium'
    }
    else {
      result.strength = 'strong'
    }

    return result
  }

  private getLowercase(excludeAmbiguous: boolean): string {
    return excludeAmbiguous
      ? this.filterAmbiguousChars(this.lowercase)
      : this.lowercase
  }

  private getUppercase(excludeAmbiguous: boolean): string {
    return excludeAmbiguous
      ? this.filterAmbiguousChars(this.uppercase)
      : this.uppercase
  }

  private getDigits(excludeAmbiguous: boolean): string {
    return excludeAmbiguous
      ? this.filterAmbiguousChars(this.digits)
      : this.digits
  }

  private getSpecialChars(excludeAmbiguous: boolean): string {
    // 特殊字符通常不包含易混淆字符，所以这里直接返回
    return this.specialChars
  }

  private filterAmbiguousChars(chars: string): string {
    return [...chars].filter(c => !this.ambiguousChars.includes(c)).join('')
  }

  private getRandomChar(charSet: string): string {
    const randomIndex = Math.floor(Math.random() * charSet.length)
    return charSet[randomIndex]
  }

  private shuffleArray(array: any[]): any[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]
    }
    return array
  }
}

interface UsePasswordReturn {
  generate: (options?: PasswordOptions) => string
  validateStrength: (password: string, length?: number) => PasswordStrength
}

let passwordGenerator: PasswordGenerator
export function usePassword(): UsePasswordReturn {
  if (!passwordGenerator) {
    passwordGenerator = new PasswordGenerator()
  }
  return {
    generate: (options: PasswordOptions = {}) => passwordGenerator.generate(options),
    validateStrength: (password: string, length: number = 8) => passwordGenerator.validateStrength(password, length),
  }
}
