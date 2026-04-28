'use client';

import './category.css';
import Image from 'next/image';
import { useTextReveal } from '@/hooks/useTextReveal';
import { useFadeUp } from '@/hooks/useFadeUp';
import type { ThemeVariant } from '@/lib/theme';

interface DimensionsSectionProps {
  heading: string;
  body: string;
  imageUrl?: string;
  theme?: ThemeVariant;
}

export default function DimensionsSection({
  heading,
  body,
  imageUrl,
  theme = 'brand-purple',
}: DimensionsSectionProps) {
  const labelRef   = useFadeUp({ delay: 0, duration: 0.5, y: 16 });
  const headingRef = useTextReveal();
  const bodyRef    = useFadeUp({ delay: 0.2, duration: 0.6, y: 16 });
  const imageRef   = useFadeUp({ delay: 0.1, duration: 0.8, y: 32 });

  return (
    <section data-theme={theme} className="dimensions-section section border--bottom">
      <div className="container">
        <div className="dimensions-section__inner">
          <div className="dimensions-section__text">
            <span
              ref={labelRef as React.RefObject<HTMLSpanElement>}
              data-animate=""
              className="section-label"
            >
              How it works
            </span>

            <h2
              ref={headingRef as React.RefObject<HTMLHeadingElement>}
              data-animate=""
              className="text-h2 text-balance max-ch-30"
            >
              {heading}
            </h2>

            <p
              ref={bodyRef as React.RefObject<HTMLParagraphElement>}
              data-animate=""
              className="text-body--lg leading--snug max-ch-40 color--secondary"
            >
              {body}
            </p>
          </div>

          <div
            ref={imageRef as React.RefObject<HTMLDivElement>}
            data-animate=""
            className="dimensions-section__visual"
          >
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="dimensions-section__image"
              />
            ) : (
              <div className="dimensions-section__placeholder" />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
