'use client';

import { Button } from '@/components/ui/button';
import { IconCardEdit } from '@/components/ui/icon';
import { ICaseItemType } from '@/types/case';
import { Card } from 'antd';
import dayjs from 'dayjs';
import { memo, MouseEventHandler } from 'react';
import { TagStatus } from '../tagStatus';

interface CardCaseProps {
  itemCase: ICaseItemType;
  onCardClick: MouseEventHandler<HTMLDivElement>;
  onCardEditClick?: MouseEventHandler<HTMLButtonElement>;
}

function PureCardCase(props: CardCaseProps) {
  const { itemCase, onCardClick, onCardEditClick } = props;

  return (
    <Card
      hoverable
      style={{
        borderRadius: '12px',
      }}
      onClick={onCardClick}
    >
      <div className="flex flex-col w-full h-[153px]">
        <div className="flex flex-row justify-between items-center w-full">
          <span className="text-base font-bold line-clamp-2">{itemCase.title}</span>
          {onCardEditClick ? (
            <Button
              variant="ghost"
              className="!p-1"
              onClick={e => {
                e.stopPropagation();
                e.preventDefault();
                onCardEditClick?.(e);
              }}
            >
              <IconCardEdit size={28} className="" />
            </Button>
          ) : null}
        </div>
        <div className="flex flex-row justify-start items-center w-full mt-1">
          <span className="text-base text-[#B5B5C3]">{itemCase.caseType}</span>
        </div>
        <div className="flex-1 w-full"></div>
        <div className="flex flex-row justify-between items-center w-full mt-1">
          <span className="text-sm">
            <span className="text-[#B4B3B3]">Created at </span>
            <span className="text-[#1F2937]">
              {dayjs(itemCase.createdAt).format('DD MMM YYYY')}
            </span>
          </span>
          <TagStatus
            colorBackground={itemCase.caseStatusForFront?.colorBackground}
            colorText={itemCase.caseStatusForFront?.colorText}
            text={itemCase.caseStatusForFront?.text}
          />
        </div>
      </div>
    </Card>
  );
}

export const CardCase = memo(PureCardCase);
