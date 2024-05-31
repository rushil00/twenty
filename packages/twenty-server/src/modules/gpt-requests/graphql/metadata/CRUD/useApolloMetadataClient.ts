import { useContext } from 'react';
import { useApolloClient } from '@apollo/client';

import { ApolloMetadataClientContext } from 'src/modules/gpt-requests/graphql/metadata/CRUD/context/ApolloClientMetadataContext';

export const useApolloMetadataClient = () => {
  const apolloMetadataClient = useContext(ApolloMetadataClientContext);
  const apolloClient = useApolloClient();

  if (process.env.NODE_ENV === 'test') {
    return apolloClient;
  }

  return apolloMetadataClient;
};
