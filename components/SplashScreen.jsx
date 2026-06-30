import { useEffect, useState } from 'react';

export default function SplashScreen({ minDuration = 1200 }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setHidden(true), minDuration);
    return () => clearTimeout(timer);
  }, [minDuration]);

  return (
    <div className={`splash ${hidden ? 'hidden' : ''}`}>
      <div className="splash-logo-wrap">
        <img src="/logo.png" alt="W&P Grains Traders" />
      </div>
      <div className="splash-title">W&amp;P GRAINS TRADERS</div>
      <div className="splash-sub">Loading your cereal records system…</div>
      <div className="splash-bar">
        <div className="splash-bar-fill" />
      </div>
    </div>
  );
}
