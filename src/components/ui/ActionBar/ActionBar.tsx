import { Stack, Button } from '@mui/material';
import type { ReactNode } from 'react';

type Action = {
  label: string;
  onClick: () => void;
  color?: 'primary' | 'warning' | 'error' | 'success' | 'info' | 'secondary' | 'inherit';
  variant?: 'text' | 'outlined' | 'contained';
  startIcon?: ReactNode;
};

type Props = {
  actions: Action[];
  align?: 'left' | 'right';
  dense?: boolean;
  sx?: any;
};

export default function ActionBar({ actions, align = 'right', dense = true, sx }: Props) {
  if (!actions?.length) return null;
  return (
    <Stack
      direction="row"
      spacing={dense ? 1 : 2}
      justifyContent={align === 'right' ? 'flex-end' : 'flex-start'}
      sx={sx}
    >
      {actions.map((a, idx) => (
        <Button
          key={`${a.label}-${idx}`}
          onClick={a.onClick}
          color={a.color ?? 'primary'}
          variant={a.variant ?? 'text'}
          startIcon={a.startIcon}
          size={dense ? 'small' : 'medium'}
        >
          {a.label}
        </Button>
      ))}
    </Stack>
  );
}