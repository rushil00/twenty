import axios from 'axios';
const URL = 'http://localhost:3000/graphql';
const headers = {
  Authorization:
    'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMDIwMjAyMC0xYzI1LTRkMDItYmYyNS02YWVjY2Y3ZWE0MTkiLCJpYXQiOjE3MTY2NDEwNzIsImV4cCI6NDg3MDI0MTA3MSwianRpIjoiNjc4YTMyZTItOTkyZi00Y2MwLWI3NzEtMTAxMTMzYjk1OWU0In0.pN-tV6K06c0-owjI8byTsLnQhLHTbHooRLXgjDv7Wz4',
};

export const createRecord = async ({ query, data }) => {
  const _query = query;
  const _variables = { input: data };
  const result = await axios
    .post(
      URL,
      { query: _query, variables: _variables },
      {
        headers: headers,
      },
    )
    .then((response) => {
      //   console.log(response.data.data.people.edges);

      return response;
    })
    .catch((error) => {
      //   console.error(error);

      return error;
    });

  return result;
};

export const findAllQuery = async ({ query, variables }) => {
  const _query = query;
  const _variables = variables;
  const result = await axios
    .post(
      URL,
      { query: _query, variables: _variables },
      {
        headers: {
          Authorization:
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMDIwMjAyMC0xYzI1LTRkMDItYmYyNS02YWVjY2Y3ZWE0MTkiLCJpYXQiOjE3MTY2NDEwNzIsImV4cCI6NDg3MDI0MTA3MSwianRpIjoiNjc4YTMyZTItOTkyZi00Y2MwLWI3NzEtMTAxMTMzYjk1OWU0In0.pN-tV6K06c0-owjI8byTsLnQhLHTbHooRLXgjDv7Wz4',
        },
      },
    )
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      return error;
    });

  return result;
};
