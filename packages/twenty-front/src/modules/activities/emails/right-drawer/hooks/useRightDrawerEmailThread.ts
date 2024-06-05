import { useCallback } from 'react';
import { useApolloClient } from '@apollo/client';
import gql from 'graphql-tag';
import { useRecoilValue } from 'recoil';

import { fetchAllThreadMessagesOperationSignatureFactory } from '@/activities/emails/graphql/operation-signatures/factories/fetchAllThreadMessagesOperationSignatureFactory';
import { EmailThreadMessage as EmailThreadMessageType } from '@/activities/emails/types/EmailThreadMessage';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { viewableRecordIdState } from '@/object-record/record-right-drawer/states/viewableRecordIdState';

export const useRightDrawerEmailThread = () => {
  const viewableRecordId = useRecoilValue(viewableRecordIdState);

  const apolloClient = useApolloClient();
  const thread = apolloClient.readFragment({
    id: `TimelineThread:${viewableRecordId}`,
    fragment: gql`
      fragment timelineThread on TimelineThread {
        id
        subject
        lastMessageReceivedAt
      }
    `,
  });

  const FETCH_ALL_MESSAGES_OPERATION_SIGNATURE =
    fetchAllThreadMessagesOperationSignatureFactory({
      messageThreadId: viewableRecordId,
    });

  const {
    records: messages,
    loading,
    fetchMoreRecords,
  } = useFindManyRecords<EmailThreadMessageType>({
    limit: FETCH_ALL_MESSAGES_OPERATION_SIGNATURE.variables.limit,
    filter: FETCH_ALL_MESSAGES_OPERATION_SIGNATURE.variables.filter,
    objectNameSingular:
      FETCH_ALL_MESSAGES_OPERATION_SIGNATURE.objectNameSingular,
    orderBy: FETCH_ALL_MESSAGES_OPERATION_SIGNATURE.variables.orderBy,
    recordGqlFields: FETCH_ALL_MESSAGES_OPERATION_SIGNATURE.fields,
    skip: !viewableRecordId,
  });

  const fetchMoreMessages = useCallback(() => {
    if (!loading) {
      fetchMoreRecords();
    }
  }, [fetchMoreRecords, loading]);

  return {
    thread,
    messages,
    loading,
    fetchMoreMessages,
  };
};
