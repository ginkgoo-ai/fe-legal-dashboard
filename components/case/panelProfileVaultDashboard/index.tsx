'use client';

import { ICaseItemType } from '@/types/case';
import { cn } from '@/utils';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import {
  BadgeAlert,
  CircleCheckBig,
  FileX2,
  FolderSymlink,
  LoaderCircle,
} from 'lucide-react';
import { memo, useCallback, useEffect, useState } from 'react';

type PurePanelProfileVaultDashboardProps = {
  caseInfo?: ICaseItemType;
} & React.HTMLAttributes<HTMLDivElement>;

function DashboardIconWrap({
  icon,
  className,
}: {
  icon: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full size-8 p-1.5',
        className
      )}
    >
      {icon}
    </div>
  );
}

function PurePanelProfileVaultDashboard(props: PurePanelProfileVaultDashboardProps) {
  const { profileChecklist, documentsCount, documentChecklist } = props.caseInfo ?? {};
  const [dashboardCards, setDashboardCards] = useState<
    {
      label: string;
      icon: React.ReactNode;
      value: number;
      format?: (value: number) => string;
      formatNumber?: boolean;
    }[]
  >([]);

  const renderCard = useCallback(() => {
    return [
      {
        label: 'Completeness',
        icon: (
          <DashboardIconWrap
            icon={
              profileChecklist?.completionPercentage === 100 ? (
                <CircleCheckBig />
              ) : (
                <LoaderCircle />
              )
            }
            className={cn(
              'bg-gradient-to-tl',
              profileChecklist?.completionPercentage === 100
                ? 'from-green-100 to-green-200 text-green-500'
                : 'from-blue-200 to-blue-300 text-primary'
            )}
          />
        ),
        value: profileChecklist?.completionPercentage ?? 0,
        formatNumber: false,
        format: (value: number) => `${value}%`,
      },
      {
        label: 'Issues',
        icon: (
          <DashboardIconWrap
            icon={<BadgeAlert />}
            className="bg-gradient-to-tl from-orange-200 to-pink-200 text-orange-400"
          />
        ),
        value: documentChecklist?.documentsWithIssues ?? 0,
      },
      {
        label: 'Reference',
        icon: (
          <DashboardIconWrap
            icon={<FolderSymlink />}
            className="bg-gradient-to-tl from-yellow-100 to-yellow-200 text-yellow-500"
          />
        ),
        value: documentsCount ?? 0,
      },
      {
        label: 'Missing information',
        icon: (
          <DashboardIconWrap
            icon={<FileX2 />}
            className="bg-gradient-to-tl from-gray-200 to-gray-300 text-gray-500"
          />
        ),
        value: profileChecklist?.missingFieldsCount ?? 0,
      },
    ];
  }, [profileChecklist, documentsCount, documentChecklist]);

  useEffect(() => {
    setDashboardCards(renderCard());
  }, [renderCard]);

  return (
    <div className="w-full grid grid-cols-4 items-center gap-6 pb-2">
      {dashboardCards.map(item => {
        return <DashboardCard {...item} key={item.label} />;
      })}
    </div>
  );
}

const PureDashboardCard = function ({
  label,
  icon,
  duration = 0.6,
  formatNumber = true,
  value,
  format,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  duration?: number;
  formatNumber?: boolean;
  format?: (value: number) => string;
}) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);
  const displayValue = useTransform(rounded, latest => {
    let result: any = latest;
    if (formatNumber) {
      result = latest.toLocaleString();
    }
    if (format) {
      result = format(latest);
    }
    return result;
  });
  useEffect(() => {
    const timer = setTimeout(() => {
      const controls = animate(count, value ?? 0, {
        duration,
        ease: 'easeOut',
      });

      return controls.stop;
    }, 300);

    return () => clearTimeout(timer);
  }, [value, count, duration]);

  return (
    <div className="w-full flex items-center rounded-xl p-4 gap-4 bg-panel-background border transition-[width] duration-200">
      {icon}
      <div className="flex flex-col gap-1">
        <div className="h-8 text-2xl leading-8 font-semibold">
          <motion.span>{displayValue}</motion.span>
        </div>
        <h4 className="text-sm text-[#808080]">{label}</h4>
      </div>
    </div>
  );
};

const DashboardCard = memo(PureDashboardCard);

export const PanelProfileVaultDashboard = memo(PurePanelProfileVaultDashboard);
