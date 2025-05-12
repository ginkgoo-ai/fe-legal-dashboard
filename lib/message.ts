export const DefaultMessage = {
  common: {
    id: '',
    role: 'assistant',
    parts: [
      {
        type: 'text',
        content: '',
      },
    ],
  },
  error: {
    common: {
      id: '',
      role: 'assistant',
      parts: [
        {
          type: 'text',
          content: `Oops, something unexpected happened. Please try again shortly.`,
        },
      ],
    },
    cancel: {
      id: '',
      role: 'assistant',
      parts: [
        {
          type: 'text',
          content: `The request has been canceled. Please kindly resubmit your question when you're ready.`,
        },
      ],
    },
  },
} as any;
