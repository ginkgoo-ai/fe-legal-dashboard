import { FileBlock } from '@/components/common/itemFile';
import { IconLogo } from '@/components/ui/icon';
import { useCaseStore } from '@/store';
import { cn } from '@/utils';
import { motion } from 'framer-motion';
import { memo, useRef } from 'react';

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

const ServerCaseLogger = () => {
  return (
    <CaseActionLogWrapper type="server">
      <div className="mb-2">
        <IconLogo size={24} className="text-primary-dark" />
      </div>
      <div className="dark:text-foreground text-[#1B2559]">
        The application for Isabella Rossi is approximately 80% complete and is currently
        on hold pending the submission of critical documentation. The AI-driven analysis
        confirms that the applicant's Certificate of Sponsorship (CoS), identity, English
        language ability, and educational qualifications meet the visa requirements. The
        proposed salary of £42,500 for SOC Code 2136 is compliant with the rules.
      </div>
      <div className="border-t">action</div>
    </CaseActionLogWrapper>
  );
};

const ClientCaseLogger = () => {
  const { caseInfo } = useCaseStore();
  return (
    <CaseActionLogWrapper type="client">
      <div className="mb-4 text-[#1B2559]">
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
  const array = useRef(Array.from({ length: 20 }, (_, i) => i + 1));
  return (
    <div className="w-full flex flex-col gap-4">
      {array.current.map(item => {
        const isServer = item % 2 === 0;
        return (
          <motion.div key={item} className="flex flex-col">
            {isServer ? <ServerCaseLogger key={item} /> : <ClientCaseLogger key={item} />}
          </motion.div>
        );
      })}
    </div>
  );
};

export const CaseGrapher = memo(PureCaseGrapher);
