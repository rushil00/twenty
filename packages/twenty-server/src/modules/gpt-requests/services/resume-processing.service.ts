/* eslint-disable no-console */
import { Inject, Injectable } from '@nestjs/common';

// import { path } from 'path';

import fs from 'fs';
import path from 'path';

import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { DocxLoader } from 'langchain/document_loaders/fs/docx';
import { CharacterTextSplitter } from 'langchain/text_splitter';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { OpenAIEmbeddings, ChatOpenAI } from '@langchain/openai';
import { createRetrieverTool } from 'langchain/tools/retriever';
import { createOpenAIToolsAgent, AgentExecutor } from 'langchain/agents';
import { pull } from 'langchain/hub';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
// import axios from 'axios';
// import FormData from 'form-data';
import { ChatPromptTemplate } from '@langchain/core/prompts';

import { MessageQueueJob } from 'src/engine/integrations/message-queue/interfaces/message-queue-job.interface';

import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
// import { TWENTY_API_KEY } from 'src/modules/gpt-requests/constants/keys';
import {
  createOneAttachment,
  createRecord,
  uploadFile,
} from 'src/modules/gpt-requests/graphql/object-records/database-operations/create-record';
import { CREATE_ONE_PERSON } from 'src/modules/gpt-requests/graphql/object-records/constants/record-mutations';

export type PersonInputType = any;

Injectable({});
export class ResumeToRecordCreationService {
  constructor(
    @Inject(MessageQueue.recordsFromResumeQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  getFileNamesFromDirectoryPath = (directoryPath: string): string[] => {
    const fileNames: string[] = [];

    // Read the contents of the directory
    const files = fs.readdirSync(directoryPath);

    // Iterate through each file in the directory
    files.forEach((file) => {
      // Get the full path of the file
      const filePath = path.join(directoryPath, file);

      // Check if the current item is a file
      if (fs.statSync(filePath).isFile()) {
        // Add the file name to the array
        fileNames.push(`${directoryPath}/${file}`);
      }
    });

    // console.log(fileNames);

    return fileNames;
  };

  async uploadFile(fullPath: string) {
    /*const data = new FormData();

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

    return response;*/
    return await uploadFile(fullPath);
  }

  async loadAndGetStructuredOutputFromResume(path: string) {
    let loader: PDFLoader | DocxLoader | undefined = undefined;

    if (path.endsWith('.pdf')) {
      loader = new PDFLoader(path);
    } else if (path.endsWith('.doc') || path.endsWith('.docx')) {
      loader = new DocxLoader(path);
    } else {
      return 'Error Processing Document';
    }
    const documents = await loader.load();

    const textSplitter = new CharacterTextSplitter({
      chunkSize: 3000,
      chunkOverlap: 0,
    });
    const texts = await textSplitter.splitDocuments(documents);
    // console.log("texts.length", texts.length);
    const embeddings = new OpenAIEmbeddings();
    const db = await MemoryVectorStore.fromDocuments(texts, embeddings);
    const retriever = db.asRetriever();

    const qnaSchema = z.object({
      name: z.object({
        firstName: z.string(),
        lastName: z.string(),
      }),
      email: z.string(),
      phone: z.string(),
      // website: z.string(),
      jobTitle: z.string(),
      city: z.string(),
    });

    const tool1 = createRetrieverTool(retriever, {
      name: 'structured_Resume',
      description: 'Parses the resume in a structured format.',
    });
    const tools = [tool1];

    const prompt = await pull<ChatPromptTemplate>(
      'hwchase17/openai-tools-agent',
    );
    // console.log(prompt)

    const llm = new ChatOpenAI({ temperature: 0 });

    const agent = await createOpenAIToolsAgent({
      llm,
      tools,
      prompt,
    });
    const agentExecutor = new AgentExecutor({
      agent,
      tools,
    });

    const result1 = await agentExecutor.invoke({
      input:
        "hi give me a structured parsed version of the input resume. The jobTitle should be the latest jobTitle. Summarize this a JSON with exactly the following structure {name {firstName, lastName}, email, phone, city, jobTitle}. For the city, give their latest work location if you cannot find any otherwise specified location. If you don't get a response just make that field as an empty string",
    });
    const tool2 = new DynamicStructuredTool({
      name: 'structuring_the_response',
      description: 'gives a structured output!',
      schema: qnaSchema,
      func: async (data) => JSON.stringify(data),
    });
    const modelWithTools = llm.bindTools([tool2]);
    const response = await modelWithTools.invoke(
      `hi give me a structured parsed version of the input resume. If you don't get a response just leave that field null \ninput Data: ${JSON.stringify(
        result1.output,
      )}`,
    );

    // console.log(response?.tool_calls?.[0]);

    return response?.tool_calls?.[0]?.args;
  }

  async createPersonFromStructuredResumeData(data: PersonInputType) {
    const query = CREATE_ONE_PERSON;
    const result = await createRecord({ query: query, data: data });

    // console.log('result.resumeProcess', result);

    return result;
  }

  async createPersonAttachment(fullPath: string, personId: string) {
    return await createOneAttachment(fullPath, personId);
  }

  async createFullPersonRecord(path: string) {
    const uploadFileResponse = await this.uploadFile(path);
    const fullPathInDatabase = uploadFileResponse.uploadFile;

    const structuredResumeDataResponse =
      await this.loadAndGetStructuredOutputFromResume(path);

    const personRecordResponse =
      await this.createPersonFromStructuredResumeData(
        structuredResumeDataResponse,
      );
    const personDataCreated = personRecordResponse.data.data.createPerson;

    // eslint-disable-next-line unused-imports/no-unused-vars, @typescript-eslint/no-unused-vars
    const createPersonAttachmentResponse = await this.createPersonAttachment(
      fullPathInDatabase,
      personDataCreated.id,
    );

    console.log('DONE ONE MORE RECORD!');

    return personDataCreated;
  }

  // async mainExecutionWithMQ(dirPath: string) {}

  async mainExecutionNormal(dirPath: string) {
    const fileNamesWithPath: string[] =
      this.getFileNamesFromDirectoryPath(dirPath);

    // console.log(fileNamesWithPath);

    // for (let i = 0; i < 3; i++) {
    // const result = await this.createFullPersonRecord(fileNamesWithPath[i]);

    // console.log('DONE WITH ONE OTHER RECORD!');
    // }
    // fileNamesWithPath.map((filePath: string) => {
    //   this.createFullPersonRecord(filePath);
    // }),
    Promise.all(
      fileNamesWithPath.map((path) => {
        this.addToQueue(path);
      }),
    );
  }

  async addToQueue(filePath: string) {
    await this.messageQueueService.add<PathData>(
      ResumeToRecordCreationHandler.name,
      {
        filePath: filePath,
      },
    );
  }
}

@Injectable({})
export class ResumeToRecordCreationHandler
  implements MessageQueueJob<PathData>
{
  constructor(private readonly resumeProcess: ResumeToRecordCreationService) {}

  async handle(arg: PathData): Promise<void> {
    const filePath = arg.filePath;
    const response = await this.resumeProcess.createFullPersonRecord(filePath);

    console.log(response);
  }
}

export interface PathData {
  filePath: string;
}
