import { StepModeEnum } from '@/types/case';

export const mockStepListItems = [
  {
    title: 'Apply from outside the UK',
    descriptionText: 'Analyzing',
    mode: StepModeEnum.ACTION,
    actioncurrent: 0,
    actionlist: [
      {
        selector:
          "a[href='https://apply-to-visit-or-stay-in-the-uk.homeoffice.gov.uk/sort/start/skilled_worker_out_uk']",
        type: 'click' as const,
        actionresult: 'notFound' as const,
        actiontimestamp: '2025-06-11 16:11:35:843',
      },
    ],
  },
  {
    title: 'Apply from outside the UK(Repeat: 2)',
    descriptionText: 'Analyzing',
    mode: StepModeEnum.ACTION,
    actioncurrent: 0,
    actionlist: [
      {
        selector:
          "a[href='https://apply-to-visit-or-stay-in-the-uk.homeoffice.gov.uk/sort/start/skilled_worker_out_uk']",
        type: 'click' as const,
        actionresult: 'notFound' as const,
        actiontimestamp: '2025-06-11 16:11:35:843',
      },
    ],
  },
  {
    title: 'Where are you planning to live?',
    descriptionText: 'Analyzing',
    mode: StepModeEnum.ACTION,
    actioncurrent: 1,
    actionlist: [
      {
        selector: "input[id='out-of-crown-dependency']",
        type: 'click' as const,
        actionresult: 'success' as const,
        actiontimestamp: '2025-06-11 16:11:39:976',
      },
      {
        selector: "button[id='continue-button']",
        type: 'click' as const,
        actionresult: 'success' as const,
        actiontimestamp: '2025-06-11 16:11:40:985',
      },
    ],
  },
  {
    title: 'Do you have a current EU, EEA or Swiss passport?',
    descriptionText: 'Analyzing',
    mode: StepModeEnum.ACTION,
    actioncurrent: 1,
    actionlist: [
      {
        selector: "input[id='not-eea-applicable']",
        type: 'click' as const,
        actionresult: 'success' as const,
        actiontimestamp: '2025-06-11 16:11:45:001',
      },
      {
        selector: "input[id='continue-button']",
        type: 'click' as const,
        actionresult: 'success' as const,
        actiontimestamp: '2025-06-11 16:11:46:006',
      },
    ],
  },
  {
    title: 'Select a country to provide your biometrics',
    descriptionText: 'Analyzing',
    mode: StepModeEnum.ACTION,
    actioncurrent: 1,
    actionlist: [
      {
        selector: "input[id='countryCode_ui']",
        type: 'input' as const,
        value: 'United States of America',
        actionresult: 'success' as const,
        actiontimestamp: '2025-06-11 16:11:49:250',
      },
      {
        selector: "input[id='submit']",
        type: 'click' as const,
        actionresult: 'success' as const,
        actiontimestamp: '2025-06-11 16:11:50:260',
      },
    ],
  },
  {
    title: 'Check available visa application centre locations',
    descriptionText: 'Analyzing',
    mode: StepModeEnum.ACTION,
    actioncurrent: 1,
    actionlist: [
      {
        selector: "input[id='vacAvailabilityConfirmed_true']",
        type: 'click' as const,
        actionresult: 'success' as const,
        actiontimestamp: '2025-06-11 16:11:54:674',
      },
      {
        selector: "input[id='submit']",
        type: 'click' as const,
        actionresult: 'success' as const,
        actiontimestamp: '2025-06-11 16:11:55:683',
      },
    ],
  },
  {
    title: 'Skilled Worker visa',
    descriptionText: 'Analyzing',
    mode: StepModeEnum.ACTION,
    actioncurrent: 1,
    actionlist: [
      {
        selector:
          "a[href='https://apply-to-visit-or-stay-in-the-uk.homeoffice.gov.uk/sort/start/skilled_worker_out_uk']",
        type: 'click' as const,
        actionresult: 'notFound' as const,
        actiontimestamp: '2025-06-11 16:12:00:069',
      },
      {
        selector: "a[href='/start/skilled-worker-ooc']",
        type: 'click' as const,
        actionresult: 'success' as const,
        actiontimestamp: '2025-06-11 16:12:01:084',
      },
    ],
  },
  {
    title: 'Do you want to start a new application?',
    descriptionText: 'Analyzing',
    mode: StepModeEnum.ACTION,
    actioncurrent: 0,
    actionlist: [
      {
        selector: "a[id='forceStart']",
        type: 'click' as const,
        actionresult: 'success' as const,
        actiontimestamp: '2025-06-11 16:12:04:280',
      },
    ],
  },
  {
    title: 'Register an email',
    descriptionText: 'Analyzing',
    mode: StepModeEnum.ACTION,
    actioncurrent: 1,
    actionlist: [
      {
        selector: "input[id='email']",
        type: 'input' as const,
        value: 'ginkgo20250003@chefalicious.com',
        actionresult: 'success' as const,
        actiontimestamp: '2025-06-11 16:54:17:156',
      },
      {
        selector: "input[id='password1']",
        type: 'manual' as const,
        actionresult: 'manual' as const,
        actiontimestamp: '2025-06-11 16:54:18:160',
      },
      {
        selector: "input[id='password2']",
        type: 'manual' as const,
      },
      {
        selector: "input[id='submit']",
        type: 'click' as const,
      },
    ],
  },
  {
    title: 'Register an email(Repeat: 2)',
    descriptionText: 'Analyzing',
    mode: StepModeEnum.ACTION,
    actioncurrent: 1,
    actionlist: [
      {
        selector: "input[id='email']",
        type: 'input' as const,
        value: 'ginkgo20250003@chefalicious.com',
        actionresult: 'success' as const,
        actiontimestamp: '2025-06-11 16:54:17:156',
      },
      {
        selector: "input[id='password1']",
        type: 'manual' as const,
        actionresult: 'manual' as const,
        actiontimestamp: '2025-06-11 16:54:18:160',
      },
      {
        selector: "input[id='password2']",
        type: 'manual' as const,
      },
      {
        selector: "input[id='submit']",
        type: 'click' as const,
      },
    ],
  },
  {
    title: 'Register an email(Repeat: 3)',
    descriptionText: 'Analyzing',
    mode: StepModeEnum.ACTION,
    actioncurrent: 1,
    actionlist: [
      {
        selector: "input[id='email']",
        type: 'input' as const,
        value: 'ginkgo20250003@chefalicious.com',
        actionresult: 'success' as const,
        actiontimestamp: '2025-06-11 16:54:17:156',
      },
      {
        selector: "input[id='password1']",
        type: 'manual' as const,
        actionresult: 'manual' as const,
        actiontimestamp: '2025-06-11 16:54:18:160',
      },
      {
        selector: "input[id='password2']",
        type: 'manual' as const,
      },
      {
        selector: "input[id='submit']",
        type: 'click' as const,
      },
    ],
  },
  {
    title: 'Register an email(Repeat: 4)',
    descriptionText: 'Analyzing',
    mode: StepModeEnum.ACTION,
    actioncurrent: 1,
    actionlist: [
      {
        selector: "input[id='email']",
        type: 'input' as const,
        value: 'ginkgo20250003@chefalicious.com',
        actionresult: 'success' as const,
        actiontimestamp: '2025-06-11 16:54:17:156',
      },
      {
        selector: "input[id='password1']",
        type: 'manual' as const,
        actionresult: 'manual' as const,
        actiontimestamp: '2025-06-11 16:54:18:160',
      },
      {
        selector: "input[id='password2']",
        type: 'manual' as const,
      },
      {
        selector: "input[id='submit']",
        type: 'click' as const,
      },
    ],
  },
  {
    title: 'Register an email',
    descriptionText: 'Analyzing',
    mode: StepModeEnum.ACTION,
    actioncurrent: 1,
    actionlist: [
      {
        selector: "input[id='email']",
        type: 'input' as const,
        value: 'ginkgo20250003@chefalicious.com',
        actionresult: 'success' as const,
        actiontimestamp: '2025-06-11 16:54:17:156',
      },
      {
        selector: "input[id='password1']",
        type: 'manual' as const,
        actionresult: 'manual' as const,
        actiontimestamp: '2025-06-11 16:54:18:160',
      },
      {
        selector: "input[id='password2']",
        type: 'manual' as const,
      },
      {
        selector: "input[id='submit']",
        type: 'click' as const,
      },
    ],
  },
  {
    title: 'Register an email(Repeat: 2)',
    descriptionText: 'Analyzing',
    mode: StepModeEnum.ACTION,
    actioncurrent: 0,
    actionlist: [],
  },
  {
    title: 'Declaration',
    descriptionText: 'Analyzing',
    mode: StepModeEnum.DECLARATION,
    actioncurrent: 0,
    actionlist: [],
  },
];
