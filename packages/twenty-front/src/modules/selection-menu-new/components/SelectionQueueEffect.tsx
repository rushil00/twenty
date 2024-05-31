// import React, { useCallback, useEffect } from 'react';

// import { ObjectMetadataItemNotFoundError } from '@/object-metadata/errors/ObjectMetadataNotFoundError';
// import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

// export const SelectionQueueEffect = () => {
//   const { enqueueSnackBar } = useSnackBar();

//   const handlePromiseRejection = useCallback(
//     (event: String[] ) => {

//       // TODO: connect Sentry here

//         enqueueSnackBar(`Error: ${event}`, {
//           variant: 'error',
//         });
//       },
//     [enqueueSnackBar],
//   );

//   useEffect(() => {
//     window.addEventListener('unhandledrejection', handlePromiseRejection);

//     return () => {
//       window.removeEventListener('unhandledrejection', handlePromiseRejection);
//     };
//   }, [handlePromiseRejection]);

//   return <></>;
// };
