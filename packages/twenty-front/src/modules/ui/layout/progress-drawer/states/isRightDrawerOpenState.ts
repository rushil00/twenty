import { createState } from '@ui/utilities/state/utils/createState';

export const isProgressDrawerOpenState = createState<boolean>({
  key: 'ui/layout/is-progress-drawer-open',
  defaultValue: false,
});
