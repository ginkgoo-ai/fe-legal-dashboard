import { z } from 'zod';
import { COUNTRIES_CODE } from './countriesCode';

export const PHONE_PATTERNS = {
  CN: {
    pattern: /^1[3-9]\d{9}$/,
    example: '13812345678',
    description: '11 number, start with 1',
  },
  US: {
    pattern: /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
    example: '(123) 456-7890',
    description: '10 number, format: (123) 456-7890',
  },
  UK: {
    pattern: /^0?[1-9]\d{8,9}$/,
    example: '7123456789',
    description: '10-11 number',
  },
  Default: {
    pattern: /^0?\d{9,10}$/,
    example: '312345678',
    description: '10-11 number',
  },
} as const;

export const getCountryByCode = (code: string): keyof typeof COUNTRIES_CODE | null => {
  const entry = Object.entries(COUNTRIES_CODE).find(
    ([, value]) => value.phoneCode === code,
  );
  return entry ? (entry[0] as keyof typeof COUNTRIES_CODE) : null;
};

// !!! don't use this schema for country code validation
export const countryCodeSchema = z
  .string()
  .refine(
    value => {
      const cleanValue = value.replace(/\s+/g, '');
      return Object.values(COUNTRIES_CODE)
        .map(item => item.phoneCode)
        .includes(cleanValue);
    },
    {
      message: 'Invalid country code.',
    },
  )
  .transform(value => value.replace(/\s+/g, ''));

// !!! don't use this schema for phone number validation
export const phoneNumberSchema = z
  .string()
  .min(1, 'Phone number is required')
  .refine(
    value => {
      const cleanValue = value.replace(/[^\d]/g, '');
      return cleanValue.length >= 10 && cleanValue.length <= 15;
    },
    {
      message: 'Invalid phone number format',
    },
  );

// !!! use this schema for phone number validation
export const phoneValidationSchema = z
  .object({
    countryCode: countryCodeSchema,
    phoneNumber: phoneNumberSchema,
  })
  .superRefine((data, ctx) => {
    const country = getCountryByCode(data.countryCode);

    if (!country) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid country code',
        path: ['countryCode'],
      });
      return;
    }

    const pattern = (PHONE_PATTERNS as any)[country] ?? PHONE_PATTERNS.Default;
    const cleanNumber = data.phoneNumber.replace(/[^\d]/g, '');

    if (!pattern.pattern.test(cleanNumber)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Invalid phone number format for ${country}. ${pattern.description}. Example: ${pattern.example}`,
        path: ['phoneNumber'],
      });
      return;
    }
  })
  .transform(data => {
    const country = getCountryByCode(data.countryCode)!;
    const cleanNumber = data.phoneNumber.replace(/[^\d]/g, '');

    return {
      country,
      countryCode: data.countryCode,
      phoneNumber: cleanNumber,
      fullNumber: `(${data.countryCode}) ${cleanNumber}`,
    };
  });

// 格式化特定国家的电话号码
export function formatPhoneNumber(phoneNumber: string, countryCode: string): string {
  const country = getCountryByCode(countryCode);
  if (!country) return phoneNumber;

  const cleaned = phoneNumber.replace(/[^\d]/g, '');

  switch (country) {
    case 'US':
      if (cleaned.length !== 10) return phoneNumber;
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;

    case 'CN':
      if (cleaned.length !== 11) return phoneNumber;
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`;

    default:
      return cleaned;
  }
}

// 验证并格式化电话号码的辅助函数
export function validateAndFormatPhone(countryCode: string, phoneNumber: string) {
  try {
    const result = phoneValidationSchema.parse({
      countryCode,
      phoneNumber,
    });
    return {
      success: true,
      data: result,
      error: null,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        data: null,
        error: error.errors[0].message,
      };
    }
    return {
      success: false,
      data: null,
      error: 'Invalid phone number',
    };
  }
}

export const workspaceDomainSchema = z
  .string()
  // 基础长度校验
  .min(1, {
    message: 'Length Violation\nMust be between 1-64 characters.',
  })
  .max(32, {
    message: 'Length Violation\nMust be between 1-64 characters.',
  })
  // 格式校验：只允许小写字母和数字
  .refine(val => /^[a-z0-9]+$/.test(val), {
    message: 'Invalid Characters\nOnly lowercase letters (a-z) and numbers are allowed.',
  });
