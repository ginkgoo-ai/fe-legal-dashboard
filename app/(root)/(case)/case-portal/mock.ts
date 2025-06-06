import { CaseStatusEnum, ICaseItemType } from '@/types/case';

export const mockCaseList: ICaseItemType[] = [
  {
    id: '44c6cd75-b7c4-4e27-b643-ab14c15ee3a0',
    title: '知识产权案例（已更新）',
    caseType: 'Skilled Worker Visa',
    description: '这是一个更新后的知识产权侵权案例描述',
    profileId: 'profile-123',
    clientId: null,
    status: CaseStatusEnum.ANALYZING,
    startDate: null,
    endDate: null,
    clientName: null,
    profileName: null,
    createdAt: '2025-05-19T09:34:05',
    updatedAt: '2025-05-19T09:34:49',
    documentsCount: 2,
    eventsCount: 0,
    timestamp: 1749205388167,
  },
];

export const mockVisaTypeOptions = [
  { value: 'Skilled Worker Visa', label: 'Skilled Worker Visa' },
  { value: 'Skilled Worker Visa', label: 'Skilled Worker Visa' },
  { value: 'Skilled Worker Visa', label: 'Skilled Worker Visa' },
  { value: 'Skilled Worker Visa', label: 'Skilled Worker Visa' },
];

export const mockLayerTypeOptions = [
  { value: 'Skilled Worker Visa', label: 'Skilled Worker Visa' },
  { value: 'Skilled Worker Visa', label: 'Skilled Worker Visa' },
  { value: 'Skilled Worker Visa', label: 'Skilled Worker Visa' },
  { value: 'Skilled Worker Visa', label: 'Skilled Worker Visa' },
];
