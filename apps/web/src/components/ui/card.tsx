import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
}

export function Card({ title, className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`w-full rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 ${className}`}
      {...props}
    >
      {title && (
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-3">
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}

export function CardContent({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}
