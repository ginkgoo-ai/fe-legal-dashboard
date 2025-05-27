'use client';

import { PanelPilot } from '@/components/case/panel-pilot';
import { PanelProfileVault } from '@/components/case/panel-profile-vault';
import { PanelReference } from '@/components/case/panel-reference';
import { TagStatus } from '@/components/case/tag-status';
import { cn, parseCaseInfo } from '@/lib/utils';
import { caseStream } from '@/service/api';
import { ICaseItemType } from '@/types/case';
import { FileStatus, IFileItemType } from '@/types/file';
import { Breadcrumb, Splitter } from 'antd';
import { ItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { produce } from 'immer';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import './index.css';

const breadcrumbItemsCasePortal = {
  title: 'Cases',
  href: '/case-portal',
};

const PANEL_SIZE_LIMIT = 200;
const SIZE_REFERENCE_DEFAULT = window.innerWidth * 0.3;
const SIZE_PROFILEVAULT_DEFAULT = window.innerWidth * 0.4;
const SIZE_PILOT_DEFAULT = window.innerWidth * 0.3;
const SIZE_REFERENCE_MIN = 70;
const SIZE_PROFILEVAULT_MIN = 200;
const SIZE_PILOT_MIN = 70;

export default function CaseDetailPage() {
  const searchParams = useSearchParams();
  const caseId = decodeURIComponent(
    searchParams.get('caseId') || '44c6cd75-b7c4-4e27-b643-ab14c15ee3a0'
  );

  const [breadcrumbItems, setBreadcrumbItems] = useState<ItemType[]>([
    breadcrumbItemsCasePortal,
  ]);
  const [sizeReference, setSizeReference] = useState<number>(SIZE_REFERENCE_DEFAULT);
  const [sizeProfileVault, setSizeProfileVault] = useState<number>(
    SIZE_PROFILEVAULT_DEFAULT
  );
  const [sizePilot, setSizePilot] = useState<number>(SIZE_PILOT_DEFAULT);

  const [caseInfo, setCaseInfo] = useState<ICaseItemType | null>(null);
  const [fileList, setFileList] = useState<IFileItemType[]>([]);

  const registerCaseStream = async () => {
    try {
      const { cancel, request } = await caseStream(
        { caseId },
        (controller: any) => {
          // 可以立即获取到 controller
          // setRequestController({ cancel: () => controller.abort() });
        },
        res => {
          setFileList(prev =>
            produce(prev, draft => {
              draft.forEach((file: IFileItemType) => {
                file.status = FileStatus.DONE;
                file.progress = 100;
              });
            })
          );

          console.log('🚀 ~ res:', res);
          // const parts = parseMessageContent(res);
          // originalMessageLogRef.current = res;
          try {
            const data = JSON.parse(res);

            setCaseInfo(parseCaseInfo(data));
          } catch (error) {
            console.warn('[Debug] Error parse message', error);
          }
        }
      );

      try {
        await request;
      } catch (error: any) {
        throw error;
      }
    } catch (err: any) {
      if (err.name === 'AbortError' || err.name === 'CanceledError') {
        // Common Error
      } else {
        // Cancel Error
      }
    } finally {
    }
  };

  useEffect(() => {
    registerCaseStream();
  }, []);

  useEffect(() => {
    if (!caseInfo?.title) {
      return;
    }

    setBreadcrumbItems([
      breadcrumbItemsCasePortal,
      {
        title: caseInfo?.title, // `${title} - ${caseType}`
      },
    ]);
  }, [caseInfo]);

  const handleSplitterResize = (sizes: number[]) => {
    const [left, mid, right] = sizes || [];

    setSizeReference(left);
    setSizeProfileVault(mid);
    setSizePilot(right);
  };

  const handleBtnPanelLeftClick = () => {
    if (sizeReference > SIZE_REFERENCE_MIN) {
      setSizeReference(SIZE_REFERENCE_MIN);
    } else {
      setSizeReference(SIZE_REFERENCE_DEFAULT);
    }
  };

  const handleBtnPanelRightClick = () => {
    if (sizePilot > SIZE_PILOT_MIN) {
      setSizePilot(SIZE_PILOT_MIN);
    } else {
      setSizePilot(SIZE_PILOT_DEFAULT);
    }
  };

  return (
    <div className="box-border flex w-full flex-1 flex-col h-0 case-detail-wrap">
      {/* Breadcrumb */}
      <div
        className={cn(
          'bg-background flex h-[50px] w-full items-center justify-between border-b px-4'
        )}
      >
        <div className="flex items-center gap-4">
          <Breadcrumb separator=">" items={breadcrumbItems} />
        </div>
        <div className="flex items-center gap-4">
          {!!caseInfo?.caseStatusForFront?.text && (
            <TagStatus
              colorBackground={caseInfo.caseStatusForFront?.colorBackground}
              colorText={caseInfo.caseStatusForFront?.colorText}
              text={caseInfo.caseStatusForFront?.text}
            />
          )}
        </div>
      </div>

      {/* max-w-[var(--width-max)] px-[var(--width-padding)] */}
      <div className="flex h-0 w-full flex-1 flex-col px-6 py-6">
        <Splitter
          lazy={false}
          style={{
            // borderRadius: '12px',
            gap: '12px',
          }}
          onResize={handleSplitterResize}
        >
          <Splitter.Panel
            min={SIZE_REFERENCE_MIN}
            size={sizeReference}
            className="bg-white rounded-2xl flex-col flex"
          >
            {!!caseInfo && (
              <PanelReference
                caseInfo={caseInfo}
                showTitle={sizeReference > PANEL_SIZE_LIMIT}
                fileList={fileList}
                onFileListUpdate={setFileList}
                onBtnPanelLeftClick={handleBtnPanelLeftClick}
              />
            )}
          </Splitter.Panel>
          <Splitter.Panel
            min={SIZE_PROFILEVAULT_MIN}
            size={sizeProfileVault}
            className="bg-white rounded-2xl flex-col flex"
          >
            <PanelProfileVault
              profileVaultDocumentList={caseInfo?.profileVaultDocumentListForFront}
            />
          </Splitter.Panel>
          <Splitter.Panel
            min={SIZE_PILOT_MIN}
            size={sizePilot}
            className="bg-white rounded-2xl flex-col flex"
          >
            {!!caseInfo && (
              <PanelPilot
                caseInfo={caseInfo}
                showTitle={sizePilot > PANEL_SIZE_LIMIT}
                onBtnPanelRightClick={handleBtnPanelRightClick}
              />
            )}
          </Splitter.Panel>
        </Splitter>
      </div>
    </div>
  );
}
