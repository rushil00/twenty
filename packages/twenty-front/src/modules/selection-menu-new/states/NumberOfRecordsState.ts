import { createState } from '@ui/utilities/state/utils/createState';

export const NumberOfRecordsState = createState<number>({
  key: 'NumberOfRecordsState',
  defaultValue: 0,
});
