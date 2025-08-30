import { cn } from './cn';
export function Card({ className, ...props }) {
  return <div className={cn("rounded-2xl bg-white shadow-soft border border-black/5", className)} {...props} />;
}
export function CardBody({ className, ...props }) {
  return <div className={cn("p-4", className)} {...props} />;
}
