import fs from 'fs';
import path from 'path';

import axios from 'axios';
import FormData from 'form-data';

import { TWENTY_API_KEY } from 'src/modules/gpt-requests/constants/keys';
import { CREATE_ONE_ATTACHMENT } from 'src/modules/gpt-requests/graphql/object-records/constants/record-mutations';

const URL = 'http://localhost:3000/graphql';
const headers = {
  Authorization: `Bearer ${TWENTY_API_KEY}`,
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

  // console.log(result);

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
          Authorization: `Bearer ${TWENTY_API_KEY}`,
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

export async function uploadFile(fullPath: string) {
  const data = new FormData();

  data.append(
    'operations',
    '{"operationName":"uploadFile","variables":{"file":null,"fileFolder":"Attachment"},"query":"mutation uploadFile($file: Upload!, $fileFolder: FileFolder) {\\n  uploadFile(file: $file, fileFolder: $fileFolder)\\n}"}',
  );
  data.append('map', '{"1":["variables.file"]}');
  data.append('1', fs.createReadStream(fullPath));
  // console.log(data)
  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'http://localhost:3000/graphql',
    headers: {
      Authorization: `Bearer ${TWENTY_API_KEY}`,
      ...data.getHeaders(),
    },
    data: data,
  };

  const response = await axios
    .request(config)
    .then((response) => {
      // console.log(response.data.data);
      return response.data.data;
    })
    .catch((error) => {
      // console.log(error);
      return error;
    });

  return response;
}

export const createOneAttachment = async (
  fullPath: string,
  personId: string,
) => {
  const data = JSON.stringify({
    query: `${CREATE_ONE_ATTACHMENT}`,
    variables: {
      input: {
        authorId: '20202020-0687-4c41-b707-ed1bfca972a7',
        name: `resume.${path.extname(fullPath).slice(1)}`,
        fullPath: fullPath,
        type: 'TextDocument',
        personId: personId,
      },
    },
  });

  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'http://localhost:3000/graphql',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TWENTY_API_KEY}`,
    },
    data: data,
  };

  const response = await axios
    .request(config)
    .then((response) => {
      // console.log(JSON.stringify(response.data), '\n');

      return response;
    })
    .catch((error) => {
      // console.log(error);

      return error;
    });

  return response;
};

export const getFileNamesFromDirectoryPath = (dirPath: string) => {
  return new Promise((resolve, reject) => {
    fs.readdir(dirPath, (err, fileNames) => {
      if (err) {
        reject(err);
      } else {
        const files = fileNames.map(
          (file) => `${dirPath}/${path.basename(file)}`,
        );

        resolve(files);
      }
    });
  });
};
