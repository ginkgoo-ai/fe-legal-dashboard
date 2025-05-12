"use client";

interface CodeBlockProps {
  node: any;
  inline: boolean;
  className: string;
  children: any;
}

export function CodeBlock({
  // node,
  inline,
  className,
  children,
  ...props
}: CodeBlockProps) {
  if (!inline) {
    return (
      <div className="not-prose flex flex-col">
        <pre {...props} className={`w-full overflow-x-auto rounded-xl border border-zinc-200 p-4 text-sm`}>
          <code className="whitespace-pre-wrap break-words">{children}</code>
        </pre>
      </div>
    );
  } else {
    return (
      <code className={`${className} rounded-md bg-zinc-100 px-1 py-0.5 text-sm dark:bg-zinc-800`} {...props}>
        {children}
      </code>
    );
  }
}
