/* eslint-disable @nx/workspace-matching-state-variable */
import { useRecoilState } from 'recoil';

import { LightIconButton } from '@/ui/input/button/components/LightIconButton';
import {
  IconLayoutSidebarRightCollapse,
  IconLayoutSidebarRightExpand,
} from '@ui/display';

import { isProgressDrawerExpandedState } from '../states/isProgressDrawerExpandedState';

export const RightDrawerTopBarExpandButton = () => {
  const [isRightDrawerExpanded, setIsRightDrawerExpanded] = useRecoilState(
    isProgressDrawerExpandedState,
  );

  const handleButtonClick = () => {
    setIsRightDrawerExpanded(!isRightDrawerExpanded);
  };

  return (
    <LightIconButton
      size="medium"
      accent="tertiary"
      Icon={
        isRightDrawerExpanded
          ? IconLayoutSidebarRightCollapse
          : IconLayoutSidebarRightExpand
      }
      onClick={handleButtonClick}
    />
  );
};
