import { cva } from 'class-variance-authority';
import { cn } from './cn';

const button = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary: 'bg-azul text-white hover:brightness-110 shadow-soft',
        secondary:'bg-grafite text-white hover:bg-black',
        ghost: 'bg-transparent hover:bg-black/5',
        outline: 'border border-black/10 bg-white hover:bg-black/5',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-4',
        lg: 'h-12 px-6 text-lg',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
);

export function Button({ className, variant, size, ...props }) {
  return <button className={cn(button({ variant, size }), className)} {...props} />;
}
