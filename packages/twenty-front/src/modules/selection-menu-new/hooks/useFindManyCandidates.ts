import axios from 'axios';

import { TWENTY_API_KEY } from '@/selection-menu-new/hooks/keys';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

export const FIND_MANY_CANDIDATES = `query FindManyCandidates($filter: CandidateFilterInput, $orderBy: CandidateOrderByInput, $lastCursor: String, $limit: Int) {
    candidates(
      filter: $filter
      orderBy: $orderBy
      first: $limit
      after: $lastCursor
    ) {
      edges {
        node {
          people {
            __typename
            id
            position
            companyId
            name {
              firstName
              lastName
              __typename
            }
            jobTitle
            linkedinLink {
              label
              url
              __typename
            }
                      attachments {
              edges {
                node {
                  __typename
                  personId
                  fullPath
                  name
                  id
                  type
                  jobId
                }
                __typename
              }
              __typename
            }
          }
          peopleId
          name
          id
        }
        cursor
        __typename
      }
      totalCount
    }
  }`;

export const findManyCandidates = async (recordID: string[]) => {
  const url = `${REACT_APP_SERVER_BASE_URL}/graphql`;
  // console.log(TWENTY_API_KEY);
  const response = await axios.post(
    url,
    {
      query: FIND_MANY_CANDIDATES,
      variables: {
        filter: {
          id: {
            in: [...recordID],
          },
        },
      },
    },
    {
      headers: {
        Authorization: `Bearer ${TWENTY_API_KEY}`,
      },
    },
  );
  // eslint-disable-next-line no-console
  console.log(response.data);
  return response.data.data.candidates.edges;
};
