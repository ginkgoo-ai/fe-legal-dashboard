'use client';

import { PanelPilot } from '@/components/case/panelPilot';
import { PanelProfileVault } from '@/components/case/panelProfileVault';
import { PanelReference } from '@/components/case/panelReference';
import { TagStatus } from '@/components/case/tagStatus';
import UtilsManager from '@/customManager/UtilsManager';
import { cn, parseCaseInfo } from '@/lib/utils';
import { caseStream } from '@/service/api';
import { ICaseItemType } from '@/types/case';
import { Breadcrumb, Splitter } from 'antd';
import { ItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './index.css';

const breadcrumbItemsCasePortal = {
  title: 'Cases',
  href: '/case-portal',
};

const PANEL_SIZE_LIMIT = 200;
const SIZE_REFERENCE_MIN = 70;
const SIZE_PROFILEVAULT_MIN = 200;
const SIZE_PILOT_MIN = 70;

function CaseDetailContent() {
  const searchParams = useSearchParams();
  const caseId = decodeURIComponent(searchParams.get('caseId') || '');

  const SIZE_REFERENCE_DEFAULT = useRef(0);
  const SIZE_PROFILEVAULT_DEFAULT = useRef(0);
  const SIZE_PILOT_DEFAULT = useRef(0);

  const sizeReferenceRef = useRef(0);
  const sizePilotRef = useRef(0);

  const [breadcrumbItems, setBreadcrumbItems] = useState<ItemType[]>([
    breadcrumbItemsCasePortal,
  ]);

  const [sizeReference, setSizeReference] = useState<number>(0);
  const [sizeProfileVault, setSizeProfileVault] = useState<number>(0);
  const [sizePilot, setSizePilot] = useState<number>(0);

  const [caseInfo, setCaseInfo] = useState<ICaseItemType | null>(null);

  const isFoldReference = useMemo(() => {
    return sizeReference <= PANEL_SIZE_LIMIT;
  }, [sizeReference]);

  const isFoldProfileVault = useMemo(() => {
    return sizeProfileVault <= PANEL_SIZE_LIMIT;
  }, [sizeProfileVault]);

  const isFoldPilot = useMemo(() => {
    return sizePilot <= PANEL_SIZE_LIMIT;
  }, [sizePilot]);

  const registerCaseStream = useCallback(async () => {
    try {
      const { request } = await caseStream(
        { caseId },
        () => {
          // 可以立即获取到 controller
          // setRequestController({ cancel: () => controller.abort() });
        },
        res => {
          // console.log('🚀 ~ res:', res);
          // originalMessageLogRef.current = res;

          try {
            const data = JSON.parse(res);

            setCaseInfo(parseCaseInfo(data));
          } catch (error) {
            console.warn('[Debug] Error parse message', error);
          }
        }
      );

      await request;
    } catch (err: any) {
      if (err.name === 'AbortError' || err.name === 'CanceledError') {
        // Common Error
      } else {
        // Cancel Error
      }
    } finally {
      //
    }
  }, [caseId, setCaseInfo]);

  useEffect(() => {
    SIZE_REFERENCE_DEFAULT.current = window.innerWidth * 0.3;
    SIZE_PROFILEVAULT_DEFAULT.current = window.innerWidth * 0.4;
    SIZE_PILOT_DEFAULT.current = window.innerWidth * 0.3;

    setSizeReference(SIZE_REFERENCE_DEFAULT.current);
    setSizeProfileVault(SIZE_PROFILEVAULT_DEFAULT.current);
    setSizePilot(SIZE_PILOT_DEFAULT.current);

    registerCaseStream();

    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [registerCaseStream]);

  useEffect(() => {
    sizeReferenceRef.current = sizeReference;
  }, [sizeReference]);

  useEffect(() => {
    sizePilotRef.current = sizePilot;
  }, [sizePilot]);

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
    // console.log('handleSplitterResize', sizes);
    const [left, mid, right] = sizes || [];

    setSizeReference(left);
    setSizeProfileVault(mid);
    setSizePilot(right);
  };

  const handleBtnPanelLeftClick = () => {
    let sizeReferenceTmp = 0;
    if (sizeReference > SIZE_REFERENCE_MIN) {
      sizeReferenceTmp = SIZE_REFERENCE_MIN;
    } else {
      sizeReferenceTmp = SIZE_REFERENCE_DEFAULT.current;
    }

    setSizeReference(sizeReferenceTmp);
    setSizeProfileVault(window.innerWidth - sizeReferenceTmp - sizePilotRef.current);
  };

  const handleBtnPanelRightClick = () => {
    let sizePilotTmp = 0;
    if (sizePilot > SIZE_PILOT_MIN) {
      sizePilotTmp = SIZE_PILOT_MIN;
    } else {
      sizePilotTmp = SIZE_PILOT_DEFAULT.current;
    }

    setSizePilot(sizePilotTmp);
    setSizeProfileVault(window.innerWidth - sizeReferenceRef.current - sizePilotTmp);
  };

  const handleWindowResize = () => {
    setSizeProfileVault(
      window.innerWidth - sizeReferenceRef.current - sizePilotRef.current
    );
  };

  if (!caseId) {
    UtilsManager.navigateBack();
    return null;
  }

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
        {sizeReference && sizeProfileVault && sizePilot ? (
          <Splitter
            lazy={false}
            style={{
              // borderRadius: '12px',
              gap: '12px',
            }}
            onResize={handleSplitterResize}
          >
            {/* Reference */}
            <Splitter.Panel
              min={SIZE_REFERENCE_MIN}
              size={sizeReference}
              className={cn('bg-white relative rounded-2xl flex-col flex h-full', {
                'transition-all': false,
              })}
            >
              <PanelReference
                caseInfo={caseInfo}
                isFold={isFoldReference}
                onBtnPanelLeftClick={handleBtnPanelLeftClick}
              />
            </Splitter.Panel>
            {/* Profile Vault */}
            <Splitter.Panel
              min={SIZE_PROFILEVAULT_MIN}
              size={sizeProfileVault}
              className={cn('bg-white relative rounded-2xl flex-col flex h-full', {
                'transition-all': false,
              })}
            >
              <PanelProfileVault caseInfo={caseInfo} isFold={isFoldProfileVault} />
            </Splitter.Panel>
            {/* Pilot */}
            <Splitter.Panel
              min={SIZE_PILOT_MIN}
              size={sizePilot}
              className={cn('bg-white relative rounded-2xl flex-col flex h-full', {
                'transition-all': false,
              })}
            >
              <PanelPilot
                caseInfo={caseInfo}
                isFold={isFoldPilot}
                onBtnPanelRightClick={handleBtnPanelRightClick}
              />
            </Splitter.Panel>
          </Splitter>
        ) : null}
      </div>
    </div>
  );
}

export default function CaseDetailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CaseDetailContent />
    </Suspense>
  );
}
