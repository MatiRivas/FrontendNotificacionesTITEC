import { Stack, Box, Typography } from '@mui/material';

export type TimelineEvent = {
  at: string;            // ISO
  label: string;         // texto a mostrar
  color?: string;        // opcional (ej: '#06717e')
  dotColor?: string;     // opcional (ej: '#003c58')
  right?: React.ReactNode; // ej: timestamp formateado, monto, etc.
};

type Props = { events: TimelineEvent[] };

export default function EventTimeline({ events }: Props) {
  return (
    <Stack spacing={1.5} sx={{ position: 'relative', pl: 2 }}>
      {events.map((ev, idx) => (
        <Stack key={idx} direction="row" spacing={1.5} alignItems="flex-start">
          {/* DOT */}
          <Box
            sx={{
              width: 10, height: 10, borderRadius: '50%',
              backgroundColor: ev.dotColor ?? '#06717e',
              mt: '6px', flexShrink: 0,
              boxShadow: '0 0 0 2px rgba(0,0,0,0.05)',
            }}
          />
          {/* LINE + CONTENT */}
          <Box sx={{ flex: 1, pb: idx === events.length - 1 ? 0 : 1.5, borderLeft: idx === events.length - 1 ? 'none' : '1px solid var(--mui-palette-divider)', ml: 1, pl: 1 }}>
            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Typography variant="body2" fontWeight={600} color={ev.color ?? 'inherit'}>
                {ev.label}
              </Typography>
              {ev.right ? <Box>{ev.right}</Box> : null}
            </Stack>
          </Box>
        </Stack>
      ))}
    </Stack>
  );
}