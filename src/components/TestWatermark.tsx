import { useEffect, useState } from 'react';

interface TestWatermarkProps {
  userId: string;
  testId: string;
}

export const TestWatermark = ({ userId, testId }: TestWatermarkProps) => {
  const [timestamp, setTimestamp] = useState(new Date().toLocaleString());

  useEffect(() => {
    // Update timestamp every 30 seconds
    const interval = setInterval(() => {
      setTimestamp(new Date().toLocaleString());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Create multiple watermark instances for coverage
  const watermarkText = `${userId.slice(0, 8)} | ${timestamp}`;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {/* Top-left */}
      <div className="absolute top-4 left-4 text-xs text-muted-foreground/20 font-mono">
        {watermarkText}
      </div>
      
      {/* Top-right */}
      <div className="absolute top-4 right-4 text-xs text-muted-foreground/20 font-mono">
        {watermarkText}
      </div>
      
      {/* Center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sm text-muted-foreground/10 font-mono rotate-[-45deg]">
        {watermarkText}
      </div>
      
      {/* Bottom-left */}
      <div className="absolute bottom-4 left-4 text-xs text-muted-foreground/20 font-mono">
        {watermarkText}
      </div>
      
      {/* Bottom-right */}
      <div className="absolute bottom-4 right-4 text-xs text-muted-foreground/20 font-mono">
        {watermarkText}
      </div>

      {/* Additional diagonal watermarks */}
      <div className="absolute top-1/4 left-1/4 text-xs text-muted-foreground/15 font-mono rotate-[-30deg]">
        {watermarkText}
      </div>
      <div className="absolute top-3/4 right-1/4 text-xs text-muted-foreground/15 font-mono rotate-[-30deg]">
        {watermarkText}
      </div>
    </div>
  );
};
