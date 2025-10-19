import { useState } from 'react';
import type { NotificationKind } from '../../../types/notifications';
import { kindToIcon, kindToLabel, kindToColor } from '../../../utils/helpers';

type Props = {
  kind: NotificationKind;
  size?: number;        // px
  className?: string;
};

export default function NotifIcon({ kind, size = 24, className }: Props) {
  const [error, setError] = useState(false);
  const src = kindToIcon[kind];
  const label = kindToLabel[kind] ?? 'Notificación';
  const color = kindToColor[kind] ?? '#888';

  if (!error && src) {
    return (
      <img
        src={src}
        width={size}
        height={size}
        alt=""
        aria-label={label}
        className={className}
        onError={() => setError(true)}
        style={{ display: 'block' }}
      />
    );
  }

  // Fallback simple sin íconos externos
  return (
    <span
      aria-label={label}
      title={label}
      className={className}
      style={{
        width: size,
        height: size,
        display: 'inline-block',
        borderRadius: '50%',
        backgroundColor: color,
        boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.6)',
      }}
    />
  );
}