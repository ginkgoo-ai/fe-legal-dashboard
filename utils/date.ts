import { format } from 'date-fns';

export function formatDate(dateString: string | Date): string {
  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return '';
    }
    return format(date, 'MMM d, yyyy');
  } catch (error) {
    console.error(error);
    return '';
  }
}
