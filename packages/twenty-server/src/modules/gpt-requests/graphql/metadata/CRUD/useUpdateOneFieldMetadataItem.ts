import { useMutation } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';

import { UPDATE_ONE_FIELD_METADATA_ITEM } from 'src/modules/gpt-requests/graphql/metadata/constants/mutations';
import { FIND_MANY_OBJECT_METADATA_ITEMS } from 'src/modules/gpt-requests/graphql/metadata/constants/queries';
import {
  UpdateOneFieldMetadataItemMutation,
  UpdateOneFieldMetadataItemMutationVariables,
} from 'src/modules/gpt-requests/graphql/metadata/generated-metadata/graphql';

import { useApolloMetadataClient } from './useApolloMetadataClient';

export const useUpdateOneFieldMetadataItem = () => {
  const apolloMetadataClient = useApolloMetadataClient();

  const [mutate] = useMutation<
    UpdateOneFieldMetadataItemMutation,
    UpdateOneFieldMetadataItemMutationVariables
  >(UPDATE_ONE_FIELD_METADATA_ITEM, {
    client: apolloMetadataClient ?? undefined,
  });

  const updateOneFieldMetadataItem = async ({
    fieldMetadataIdToUpdate,
    updatePayload,
  }: {
    fieldMetadataIdToUpdate: UpdateOneFieldMetadataItemMutationVariables['idToUpdate'];
    updatePayload: Pick<
      UpdateOneFieldMetadataItemMutationVariables['updatePayload'],
      'description' | 'icon' | 'isActive' | 'label' | 'name'
    >;
  }) => {
    return await mutate({
      variables: {
        idToUpdate: fieldMetadataIdToUpdate,
        updatePayload: {
          ...updatePayload,
          label: updatePayload.label ?? undefined,
        },
      },
      awaitRefetchQueries: true,
      refetchQueries: [getOperationName(FIND_MANY_OBJECT_METADATA_ITEMS) ?? ''],
    });
  };

  return {
    updateOneFieldMetadataItem,
  };
};
