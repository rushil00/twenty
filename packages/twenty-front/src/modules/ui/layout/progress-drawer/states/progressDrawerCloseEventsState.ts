import { createState } from '@ui/utilities/state/utils/createState';

export const rightDrawerCloseEventState = createState<Event | null>({
  key: 'DrawerCloseEventState',
  defaultValue: null,
});
