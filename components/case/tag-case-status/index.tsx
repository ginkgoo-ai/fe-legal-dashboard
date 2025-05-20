import { CaseStatusEnum } from '@/types/case';
import { Tag } from 'antd';
import { memo, useEffect, useState } from 'react';

interface TagCaseStatusProps {
  status: CaseStatusEnum;
  children?: React.ReactNode;
}

const TagCaseStatusMap = {
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
function PureTagCaseStatus(props: TagCaseStatusProps) {
  const { status, children } = props;

  const [colorBackground, setColorBackground] = useState<string>('');
  const [colorText, setColorText] = useState<string>('');
  const [text, setText] = useState<string>('');

  useEffect(() => {
    const { colorBackground, colorText, text } = TagCaseStatusMap[status] || {};
    setColorBackground(colorBackground);
    setColorText(colorText);
    setText(text || status);
  }, [status]);

  return (
    <Tag
      color={colorBackground}
      bordered={false}
      style={{
        borderRadius: '6px',
        padding: '6px 11.5px',
        fontSize: '12px',
        fontWeight: 700,
      }}
    >
      {children ? <>{children}</> : <span style={{ color: colorText }}>{text}</span>}
    </Tag>
  );
}

export const TagCaseStatus = memo(PureTagCaseStatus);
