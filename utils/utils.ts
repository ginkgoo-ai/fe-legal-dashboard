import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * @param durationMs 持续时间（毫秒）
 * @returns e.g. 3:01, 1:34:56
 */
export const timeDuration = (durationMs: number): string => {
  if (!durationMs) return '0:00';

  const totalSeconds = Math.floor(durationMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // 格式化为两位数显示
  const pad = (n: number) => n.toString().padStart(2, '0');

  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${minutes}:${pad(seconds)}`;
};

/**
 * @description 格式化文件大小
 * @example 1024 => 1.00KB, 1024 * 1024 => 1.00MB, 1024 * 1024 * 1024 => 1.00GB
 * @param bytes 文件大小（字节）
 * @param decimals
 * @returns
 */
export const fileSizeFormat = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};
