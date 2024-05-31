import { LightIconButton } from '@/ui/input/button/components/LightIconButton';
import { IconChevronsRight } from '@ui/display';

import { useProgressDrawer } from '../hooks/useProgressDrawer';

export const RightDrawerTopBarCloseButton = () => {
  const { closeRightDrawer } = useProgressDrawer();

  const handleButtonClick = () => {
    closeRightDrawer();
  };

  return (
    <LightIconButton
      Icon={IconChevronsRight}
      onClick={handleButtonClick}
      size="medium"
      accent="tertiary"
    />
  );
};
