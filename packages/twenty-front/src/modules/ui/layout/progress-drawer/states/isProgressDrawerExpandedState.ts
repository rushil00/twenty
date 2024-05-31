import { createState } from '@ui/utilities/state/utils/createState';

export const isProgressDrawerExpandedState = createState<boolean>({
  key: 'isProgressDrawerExpandedState',
  defaultValue: false,
});
