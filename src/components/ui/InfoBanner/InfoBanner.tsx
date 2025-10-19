import { Alert } from '@mui/material';

type Props = {
  show: boolean;
  message?: string;
  sx?: any;
};

/**
 * Banner informativo simple (ej: fallback email HDU6).
 */
export default function InfoBanner({
  show,
  message = 'No pudimos enviar el correo. Revisa la notificación interna.',
  sx,
}: Props) {
  if (!show) return null;
  return (
    <Alert severity="warning" sx={sx}>
      {message}
    </Alert>
  );
}