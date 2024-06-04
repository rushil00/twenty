/* eslint-disable no-console */
import { extname } from 'path';

import { HNSWLib } from '@langchain/community/vectorstores/hnswlib';
import {
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
  ChatPromptTemplate,
} from '@langchain/core/prompts';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { OpenAIEmbeddings, ChatOpenAI } from '@langchain/openai';
import { createOpenAIFnRunnable } from 'langchain/chains/openai_functions';
import { DocxLoader } from 'langchain/document_loaders/fs/docx';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { JsonOutputFunctionsParser } from 'langchain/output_parsers';
import { z } from 'zod';
import zodToJsonSchema from 'zod-to-json-schema';

import {
  CV_QUESTION_PROMPT_1,
  QNA_TO_CATEGORY_PROMPT,
  SCORING_PROMPT_1,
} from 'src/modules/gpt-requests/constants/prompts';
import {
  ScoredDataType,
  StructuredPromptType,
} from 'src/modules/gpt-requests/types/gpt-requests.service-types';

// @Injectable({})
export class CVProcessing {
  path: string;
  loadingPromise: Promise<void>;
  loader: PDFLoader | DocxLoader;
  doc: any;
  chunks: any;
  vectorStore: HNSWLib;
  fileName: string;
  // private inputPromptProcessing = new CustomPrompt();
  // TODO: change default path to something else!
  constructor(
    path = '/home/rushiil/Downloads/manufacturing-cvs/VIshal Sharma -Curriculum Vitae -2.pdf',
    fileName = '/home/rushiil/Downloads/manufacturing-cvs/VIshal Sharma -Curriculum Vitae -2.pdf',
  ) {
    this.path = path;
    this.fileName = fileName;
    // Call loaderFunc in the constructor
    this.loadingPromise = this.loaderFunc();
  }

  async loaderFunc() {
    if (extname(this.path.toLowerCase()) === '.pdf') {
      this.loader = new PDFLoader(this.path);
      const data = await this.loader.load();

      this.doc = data;
    } else if (
      extname(this.path.toLowerCase()) === '.docx' ||
      extname(this.path.toLowerCase()) === '.doc'
    ) {
      this.loader = new DocxLoader(this.path);
      const data = await this.loader.load();

      this.doc = data;
    } else {
      throw new Error(
        'Unsupported file format. Only PDF and DOCX files are supported.',
      );
    }
  }

  async waitForLoad() {
    await this.loadingPromise;
  }

  async splitDocAfterLoading() {
    // Ensure that data is loaded before accessing it
    await this.waitForLoad().then(async () => {
      // const splitter = new RecursiveCharacterTextSplitter({
      //   chunkSize: 1000,
      //   chunkOverlap: 20,
      // });
      // this.chunks = await splitter.splitDocuments(this.doc);
    });
  }

  async createEmbeddings() {
    await this.splitDocAfterLoading().then(async () => {
      // console.log(this.chunks);
      const embeddings = new OpenAIEmbeddings(); //created embeddings
      const vectorStore = await HNSWLib.fromDocuments(
        //using HNSW vector store
        this.doc,
        embeddings,
      );

      this.vectorStore = vectorStore;
    });
  }

  async processPromptToStructuredData(prompt = '') {
    const output = async () => {
      // ====================================================================
      // STEP 1: Create the category string array from the questions
      // ====================================================================
      const qnaToCategoryPrompt = QNA_TO_CATEGORY_PROMPT;

      const qnaModel = new ChatOpenAI({ temperature: 0, maxTokens: -1 });

      const qnaSchema = z.object({
        data: z.array(
          z
            .object({
              key: z
                .string()
                .describe(
                  'Give a one word propertyName suitable with the question',
                ),
              question: z.string(),
              expectedAns: z.string(),
            })
            .describe(qnaToCategoryPrompt),
        ),
      });
      const toolForParse = new DynamicStructuredTool({
        name: 'responseTool',
        description: 'Returns response to the user',
        schema: qnaSchema,
        func: async ({ data }) => JSON.stringify(data),
      });
      const modelWithTools = qnaModel.bindTools([toolForParse]);
      const response = await modelWithTools.invoke(prompt);

      return response;
    };

    return await output();
  }

