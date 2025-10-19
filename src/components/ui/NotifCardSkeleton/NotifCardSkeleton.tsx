import { Card, CardContent, Skeleton, Stack, Box } from '@mui/material';

export default function NotifCardSkeleton() {
  return (
    <Card variant="outlined">
      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Skeleton variant="circular" width={24} height={24} />
          <Box flex={1}>
            <Skeleton variant="text" width="40%" />
            <Skeleton variant="text" width="25%" />
            <Skeleton variant="rectangular" height={12} sx={{ mt: 1, borderRadius: 1 }} />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}