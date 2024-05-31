import { ApolloClient, useMutation } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';

import { DELETE_ONE_FIELD_METADATA_ITEM } from 'src/modules/gpt-requests/graphql/metadata/constants/mutations';
import { FIND_MANY_OBJECT_METADATA_ITEMS } from 'src/modules/gpt-requests/graphql/metadata/constants/queries';
import {
  DeleteOneFieldMetadataItemMutation,
  DeleteOneFieldMetadataItemMutationVariables,
} from 'src/modules/gpt-requests/graphql/metadata/generated-metadata/graphql';

import { useApolloMetadataClient } from './useApolloMetadataClient';

export const useDeleteOneFieldMetadataItem = () => {
  const apolloMetadataClient = useApolloMetadataClient();

  const [mutate] = useMutation<
    DeleteOneFieldMetadataItemMutation,
    DeleteOneFieldMetadataItemMutationVariables
  >(DELETE_ONE_FIELD_METADATA_ITEM, {
    client: apolloMetadataClient ?? ({} as ApolloClient<any>),
  });

  const deleteOneFieldMetadataItem = async (
    idToDelete: DeleteOneFieldMetadataItemMutationVariables['idToDelete'],
  ) => {
    return await mutate({
      variables: {
        idToDelete,
      },
      awaitRefetchQueries: true,
      refetchQueries: [getOperationName(FIND_MANY_OBJECT_METADATA_ITEMS) ?? ''],
    });
  };

  return {
    deleteOneFieldMetadataItem,
  };
};
