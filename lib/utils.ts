import { ChatMessagePart } from '@/types';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

const CONTENT_PATTERNS = {
  sheet: {
    pattern: /(```sheet.*?```)/s,
    extract: (match: string) => match.match(/```sheet(.*?)```/s)?.[1] || '',
  },
  image: {
    pattern: /(```image.*?```)/s,
    extract: (match: string) => match.match(/```image(.*?)```/s)?.[1] || '',
  },
  card: {
    pattern: /(```card.*?```)/s,
    extract: (match: string) => match.match(/```card(.*?)```/s)?.[1] || '',
  },
  // 可以继续添加其他类型的模式
};

export const parseMessageContent = (content: string): ChatMessagePart[] => {
  try {
    // 如果没有特殊格式，直接返回文本
    if (!Object.keys(CONTENT_PATTERNS).some(type => content.includes(`\`\`\`${type}`))) {
      return [{ type: 'text', content: content.trim() }];
    }

    // 构建分割正则
    const splitPattern = new RegExp(
      Object.values(CONTENT_PATTERNS)
        .map(({ pattern }) => pattern.source)
        .join('|'),
      's'
    );

    // 分割内容
    const segments = content.split(splitPattern);

    return segments
      .map(segment => {
        if (!segment) return null;
        // 检查是否是特殊格式
        for (const [, { pattern, extract }] of Object.entries(CONTENT_PATTERNS)) {
          if (segment.match(pattern)) {
            return JSON.parse(extract(segment));
          }
        }

        return { type: 'text', content: segment.trim() };
      })
      .filter(Boolean);
  } catch (error) {
    return [];
  }
};
