import { ApolloClient, useMutation } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';

import { useApolloMetadataClient } from 'src/modules/gpt-requests/graphql/metadata/CRUD/useApolloMetadataClient';
import { CREATE_ONE_FIELD_METADATA_ITEM } from 'src/modules/gpt-requests/graphql/metadata/constants/mutations';
import { FIND_MANY_OBJECT_METADATA_ITEMS } from 'src/modules/gpt-requests/graphql/metadata/constants/queries';
import {
  CreateFieldInput,
  CreateOneFieldMetadataItemMutation,
  CreateOneFieldMetadataItemMutationVariables,
} from 'src/modules/gpt-requests/graphql/metadata/generated-metadata/graphql';

export const useCreateOneFieldMetadataItem = () => {
  const apolloMetadataClient = useApolloMetadataClient();

  const [mutate] = useMutation<
    CreateOneFieldMetadataItemMutation,
    CreateOneFieldMetadataItemMutationVariables
  >(CREATE_ONE_FIELD_METADATA_ITEM, {
    client: apolloMetadataClient ?? ({} as ApolloClient<any>),
  });

  const createOneFieldMetadataItem = async (input: CreateFieldInput) => {
    return await mutate({
      variables: {
        input: {
          field: input,
        },
      },
      awaitRefetchQueries: true,
      refetchQueries: [getOperationName(FIND_MANY_OBJECT_METADATA_ITEMS) ?? ''],
    });
  };

  return {
    createOneFieldMetadataItem,
  };
};
