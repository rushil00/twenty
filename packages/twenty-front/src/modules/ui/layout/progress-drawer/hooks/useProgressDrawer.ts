/* eslint-disable @nx/workspace-matching-state-variable */
import { useRecoilCallback, useRecoilState } from 'recoil';

import { isProgressDrawerExpandedState } from '../states/isProgressDrawerExpandedState';
import { isProgressDrawerOpenState } from '../states/isRightDrawerOpenState';
import { rightDrawerCloseEventState } from '../states/progressDrawerCloseEventsState';

export const useProgressDrawer = () => {
  const [isRightDrawerOpen] = useRecoilState(isProgressDrawerOpenState);

  // const [rightDrawerPage] = useRecoilState(rightDrawerPageState);

  const openRightDrawer = useRecoilCallback(
    ({ set }) =>
      () => {
        // set(rightDrawerPageState, rightDrawerPage);
        set(isProgressDrawerExpandedState, false);
        set(isProgressDrawerOpenState, true);
      },
    [],
  );

  const closeRightDrawer = useRecoilCallback(
    ({ set }) =>
      () => {
        set(isProgressDrawerExpandedState, false);
        set(isProgressDrawerOpenState, false);
      },
    [],
  );

  const isSameEventThanRightDrawerClose = useRecoilCallback(
    ({ snapshot }) =>
      (event: MouseEvent | TouchEvent) => {
        const rightDrawerCloseEvent = snapshot
          .getLoadable(rightDrawerCloseEventState)
          .getValue();

        const isSameEvent =
          rightDrawerCloseEvent?.target === event.target &&
          rightDrawerCloseEvent?.timeStamp === event.timeStamp;

        return isSameEvent;
      },
    [],
  );

  return {
    // rightDrawerPage,
    isRightDrawerOpen,
    openRightDrawer,
    closeRightDrawer,
    isSameEventThanRightDrawerClose,
  };
};
