'use client';

import { PanelContainer } from '@/components/case/panelContainer';
import { PanelProfileVaultOverview } from '@/components/case/panelProfileVaultOverview';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { ICaseItemType } from '@/types/case';
import { isWindows } from '@/utils';
import { X } from 'lucide-react';
import Image from 'next/image';
import { memo } from 'react';
import { PanelProfileVaultTabContent } from '../panelProfileVaultTabContent';

interface PanelProfileVaultProps {
  caseInfo: ICaseItemType | null;
  isFold: boolean;
  oBtnCloseClick: () => void;
}

function PurePanelProfileVault(props: PanelProfileVaultProps) {
  const { caseInfo = null, isFold, oBtnCloseClick } = props;

  return (
    <PanelContainer
      title="Profile vault"
      showTitle={!isFold}
      renderTitleExtend={() => {
        return (
          <div className="flex flex-row items-center gap-2.5">
            <Button
              type="button"
              variant="ghost"
              className={cn('w-9 h-9 flex-shrink-0 cursor-pointer')}
              onClick={oBtnCloseClick}
            >
              <X size={24} />
            </Button>
          </div>
        );
      }}
    >
      {caseInfo ? (
        <div
          className={cn(
            'flex flex-col overflow-y-auto px-4 pb-4 box-border flex-1 h-0 text-foreground'
          )}
        >
          <Tabs defaultValue="fullProfile">
            <TabsList
              className="rounded-full gap-x-2 bg-[#F1F1F4] dark:bg-background mb-2 max-w-full overflow-x-auto justify-start snap-proximity snap-x sticky top-0 z-10"
              style={
                isWindows()
                  ? {}
                  : {
                      scrollbarWidth: 'none',
                    }
              }
            >
              <TabsTrigger
                value="fullProfile"
                className={cn(
                  'rounded-full px-4 text-[#6B7280] data-[state="active"]:!text-white cursor-pointer snap-start'
                )}
              >
                Full profile
              </TabsTrigger>
              <TabsTrigger
                value="missingInformation"
                className={cn(
                  'rounded-full px-4 text-[#6B7280] data-[state="active"]:!text-white cursor-pointer snap-start'
                )}
              >
                <div className="flex items-center gap-1">
                  Missing information{' '}
                  {/* {(caseInfo?.profileChecklist.missingFieldsCount ?? 0) > 0 && (
                    <span className="min-w-4 h-4 px-0.5 bg-red-400 rounded text-xs">
                      {caseInfo?.profileChecklist.missingFieldsCount}
                    </span>
                  )} */}
                  {Number(caseInfo?.profileChecklist.missingFieldsCount) > 0 ? (
                    <Badge
                      className="flex justify-center items-center bg-[#E1E1E2] text-[#565656] leading-[14px]"
                      variant="small"
                    >
                      {caseInfo?.profileChecklist.missingFieldsCount}
                    </Badge>
                  ) : null}
                </div>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="missingInformation">
              <PanelProfileVaultOverview {...caseInfo} />
            </TabsContent>
            <TabsContent value="fullProfile">
              <PanelProfileVaultTabContent caseId={caseInfo.id} caseInfo={caseInfo} />
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center justify-center h-full">
          <Image
            src="/imgProfileVaultEmpty.png"
            width={220}
            height={238}
            alt="default"
            className="mb-4"
          ></Image>
          <p className="text-base mb-8 relative text-foreground">
            Processing Your Documents
            <span className="after:animate-point-loading inline-block w-1"></span>
          </p>
          <p className="text-[#b4b4b3] w-3/4 text-center">
            Our AI is currently analyzing your documents. This may take a few moments.
            Please wait, and we'll notify you once it's complete.
          </p>
        </div>
      )}
    </PanelContainer>
  );
}

export const PanelProfileVault = memo(PurePanelProfileVault);
