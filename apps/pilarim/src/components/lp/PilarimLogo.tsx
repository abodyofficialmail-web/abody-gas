import Image from "next/image";

type Props = {
  className?: string;
  priority?: boolean;
};

export function PilarimLogo({ className = "", priority = false }: Props) {
  return (
    <Image
      src="/logo.svg"
      alt="PILARIM pilates studio x personal training"
      width={160}
      height={100}
      className={className}
      priority={priority}
      unoptimized
    />
  );
}
