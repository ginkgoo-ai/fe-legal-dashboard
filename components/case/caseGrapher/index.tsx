import { FileBlock } from '@/components/common/itemFile';
import { IconLogo } from '@/components/ui/icon';
import { useCaseStore } from '@/store';
import { ICaseConversationAction, ICaseConversationItem } from '@/types/case';
import { cn } from '@/utils';
import { ChevronRight } from 'lucide-react';
import { HTMLAttributes, memo, useRef } from 'react';

const CaseActionLogWrapper = ({
  children,
  type,
}: {
  children: React.ReactNode;
  type: 'server' | 'client';
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isServerType = type === 'server';

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full rounded-lg py-4 px-4 pr-10 transition-[min-height] flex-none',
        isServerType
          ? ' border bg-panel-background'
          : 'bg-[#EFEFEF] dark:bg-primary-gray self-end w-11/12'
      )}
    >
      <div className={cn('w-full gap-2 flex-col')}>{children}</div>
    </div>
  );
};

const ServerCaseLogger = (
  props: ICaseConversationItem & {
    onActionEmit?: (params: {
      message: ICaseConversationItem;
      action: ICaseConversationAction;
    }) => void;
  }
) => {
  const onActionClick = (
    message: ICaseConversationItem,
    action: ICaseConversationAction
  ) => {
    props.onActionEmit?.({ message, action });
  };

  return (
    <CaseActionLogWrapper type="server">
      <div className="mb-2">
        <IconLogo size={24} className="text-primary-dark" />
      </div>
      <div className="dark:text-foreground text-[#1B2559]">{props.content}</div>
      {props.actions?.length > 0 && (
        <>
          <div className="h-[1px] w-full border-t my-4"></div>
          <div className="w-full flex flex-col gap-2">
            {props.actions.map((action, index) => (
              <CaseLoggerAction
                {...action}
                key={index}
                onClick={() => onActionClick(props, action)}
              />
            ))}
          </div>
        </>
      )}
    </CaseActionLogWrapper>
  );
};

const ClientCaseLogger = (props: ICaseConversationItem) => {
  const { caseInfo } = useCaseStore();
  return (
    <CaseActionLogWrapper type="client">
      <div className="mb-4 text-[#1B2559]">{props.content}</div>
      <div className="w-full overflow-y-auto">
        <div className="flex items-center gap-4">
          {caseInfo?.documents?.map(doc => <FileBlock key={doc.id} file={doc} />)}
        </div>
      </div>
    </CaseActionLogWrapper>
  );
};

const CaseLoggerAction = (
  props: ICaseConversationAction & HTMLAttributes<HTMLDivElement>
) => {
  const { action, label, parameters, onClick } = props;
  return (
    <div
      className="w-full bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-500 rounded-[6px] h-11 p-2 hover:bg-slate-200 hover:cursor-pointer transition-all flex items-center gap-4"
      onClick={onClick}
    >
      <div className="min-w-[113px] bg-slate-300 dark:bg-slate-500 w-fit px-2 rounded h-full flex items-center justify-center">
        {'default'}
      </div>
      <div className="text-slate-500 line-clamp-1">{label}</div>
      <span className="flex-1"></span>
      <ChevronRight className="text-slate-500" size={20} />
    </div>
  );
};

const PureCaseGrapher = ({
  data,
  onActionEmit,
}: {
  data: ICaseConversationItem;
  onActionEmit: (params: {
    message: ICaseConversationItem;
    action: ICaseConversationAction;
  }) => void;
}) => {
  const { messageType } = data;
  if (messageType === 'ASSISTANT') {
    return <ServerCaseLogger {...data} onActionEmit={onActionEmit} />;
  }
  return <ClientCaseLogger {...data} />;
};

export const CaseGrapher = memo(PureCaseGrapher);
