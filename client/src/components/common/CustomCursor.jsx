import React, { useEffect, useState } from 'react';

export const CustomCursor = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [trailingPos, setTrailingPos] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only enable on non-touch devices
    if (window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const onMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);
    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    const onMouseOver = (e) => {
      const target = e.target;
      const isInteractive =
        target.closest('button') ||
        target.closest('a') ||
        target.closest('input') ||
        target.closest('select') ||
        target.closest('textarea') ||
        target.closest('.glass-card') ||
        target.closest('[role="button"]');
      setIsHovering(!!isInteractive);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('mouseenter', onMouseEnter);
    document.addEventListener('mouseover', onMouseOver);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('mouseenter', onMouseEnter);
      document.removeEventListener('mouseover', onMouseOver);
    };
  }, []);

  // Smooth trailing animation loop
  useEffect(() => {
    let animationFrameId;
    const updateTrailing = () => {
      setTrailingPos((prev) => ({
        x: prev.x + (position.x - prev.x) * 0.22,
        y: prev.y + (position.y - prev.y) * 0.22
      }));
      animationFrameId = requestAnimationFrame(updateTrailing);
    };
    animationFrameId = requestAnimationFrame(updateTrailing);
    return () => cancelAnimationFrame(animationFrameId);
  }, [position]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[999999] overflow-hidden hidden md:block">
      {/* Outer Luxury Ring */}
      <div
        className={`fixed rounded-full border transition-all duration-300 ease-out -translate-x-1/2 -translate-y-1/2 ${
          isHovering
            ? 'w-12 h-12 border-amber-400 bg-amber-400/15 backdrop-blur-[1px] shadow-[0_0_20px_rgba(212,175,55,0.4)] scale-110'
            : isClicking
            ? 'w-6 h-6 border-amber-300 bg-amber-400/30 scale-90'
            : 'w-8 h-8 border-amber-400/60 shadow-[0_0_10px_rgba(212,175,55,0.2)]'
        }`}
        style={{
          left: `${trailingPos.x}px`,
          top: `${trailingPos.y}px`
        }}
      />

      {/* Inner Precision Gold Dot */}
      <div
        className={`fixed w-2 h-2 rounded-full bg-gradient-to-r from-amber-300 to-yellow-500 shadow-glow-gold -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 ${
          isHovering ? 'scale-150 bg-amber-200' : isClicking ? 'scale-75' : 'scale-100'
        }`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`
        }}
      />
    </div>
  );
};
