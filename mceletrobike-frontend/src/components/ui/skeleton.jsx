import { cn } from './cn';
export function Skeleton({ className }) {
  return <div className={cn("animate-pulse rounded-xl bg-black/10", className)} />;
}