  // TODO: correct this function
  async askStructuredQuestionsFromCV(promptStructured: StructuredPromptType[]) {
    const output = await this.createEmbeddings().then(async () => {
      // ====================================================================
      // STEP 2: Create the category string array from the questions
      // ====================================================================
      const cvQNAModel = new ChatOpenAI({ temperature: 0, maxTokens: -1 });
      const cvQNAPrompt = '\nQuestions: {questions}';
      const CVData = this.vectorStore.docstore._docs.get('0')?.pageContent;
      const cvDataPrompt = '\nCV Data: \n{CVData}';
      const cvPrompt = [
        SystemMessagePromptTemplate.fromTemplate(cvQNAPrompt),
        HumanMessagePromptTemplate.fromTemplate(cvDataPrompt),
      ];
      const questions = promptStructured.map((question) => {
        return { question: question.question, key: question.name };
      });

      // console.log(promptStructured);
      const cvPromptToSend = ChatPromptTemplate.fromMessages(cvPrompt);
      const answerSchema = z.object(
        Object.fromEntries(
          promptStructured.map((prompt) => [
            prompt.name,
            z.object({
              question: z.string().describe('asked question'),
              response: z.string().describe('one line answer from CV'),
            }), //.describe(`score to the contexts question wrt CV data`),
          ]),
        ),
      );
      //   console.log(zodToJsonSchema(answerSchema))
      const scoreToolFunction = {
        name: 'scoreTool',
        description: CV_QUESTION_PROMPT_1,
        parameters: zodToJsonSchema(answerSchema),
      };
      const runnable = createOpenAIFnRunnable({
        functions: [scoreToolFunction],
        llm: cvQNAModel,
        prompt: cvPromptToSend,
        enforceSingleFunctionUsage: true, // Default is true
        outputParser: new JsonOutputFunctionsParser(),
      });
      const responseAns = await runnable.invoke({
        CVData: CVData,
        questions: JSON.stringify(questions),
      });

      // console.log(responseAns);
      // -------------------------------------------------------------
      console.log('responseAns.CVProcess: ', responseAns);

      const scoringData: ScoredDataType[] = [];

      console.log('promptStructured.CVProcess', promptStructured);
      for (const res of promptStructured) {
        const tempVariable = {
          key: res.name,
          question: res.question,
          expectedAnswer: res?.expectedAnswer || '',
          candidateAnswer: responseAns[res.name].response,
        };

        // console.log(tempVariable)
        scoringData.push(tempVariable);
      }

      return { responseAns: responseAns, scoringData: scoringData };
    });

    return output;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getScores(scoringData: ScoredDataType[]) {
    const output = async () => {
      // ====================================================================
      // Step 3: Score these obtained responses by comparison.
      // ====================================================================
      // Make the scoring logic!

      // console.log('ResponseAns', responseAns);
      const scoringModel = new ChatOpenAI({ temperature: 0, maxTokens: -1 });
      const scoringDataPrompt = 'Scoring Data: {scoringData}';
      const scorePrompt = [
        // SystemMessagePromptTemplate.fromTemplate(cvQNAPrompt),
        HumanMessagePromptTemplate.fromTemplate(scoringDataPrompt),
      ];
      const scoringPromptToSend = ChatPromptTemplate.fromMessages(scorePrompt);

      const scoringSchema = z.object({
        response: z.array(
          z.object({
            key: z.string().describe('the unique identifier key of question'),
            question: z.string(),
            candidateAnswer: z.string(),
            candidateAnswerScore: z
              .number()
              .describe("Score of the person's answer"),
          }),
        ),
      });

      const scoringFunction = {
        name: 'scoringFunc',
        description: SCORING_PROMPT_1,
        parameters: zodToJsonSchema(scoringSchema),
      };
      const scoringRunnable = createOpenAIFnRunnable({
        functions: [scoringFunction],
        llm: scoringModel,
        prompt: scoringPromptToSend,
        enforceSingleFunctionUsage: true, // Default is true
        outputParser: new JsonOutputFunctionsParser(),
      });

      // console.log('Scoring Data: ', scoringData);
      const responseScore:
        | {
            response: ScoredDataType;
          }
        | any = await scoringRunnable.invoke({
        scoringData: JSON.stringify(scoringData),
      });

      // console.log('responseScore', responseScore);
      // console.log((performance.now()-start)/1000)
      // console.log(responseScore);
      const outputResponse: ScoredDataType[] = [];

      if (Object.keys(responseScore).includes('response')) {
        for (const res of responseScore.response) {
          // TODO: REFACTOR and remove outputResponse Variable
          outputResponse.push({
            key: res.key,
            question: res.question,
            candidateAnswer: res.candidateAnswer,
            candidateAnswerScore: res.candidateAnswerScore,
          });
        }
      }

      // console.log(outputResponse)
      // return outputResponse;
      return responseScore.response;
    };

    return await output();
  }

  async getScoresFromCustomPrompt({ prompts, record }) {
    // const response: any = await this.processPromptToStructuredData(prompts);
    const { scoringData, responseAns } =
      await this.askStructuredQuestionsFromCV(prompts);
    // console.log(scoringData);
    // console.log(responseAns);
    const scoredData = await this.getScores(scoringData);

    console.log('scoredData.getScores.CVProcessing', scoredData);
    const candidateId = record.id;

    return { scoredData, candidateId, responseAns };
  }
}
