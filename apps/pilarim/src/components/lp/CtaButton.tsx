import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
};

export function CtaButton({ href, children, className = "", onClick }: Props) {
  const external = href.startsWith("http");

  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1 rounded-full bg-pilarim-bronze text-white font-semibold hover:bg-pilarim-bronze-dark transition-colors ${className}`}
    >
      {children}
      <ChevronRight className="w-4 h-4" strokeWidth={2.4} />
    </a>
  );
}
