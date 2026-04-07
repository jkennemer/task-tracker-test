export function TopNav({ boardTitle }: { boardTitle?: string }) {
  return (
    <header className="h-12 border-b flex items-center px-4 shrink-0 bg-background">
      {boardTitle && <span className="font-medium text-sm">{boardTitle}</span>}
    </header>
  );
}
