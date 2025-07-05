'use client';

import { PanelContainer } from '@/components/case/panelContainer';
import { PanelProfileVaultOverview } from '@/components/case/panelProfileVaultOverview';
import { buttonVariants } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { camelToCapitalizedWords, cn } from '@/lib/utils';
import { getMissingFieldEmailTemplate } from '@/service/api';
import { useProfileStore } from '@/store/profileStore';
import { ICaseItemType } from '@/types/case';
import Image from 'next/image';
import { memo, useCallback, useEffect, useState } from 'react';
import { PanelProfileVaultRtxDialog } from '../panelProfileVaultRtxDialog';
import { PanelProfileVaultTabContent } from '../panelProfileVaultTabContent';

interface PanelProfileVaultProps {
  caseInfo: ICaseItemType | null;
  isFold: boolean;
}

function PurePanelProfileVault(props: PanelProfileVaultProps) {
  const { caseInfo = null, isFold } = props;

  const [missingFieldsEmail, setMissingFieldsEmail] = useState<string>('');
  const [tabList, setTabList] = useState<any[]>([]);
  const { schema } = useProfileStore();

  useEffect(() => {
    if (schema?.jsonSchema?.properties) {
      const list = getTabList(schema?.jsonSchema?.properties);
      setTabList([
        {
          label: 'Overview',
          value: 'overview',
        },
        ...list,
      ]);
    }
  }, [schema]);

  const getMissingFieldsEmail = useCallback(async () => {
    try {
      const res = await getMissingFieldEmailTemplate(caseInfo!.id);
      if (res.htmlBody) {
        setMissingFieldsEmail(res.htmlBody);
      }
    } catch (error) {
      console.error('Error fetching missing fields email:', error);
    }
  }, [caseInfo, setMissingFieldsEmail]);

  useEffect(() => {
    if (caseInfo?.id) {
      getMissingFieldsEmail();
    }
  }, [caseInfo, getMissingFieldsEmail]);

  const getTabList = (properties: Record<string, { 'x-displayName': string }>) => {
    if (!properties) return [];
    return Object.keys(properties)
      .map(key => ({
        value: key,
        label: properties[key]['x-displayName'] ?? camelToCapitalizedWords(key),
      }))
      .sort((a, b) => a.value.localeCompare(b.value));
  };

  return (
    <PanelContainer
      title="Profile vault"
      showTitle={!isFold}
      renderTitleExtend={() => {
        return (
          <div className="flex flex-row items-center justify-between gap-2.5">
            <PanelProfileVaultRtxDialog content={missingFieldsEmail}>
              <div
                className={cn(
                  buttonVariants({ variant: 'secondary', size: 'default' }),
                  'h-9 flex-1'
                )}
              >
                <span className="font-bold">Draft email</span>
              </div>
            </PanelProfileVaultRtxDialog>
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
          <Tabs defaultValue="overview">
            <TabsList
              className="rounded-full gap-x-2 bg-[#F1F1F4] dark:bg-background mb-2 max-w-full overflow-x-auto justify-start snap-proximity snap-x sticky top-0 z-10"
              style={{
                scrollbarWidth: 'none',
              }}
            >
              {tabList.map(({ label, value }) => (
                <TabsTrigger
                  value={value}
                  key={value}
                  className={cn(
                    'rounded-full px-4 text-[#6B7280] data-[state="active"]:!text-white cursor-pointer snap-start'
                  )}
                >
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="overview">
              <PanelProfileVaultOverview {...caseInfo} />
            </TabsContent>
            {tabList
              .filter(tab => tab.value !== 'overview')
              .map(({ value }) => {
                return (
                  <TabsContent value={value} key={value}>
                    <PanelProfileVaultTabContent
                      fieldKey={value}
                      data={caseInfo?.profileDummyData?.[value] as Record<string, any>}
                      caseId={caseInfo.id}
                      dummyDataFields={caseInfo?.dummyDataFields as any[]}
                    />
                  </TabsContent>
                );
              })}
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
