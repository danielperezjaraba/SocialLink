import { useEffect, useRef, type ReactNode } from 'react';
import { prefersReducedMotion } from '@/lib/motion';

type ParallaxProps = {
  /** Cuánto se desplaza respecto del scroll. Valores negativos invierten el sentido. */
  speed?: number;
  className?: string;
  children: ReactNode;
};

/**
 * Desplaza su contenido en función de la posición del elemento en la ventana.
 * El cálculo se hace dentro de requestAnimationFrame para no bloquear el scroll.
 */
export function Parallax({ speed = 0.15, className, children }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const element = ref.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const distanceFromCenter = rect.top + rect.height / 2 - window.innerHeight / 2;
      element.style.transform = `translate3d(0, ${(-distanceFromCenter * speed).toFixed(2)}px, 0)`;
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [speed]);

  return (
    <div ref={ref} className={className} style={{ willChange: 'transform' }}>
      {children}
    </div>
  );
}
