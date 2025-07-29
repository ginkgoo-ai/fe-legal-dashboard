import { buttonVariants } from '@/components/ui/button';
import { IconCheckGreen, IconCopy } from '@/components/ui/icon';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/utils';
import { useState } from 'react';

export const CopyButton = ({ message }: { message: string }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    if (isCopied) {
      return;
    }

    navigator.clipboard.writeText(message);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Tooltip open={isCopied}>
      <TooltipTrigger>
        <span
          className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), {
            '!bg-green-100': isCopied,
          })}
          onClick={handleCopy}
        >
          {isCopied ? <IconCheckGreen /> : <IconCopy />}
        </span>
      </TooltipTrigger>

      <TooltipContent className="max-w-xl" side="right">
        Copied!
      </TooltipContent>
    </Tooltip>
  );
};
