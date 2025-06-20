import { PanelContainer } from '@/components/case/panelContainer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { ICaseItemType, IProfileVaultDocumentType } from '@/types';
import Image from 'next/image';
import { memo, useEffect, useRef, useState } from 'react';
import { PanelProfileVaultOverview } from '../panelProfileVaultOverview';

interface PanelProfileVaultProps {
  caseInfo: ICaseItemType | null;
  isFold: boolean;
}

function PurePanelProfileVault(props: PanelProfileVaultProps) {
  const { caseInfo = null, isFold } = props;

  const tabList = useRef([
    {
      value: 'overview',
      label: 'Overview',
    },
    {
      value: 'applicantProfile',
      label: 'Applicant Profile',
    },
    {
      value: 'sponsorDetails',
      label: 'Sponsor Details',
    },
    {
      value: 'lawyer',
      label: 'Lawyer',
    },
    {
      value: 'caseSettings',
      label: 'Case Settings',
    },
  ]);

  const [profileVaultDocumentList, setProfileVaultDocumentList] = useState<
    IProfileVaultDocumentType[]
  >([]);

  useEffect(() => {
    console.log(caseInfo);
    const profileVaultDocumentListTmp =
      caseInfo?.documents?.map((itemDocument: any) => {
        let metadataForFrontObject: Record<string, unknown> = {};

        try {
          metadataForFrontObject = itemDocument.metadataJson
            ? JSON.parse(itemDocument.metadataJson)
            : {};
        } catch (error) {
          console.error('PurePanelProfileVault parse', error);
        }

        return {
          ...itemDocument,
          metadataForFrontList: Object.keys(metadataForFrontObject).map((key: string) => {
            return {
              key,
              value: JSON.stringify(metadataForFrontObject[key]),
            };
          }),
        };
      }) || [];

    setProfileVaultDocumentList(profileVaultDocumentListTmp);
  }, [caseInfo?.timestamp, caseInfo?.documents]);

  return (
    <PanelContainer title="Profile vault" showTitle={!isFold}>
      {caseInfo ? (
        <div
          className={cn(
            'flex flex-col overflow-y-auto px-4 pb-4 box-border flex-1 h-0 text-foreground'
          )}
        >
          <Tabs defaultValue="overview">
            <TabsList className="rounded-full gap-x-2 bg-[#F1F1F4] mb-2">
              {tabList.current.map(({ label, value }) => (
                <TabsTrigger
                  value={value}
                  key={value}
                  className={cn(
                    'rounded-full px-4 text-[#6B7280] data-[state="active"]:!text-white cursor-pointer'
                  )}
                >
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="overview">
              <PanelProfileVaultOverview />
            </TabsContent>
            <TabsContent value="applicantProfile">UNDER CONSTRUCTION</TabsContent>
            <TabsContent value="sponsorDetails">UNDER CONSTRUCTION</TabsContent>
            <TabsContent value="lawyer">UNDER CONSTRUCTION</TabsContent>
            <TabsContent value="caseSettings">UNDER CONSTRUCTION</TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center justify-center h-full">
          <Image
            src="/imgProfileVaultEmpty.png"
            width={220}
            height={240}
            alt="default"
            className="mb-4"
          ></Image>
          <p className="text-base mb-8 relative">
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
