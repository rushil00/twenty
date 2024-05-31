import { useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { useLoadRecordIndexTable } from '@/object-record/record-index/hooks/useLoadRecordIndexTable';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { isFetchingMoreRecordsFamilyState } from '@/object-record/states/isFetchingMoreRecordsFamilyState';
import { useScrollRestoration } from '~/hooks/useScrollRestoration';

type RecordTableBodyEffectProps = {
  objectNameSingular: string;
};

export const RecordTableBodyEffect = ({
  objectNameSingular,
}: RecordTableBodyEffectProps) => {
  const {
    fetchMoreRecords: fetchMoreObjects,
    records,
    totalCount,
    setRecordTableData,
    queryStateIdentifier,
    loading,
  } = useLoadRecordIndexTable(objectNameSingular);

  const { tableLastRowVisibleState } = useRecordTableStates();

  const [tableLastRowVisible, setTableLastRowVisible] = useRecoilState(
    tableLastRowVisibleState,
  );

  const isFetchingMoreObjects = useRecoilValue(
    isFetchingMoreRecordsFamilyState(queryStateIdentifier),
  );

  const rowHeight = 32;
  const viewportHeight = records.length * rowHeight;

  useScrollRestoration(viewportHeight);

  useEffect(() => {
    if (!loading) {
      setRecordTableData(records, totalCount);
    }
  }, [records, totalCount, setRecordTableData, loading]);

  useEffect(() => {
    if (tableLastRowVisible && !isFetchingMoreObjects) {
      fetchMoreObjects();
    }
  }, [
    fetchMoreObjects,
    isFetchingMoreObjects,
    setTableLastRowVisible,
    tableLastRowVisible,
  ]);

  return <></>;
};
