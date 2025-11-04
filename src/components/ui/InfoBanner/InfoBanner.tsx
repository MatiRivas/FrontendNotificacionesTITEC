import { Alert, AlertColor, AlertTitle } from '@mui/material';

type Props = {
  severity?: AlertColor;        // 'success' | 'info' | 'warning' | 'error'
  title?: string;
  description?: string;
  // opcionalmente aceptar children, y si vienen, los renderizas en lugar de description
  children?: React.ReactNode;
  // ...otros props opcionales (sx, className, etc.)
};

export function InfoBanner({ severity = 'info', title, description, children }: Props) {
  return (
    <Alert severity={severity} variant="outlined" sx={{ my: 1 }}>
      {title ? <AlertTitle>{title}</AlertTitle> : null}
      {children ?? description ?? null}
    </Alert>
  );
}

export default InfoBanner;