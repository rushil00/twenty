import axios from 'axios';

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
        Authorization:
          'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMDIwMjAyMC0xYzI1LTRkMDItYmYyNS02YWVjY2Y3ZWE0MTkiLCJpYXQiOjE3MTY2NDEwNzIsImV4cCI6NDg3MDI0MTA3MSwianRpIjoiNjc4YTMyZTItOTkyZi00Y2MwLWI3NzEtMTAxMTMzYjk1OWU0In0.pN-tV6K06c0-owjI8byTsLnQhLHTbHooRLXgjDv7Wz4',
      },
    },
  );
  console.log(response.data.data.candidates.edges);
  return response.data.data.candidates.edges;
};
