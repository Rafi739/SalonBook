import Image from "next/image"
import { Sparkles } from "lucide-react"

type ServiceImageProps = {
  name: string
  imageUrl?: string
  sizes: string
}

export function ServiceImage({ name, imageUrl, sizes }: ServiceImageProps) {
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-secondary">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt=""
          fill
          sizes={sizes}
          unoptimized
          className="object-cover"
        />
      ) : (
        <div
          role="img"
          aria-label={`${name} image coming soon`}
          className="absolute inset-0 grid place-items-center overflow-hidden bg-[radial-gradient(circle_at_72%_28%,rgba(206,177,125,0.36),transparent_35%),linear-gradient(135deg,#e9dfcc,#f5f0e5_55%,#ded3be)]"
        >
          <span className="absolute -right-10 -bottom-24 size-64 rounded-full border border-foreground/10" />
          <span className="absolute -right-3 -bottom-16 size-48 rounded-full border border-foreground/10" />
          <span className="relative grid size-16 place-items-center rounded-full border border-foreground/10 bg-background/50 text-foreground/70">
            <Sparkles aria-hidden="true" size={25} strokeWidth={1.4} />
          </span>
        </div>
      )}
    </div>
  )
}
