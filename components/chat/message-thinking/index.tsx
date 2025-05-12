"use client";

import { motion } from "framer-motion";
import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";

export const ThinkingMessage = () => {
  const role = "assistant";

  return (
    <motion.div
      data-testid="message-assistant-loading"
      className="group/message mx-auto box-border w-full px-[0.125rem]"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
      data-role={role}
    >
      <div
        className={cn(
          "flex w-full gap-4 rounded-xl group-data-[role=user]/message:ml-auto group-data-[role=user]/message:w-fit group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:px-3 group-data-[role=user]/message:py-2",
          {
            "group-data-[role=user]/message:bg-muted": true,
          }
        )}
      >
        <div className="ring-border flex size-8 shrink-0 items-center justify-center rounded-full ring-1">
          <Bot size={14} />
        </div>

        <div className="flex w-full flex-col gap-2">
          <div className="text-muted-foreground mt-[0.25rem] flex flex-col gap-4">Hmm...</div>
        </div>
      </div>
    </motion.div>
  );
};
