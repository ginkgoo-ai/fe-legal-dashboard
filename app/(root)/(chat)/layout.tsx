'use client';

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-0 w-full max-w-[var(--width-max)] flex-1 flex-col px-[var(--width-padding)]">
      {children}
    </div>
  );
}
