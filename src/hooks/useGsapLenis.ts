import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useGsapLenis() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Respect reduced motion preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Initialize Lenis Smooth Scrolling
    const lenis = new Lenis({
      lerp: 0.08,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.5,
      infinite: false,
    });
    lenisRef.current = lenis;

    // Sync Lenis scroll with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    // 2. Intercept Anchor Link Clicks for Lenis Smooth Scroll
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a[href^="#"]');
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href || href === '#') return;

      const element = document.querySelector(href);
      if (element) {
        e.preventDefault();
        lenis.scrollTo(element as HTMLElement, {
          offset: -85,
          duration: 1.2,
        });
      }
    };
    document.addEventListener('click', handleAnchorClick);

    // 3. Scroll Progress Bar Animation
    const progressBar = document.getElementById('scroll-progress');
    if (progressBar) {
      gsap.to(progressBar, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.3,
        },
      });
    }

    if (!prefersReducedMotion) {
      // 4. Hero Entrance Timeline
      const heroTl = gsap.timeline({ delay: 0.2, defaults: { ease: 'power4.out' } });
      heroTl
        .from('#home h1', { y: 40, opacity: 0, duration: 1 })
        .from('#home p', { y: 20, opacity: 0, duration: 0.8 }, '-=0.6')
        .from('#home .lg\\:col-span-5', { x: 50, opacity: 0, duration: 1 }, '-=0.8');

      // 5. ScrollTrigger Batch reveals for cards, timeline items, and speakers
      const revealSelectors = [
        '#about .relative.overflow-hidden',
        '#agenda .group.relative',
        '#speakers .group.relative',
        '#venue .rounded-2xl',
        '#faq .rounded-2xl'
      ];

      revealSelectors.forEach((sel) => {
        const elements = document.querySelectorAll(sel);
        if (elements.length > 0) {
          gsap.set(elements, { opacity: 0, y: 35 });
          ScrollTrigger.batch(elements, {
            start: 'top 88%',
            once: true,
            onEnter: (batch) => {
              gsap.to(batch, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: 'power3.out',
                overwrite: true,
                onComplete: () => {
                  gsap.set(batch, { clearProps: 'transform,opacity' });
                },
              });
            },
          });
        }
      });

      // 6. 3D Tilt Interaction on Desktop Hover
      if (window.matchMedia('(hover: hover)').matches) {
        const tiltCards = document.querySelectorAll(
          '#about .relative.overflow-hidden, #speakers .group, #home .rounded-\\[20px\\]'
        );

        tiltCards.forEach((card) => {
          const el = card as HTMLElement;
          el.classList.add('interactive-tilt');

          const handleMouseMove = (e: MouseEvent) => {
            const rect = el.getBoundingClientRect();
            const px = (e.clientX - rect.left) / rect.width - 0.5;
            const py = (e.clientY - rect.top) / rect.height - 0.5;
            gsap.to(el, {
              rotateY: px * 8,
              rotateX: -py * 8,
              y: -4,
              transformPerspective: 800,
              duration: 0.35,
              ease: 'power2.out',
              overwrite: 'auto',
            });
          };

          const handleMouseLeave = () => {
            gsap.to(el, {
              rotateX: 0,
              rotateY: 0,
              y: 0,
              duration: 0.5,
              ease: 'power3.out',
              overwrite: 'auto',
            });
          };

          el.addEventListener('mousemove', handleMouseMove);
          el.addEventListener('mouseleave', handleMouseLeave);
        });
      }
    }

    // Refresh ScrollTrigger once DOM loads
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 200);

    // Cleanup on unmount
    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleAnchorClick);
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return lenisRef;
}
