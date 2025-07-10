import { FileBlock } from '@/components/common/itemFile';
import { Button } from '@/components/ui/button';
import { IconLogo } from '@/components/ui/icon';
import { useCaseStore } from '@/store';
import { cn } from '@/utils';
import { ChevronDown } from 'lucide-react';
import { memo, useState } from 'react';

const CaseActionLogWrapper = ({
  children,
  type,
}: {
  children: React.ReactNode;
  type: 'server' | 'client';
}) => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div
      className={cn(
        'relative w-full rounded-lg py-4 px-4 pr-10 transition-[height]',
        type === 'server'
          ? ' border bg-panel-background'
          : 'bg-[#EFEFEF] dark:bg-primary-gray self-end w-11/12'
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <ChevronDown
          size={14}
          className={cn('transition-transform', isOpen && 'rotate-180')}
        />
      </Button>
      <div
        className={cn(
          'w-full flex-col gap-2',
          isOpen ? 'line-clamp-none' : 'line-clamp-1'
        )}
      >
        {children}
      </div>
    </div>
  );
};

const ServerCaseLogger = () => {
  return (
    <CaseActionLogWrapper type="server">
      <div className="mb-2">
        <IconLogo size={24} className="text-primary-dark" />
      </div>
      <div>
        The application for Isabella Rossi is approximately 80% complete and is currently
        on hold pending the submission of critical documentation. The AI-driven analysis
        confirms that the applicant's Certificate of Sponsorship (CoS), identity, English
        language ability, and educational qualifications meet the visa requirements. The
        proposed salary of £42,500 for SOC Code 2136 is compliant with the rules.
      </div>
    </CaseActionLogWrapper>
  );
};

const ClientCaseLogger = () => {
  const { caseInfo } = useCaseStore();
  return (
    <CaseActionLogWrapper type="client">
      <div className="mb-4">
        The application for Isabella Rossi is approximately 80% complete and is currently
        on hold pending the submission of critical documentation. The AI-driven analysis
        confirms that the applicant's Certificate of Sponsorship (CoS), identity, English
        language ability, and educational qualifications meet the visa requirements. The
        proposed salary of £42,500 for SOC Code 2136 is compliant with the rules.
      </div>
      <div className="w-full overflow-y-auto">
        <div className="flex items-center gap-4">
          {caseInfo?.documents?.map(doc => <FileBlock key={doc.id} file={doc} />)}
        </div>
      </div>
    </CaseActionLogWrapper>
  );
};

const PureCaseGrapher = () => {
  return (
    <div className="w-full flex flex-col gap-4">
      <ServerCaseLogger />
      <ClientCaseLogger />
      <ServerCaseLogger />
      <ClientCaseLogger />
      <ServerCaseLogger />
      <ClientCaseLogger />
      <ServerCaseLogger />
      <ClientCaseLogger />
      <ServerCaseLogger />
      <ClientCaseLogger />
      <ServerCaseLogger />
      <ClientCaseLogger />
      <ServerCaseLogger />
      <ClientCaseLogger />
      <ServerCaseLogger />
      <ClientCaseLogger />
      <ServerCaseLogger />
      <ClientCaseLogger />
      <ServerCaseLogger />
      <ClientCaseLogger />
    </div>
  );
};

export const CaseGrapher = memo(PureCaseGrapher);
