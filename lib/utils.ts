import { CaseStatusEnum, ChatMessagePart, ICaseItemType } from '@/types';
import { type ClassValue, clsx } from 'clsx';
import dayjs from 'dayjs';
import { twMerge } from 'tailwind-merge';

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

const CASE_STATUS_MAP = {
  [CaseStatusEnum.ANALYZING]: {
    colorBackground: '#EEE5FF',
    colorText: '#8950FC',
    text: 'Analyzing',
  },
  [CaseStatusEnum.PROGRESS]: {
    colorBackground: '#F1FAFF',
    colorText: '#00A3FF',
    text: 'In Progress',
  },
  [CaseStatusEnum.READY]: {
    colorBackground: '#C9F7F5',
    colorText: '#1BC5BD',
    text: 'Ready to Fill',
  },
  [CaseStatusEnum.AUTO_FILLING]: {
    colorBackground: '#EEE5FF',
    colorText: '#8950FC',
    text: 'Auto-Filling',
  },
  [CaseStatusEnum.HOLD]: {
    colorBackground: '#FFF4DE',
    colorText: '#FFA800',
    text: 'On Hold',
  },
  [CaseStatusEnum.FINAL_REVIEW]: {
    colorBackground: '#FFF4DE',
    colorText: '#FFA800',
    text: 'Final Review',
  },
  [CaseStatusEnum.DEFAULT]: {
    colorBackground: '#F5F5F5',
    colorText: '#999999',
    text: '',
  },
};

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
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

export const parseCaseInfo = (caseInfo: ICaseItemType): ICaseItemType => {
  const profileVaultDocumentList =
    caseInfo?.documents?.map((itemDocument: any) => {
      const metadataForFrontObject = itemDocument.metadataJson
        ? JSON.parse(itemDocument.metadataJson)
        : {};
      return {
        ...itemDocument,
        metadataForFrontObject,
        metadataForFrontList: metadataForFrontObject
          ? Object.keys(metadataForFrontObject).map((key: any) => {
              return {
                key,
                value: JSON.stringify(metadataForFrontObject[key]),
              };
            })
          : [],
        timestamp: +dayjs(),
      };
    }) || [];
  const fill_data: Record<string, unknown> = {};

  profileVaultDocumentList.forEach(
    (item: { documentType: string; metadataForFrontObject: any }, index: number) => {
      fill_data[item.documentType] = item.metadataForFrontObject;
    }
  );

  return {
    ...caseInfo,
    fillDataForFront: fill_data,
    profileVaultDocumentListForFront: profileVaultDocumentList,
    caseStatusForFront:
      CASE_STATUS_MAP[caseInfo.status] || CASE_STATUS_MAP[CaseStatusEnum.DEFAULT],
  };
};
