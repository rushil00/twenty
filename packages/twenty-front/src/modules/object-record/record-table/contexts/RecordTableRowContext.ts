import { createContext } from 'react';

export type RecordTableRowContextProps = {
  pathToShowPage: string;
  recordId: string;
  rowIndex: number;
  isSelected: boolean;
  isReadOnly: boolean;
  isPendingRow?: boolean;
};

export const RecordTableRowContext = createContext<RecordTableRowContextProps>(
  {} as RecordTableRowContextProps,
);
