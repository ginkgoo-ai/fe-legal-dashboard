import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IconIssueCheck } from '@/components/ui/icon';
import { camelToCapitalizedWords } from '@/lib';
import { cn } from '@/utils';
import { isArray, isObject } from 'lodash';
import { memo } from 'react';

type PurePanelProfileVaultDynamicTabProps = {
  data: Record<string, unknown>;
  label: string;
};

const PureNestedContent = ({
  data,
  nestedLevel,
}: {
  data: Record<string, unknown>;
  nestedLevel: number;
}) => {
  return (
    <Accordion type="multiple" className="w-full">
      {Object.entries(data).map(([key, value], index, arr) => {
        if (isArray(value)) {
          return (
            <AccordionItem
              value={key}
              key={key}
              className="border-dashed border-[#D8DFF5]"
            >
              <AccordionTrigger className="pl-4">
                {camelToCapitalizedWords(key)}
              </AccordionTrigger>
              {value.length > 0 && (
                <AccordionContent>
                  <div
                    style={{
                      paddingLeft: (nestedLevel + 1) * 16 + 'px',
                    }}
                  >
                    {value.map((item, i) => (
                      <PureNestedContent
                        data={item as any}
                        nestedLevel={nestedLevel + 1}
                        key={i}
                      />
                    ))}
                  </div>
                </AccordionContent>
              )}
            </AccordionItem>
          );
        }
        if (isObject(value)) {
          return (
            <AccordionItem
              value={key}
              key={key}
              className="border-dashed border-[#D8DFF5]"
            >
              <AccordionTrigger className="pl-4">
                {camelToCapitalizedWords(key)}
              </AccordionTrigger>
              <AccordionContent>
                <div
                  style={{
                    paddingLeft: (nestedLevel + 1) * 16 + 8 + 'px',
                  }}
                >
                  <PureNestedContent data={value as any} nestedLevel={nestedLevel + 1} />
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        }
        return (
          <div
            className={cn(
              'py-4 border-dashed border-[#D8DFF5] flex items-center relative pl-4',
              index === arr.length - 1 ? 'border-b-0' : 'border-b'
            )}
            key={key}
          >
            <IconIssueCheck className="absolute -left-2" />
            <div className="text-[#98A1B7] pr-4 w-fit inline-flex items-center gap-1">
              {camelToCapitalizedWords(key)}
            </div>{' '}
            <span>{(value as any).toString()}</span>
          </div>
        );
      })}
    </Accordion>
  );
};

const PurePanelProfileVaultDynamicTab = ({
  data,
  label,
}: PurePanelProfileVaultDynamicTabProps) => {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{label}</CardTitle>
        </CardHeader>
        <CardContent>
          <PureNestedContent data={data as any} nestedLevel={0} />
        </CardContent>
      </Card>
    </div>
  );
};

export const PanelProfileVaultDynamicTab = memo(PurePanelProfileVaultDynamicTab);
