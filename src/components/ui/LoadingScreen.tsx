import { useState, useEffect } from 'react';

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let n = 0;
    const id = setInterval(() => {
      n += 1;
      setCount(n);
      if (n >= 100) {
        clearInterval(id);
        // Wait 400ms at 100% then call done
        setTimeout(onComplete, 400);
      }
    }, 20); // 20ms × 100 steps = 2 seconds

    return () => clearInterval(id);
  }, [onComplete]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#070911',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
      }}
    >
      {/* Giant percentage number */}
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontSize: 'clamp(80px, 16vw, 200px)',
            fontWeight: 900,
            color: '#e8e4dc',
            fontFamily: 'Inter, system-ui, sans-serif',
            letterSpacing: '-0.04em',
            lineHeight: 1,
            userSelect: 'none',
          }}
        >
          {count}%
        </div>

        {/* Progress line */}
        <div
          style={{
            width: '320px',
            maxWidth: '80vw',
            height: '1px',
            background: '#1a1f2e',
            margin: '24px auto 0',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: `${count}%`,
              background: '#4a5568',
            }}
          />
        </div>

        {/* Label below line */}
        <p
          style={{
            marginTop: '18px',
            color: '#374151',
            fontSize: '11px',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            fontFamily: 'monospace',
          }}
        >
          BOTTLENECK LAB — LOADING
        </p>
      </div>

      {/* Bottom institution name */}
      <p
        style={{
          position: 'absolute',
          bottom: '28px',
          color: '#1f2937',
          fontSize: '10px',
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          fontFamily: 'monospace',
          userSelect: 'none',
        }}
      >
        KARUNYA INSTITUTE OF TECHNOLOGY AND SCIENCES
      </p>
    </div>
  );
}
