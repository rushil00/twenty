// /* eslint-disable @nx/workspace-no-hardcoded-colors */
// import { useEffect } from 'react';
// import { useRecoilCallback } from 'recoil';

// import { ProgressBar } from '@/ui/feedback/progress-bar/components/ProgressBar';
// // import { ProgressBar } from "./ProgressBar";
// import { isProgressDrawerExpandedState } from '@/ui/layout/progress-drawer/states/isProgressDrawerExpandedState';
// import { isProgressDrawerOpenState } from '@/ui/layout/progress-drawer/states/isRightDrawerOpenState';

// type SelectionProgressProps = {
//   duration?: number;
// };

// export const SelectionProgress = ({
//   duration = 90000,
// }: SelectionProgressProps) => {
//   const closeRightDrawer = useRecoilCallback(
//     ({ set }) =>
//       () => {
//         set(isProgressDrawerExpandedState, false);
//         set(isProgressDrawerOpenState, false);
//       },
//     [],
//   );

//   useEffect(() => {
//     // Set showState to false after the specified duration
//     const timeoutId = setTimeout(() => {
//       closeRightDrawer();
//     }, duration);

//     // Clean up the timeout to avoid memory leaks
//     return () => clearTimeout(timeoutId);
//   }, []); // Run this effect only once when the component mounts

//   // const [durationF, setDuration] = useRecoilState(NumberOfRecordsState);
//   // console.log(durationF)

//   return (
//     <ProgressBar
//       duration={duration}
//       delay={0}
//       easing="easeIn"
//       barHeight={10}
//       barColor="#4bb543"
//       autoStart={true}
//     />
//     // <ProgressBar totalRecords={5} />
//   );
// };
