/* eslint-disable no-console */
import { Injectable, Logger } from '@nestjs/common';

import fs from 'fs';
import os from 'os';
import path from 'path';

import axios from 'axios';
// import { temporaryFile } from 'tempy';

import { MessageQueueJob } from 'src/engine/integrations/message-queue/interfaces/message-queue-job.interface';

import { CREATE_ONE_PROMPT_ANSWER } from 'src/modules/gpt-requests/graphql/object-records/constants/record-mutations';
import { createRecord } from 'src/modules/gpt-requests/graphql/object-records/database-operations/create-record';
import { CVProcessing } from 'src/modules/gpt-requests/modules/cv-processing';
import { TWENTY_API_KEY } from 'src/modules/gpt-requests/constants/keys';
import {
  CVProcessingJobMQData2,
  CandidateNode,
  ScoredDataType,
} from 'src/modules/gpt-requests/types/gpt-requests.service-types';

const path_ = path;

@Injectable({})
export class CVProcessingJobMQ
  implements MessageQueueJob<CVProcessingJobMQData2>
{
  private readonly logger = new Logger(CVProcessingJobMQ.name);

  constructor() {}

  async handle(arg: CVProcessingJobMQData2): Promise<void> {
    const prompt = arg.data.prompt; //structured!
    // console.log(prompt);
    const recordData = await this.getRequiredRecordData(arg.data.record.node);
    const { path, fileName } = this.getPath(arg.data.record.node);
    // console.log("prompt.job",prompt)
    /*const config = {
      responseType: 'arraybuffer', // To get the PDF content as an ArrayBuffer
      headers: {
        Authorization: `Bearer ${TWENTY_API_KEY}`, // Include the token in the headers
      },
    };*/

    const pdfPath = await axios
      .get(path, {
        headers: {
          Authorization: `Bearer ${TWENTY_API_KEY}`,
        },
        responseType: 'arraybuffer',
      })
      .then(async (response) => {
        // const { temporaryFile } = await import('tempy');
        const pdfContent = await response.data;
        // const tempFilePath = temporaryFile({
        //   extension: extname(fileName),
        // });
        // const pathToSend = tempy.temporaryFile({ extension: extname(fileName) });
        const tempDir = os.tmpdir();
        const fileNameToSend = path_.join(tempDir, `${fileName}`);

        fs.writeFileSync(fileNameToSend, pdfContent);

        return fileNameToSend;
      });

    console.log(pdfPath);
    const cvProcessing = new CVProcessing(pdfPath, fileName);
    const { scoredData, candidateId } =
      await cvProcessing.getScoresFromCustomPrompt({
        prompts: prompt,
        record: recordData,
      });

    console.log('scoredData.Job', scoredData);
    await Promise.all(
      scoredData.map((data: ScoredDataType) => {
        createRecord({
          query: CREATE_ONE_PROMPT_ANSWER,
          data: {
            candidateId: candidateId,
            candidateAnswerScore: data.candidateAnswerScore,
            candidateAnswer: data.candidateAnswer,
            name: data.key,
          },
        });
      }),
    );
    fs.unlinkSync(pdfPath);

    return;
  }

  getRequiredRecordData(record: CandidateNode): object {
    return record;
  }

  getPath(record: CandidateNode): { fileName: string; path: string } {
    const url = 'http://localhost:3000/files/';

    console.log(record.people.attachments);
    const fileName = record.people.attachments.edges[0].node.fullPath;
    const name = record.people.attachments.edges[0].node.name;
    const path = url + fileName; //+ `?token=${TWENTY_API_KEY}`;

    return {
      path: path, //'http://localhost:3000/files/attachment/ce4b5ed2-2d70-4572-8bc5-530925e929cf.pdf?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHBpcmF0aW9uX2RhdGUiOiIyMDI0LTA4LTI0VDA4OjUyOjI3LjM1MloiLCJhdHRhY2htZW50X2lkIjoiNWIyODllNDAtNGI3Yi00ZDEyLThhZTgtMjg5YTBkYWMwZDIzIiwiaWF0IjoxNzE2NzEzNTQ3LCJleHAiOjE3MTcyNTM1NDd9.023zGX5xh79n9gddG3Vj_r5Kn80gQuf35u_c2lrB7ss',
      fileName: name,
    };
    //; //path; //'/home/rushiil/Downloads/manufacturing-cvs/VIshal Sharma -Curriculum Vitae -2.pdf';
  }
}
