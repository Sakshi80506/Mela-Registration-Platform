import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SLIDES = [
  {
    id: 1,
    src: '/p1.avif',
    fallback: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80',
    title: 'Heritage Weaves & Handloom',
    subtitle: 'Authentic artisan textiles from across India'
  },
  {
    id: 2,
    src: '/p2.avif',
    fallback: 'https://images.unsplash.com/photo-1599818817290-7f2bf8f23f6d?auto=format&fit=crop&w=1200&q=80',
    title: 'Terracotta & Ceramic Art',
    subtitle: 'Timeless pottery sculpted by master hands'
  },
  {
    id: 3,
    src: '/p3.avif',
    fallback: 'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?auto=format&fit=crop&w=1200&q=80',
    title: 'Dhokra Brass & Metal Crafts',
    subtitle: 'Centuries-old lost-wax metal casting'
  },
  {
    id: 4,
    src: '/p4.avif',
    fallback: 'https://images.unsplash.com/photo-1617043786394-f977fa12eddf?auto=format&fit=crop&w=1200&q=80',
    title: 'Traditional Woodwork & Leather',
    subtitle: 'Exquisite regional handicrafts and souvenirs'
  }
];

const HeroSlider = ({ height = '380px' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  // Auto-slide every 4 seconds
  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % SLIDES.length);
      }, 4000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused]);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? SLIDES.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % SLIDES.length);
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: height,
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-xl)',
        border: '3px solid rgba(215, 168, 89, 0.4)',
        background: '#1A1412'
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-label="Image Carousel"
    >
      {/* Slides */}
      {SLIDES.map((slide, idx) => {
        const isActive = idx === currentIndex;
        return (
          <div
            key={slide.id}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: isActive ? 1 : 0,
              transform: isActive ? 'scale(1)' : 'scale(1.04)',
              transition: 'opacity 0.8s ease-in-out, transform 0.8s ease-in-out',
              pointerEvents: isActive ? 'auto' : 'none'
            }}
          >
            <img
              src={slide.src}
              alt={slide.title}
              onError={(e) => {
                if (e.target.src !== slide.fallback) {
                  e.target.src = slide.fallback;
                }
              }}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block'
              }}
            />
            {/* Gradient Overlay & Caption */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '2.5rem 1.5rem 1.25rem',
                background: 'linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.3) 60%, transparent 100%)',
                color: '#FFFFFF',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end'
              }}
            >
              <div>
                <div style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: 'var(--color-secondary)',
                  marginBottom: '0.2rem'
                }}>
                  Craft Exhibition • {idx + 1}/{SLIDES.length}
                </div>
                <h3 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700, color: '#FFFFFF' }}>
                  {slide.title}
                </h3>
                <p style={{ fontSize: '0.85rem', margin: '0.2rem 0 0', opacity: 0.9 }}>
                  {slide.subtitle}
                </p>
              </div>
            </div>
          </div>
        );
      })}

      {/* Navigation Arrows */}
      <button
        onClick={handlePrev}
        aria-label="Previous slide"
        style={{
          position: 'absolute',
          top: '50%',
          left: '12px',
          transform: 'translateY(-50%)',
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          background: 'rgba(0, 0, 0, 0.55)',
          color: '#FFFFFF',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          zIndex: 10,
          backdropFilter: 'blur(4px)'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(215, 168, 89, 0.9)'; e.currentTarget.style.color = '#1A1412'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0, 0, 0, 0.55)'; e.currentTarget.style.color = '#FFFFFF'; }}
      >
        <ChevronLeft size={22} />
      </button>

      <button
        onClick={handleNext}
        aria-label="Next slide"
        style={{
          position: 'absolute',
          top: '50%',
          right: '12px',
          transform: 'translateY(-50%)',
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          background: 'rgba(0, 0, 0, 0.55)',
          color: '#FFFFFF',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          zIndex: 10,
          backdropFilter: 'blur(4px)'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(215, 168, 89, 0.9)'; e.currentTarget.style.color = '#1A1412'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0, 0, 0, 0.55)'; e.currentTarget.style.color = '#FFFFFF'; }}
      >
        <ChevronRight size={22} />
      </button>

      {/* Dot Indicators */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          right: '16px',
          display: 'flex',
          gap: '6px',
          zIndex: 10
        }}
      >
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            style={{
              width: i === currentIndex ? '24px' : '8px',
              height: '8px',
              borderRadius: '4px',
              background: i === currentIndex ? 'var(--color-secondary)' : 'rgba(255, 255, 255, 0.45)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              padding: 0
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
