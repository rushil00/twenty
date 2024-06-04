export type CVProcessingJobMQData = {
  data: {
    question: string;
    path?: string;
  };
};

export type CVProcessingJobMQData2 = {
  data: {
    prompt: any;
    record: any;
  };
};

export interface StructuredPromptType {
  key: string;
  name: string;
  question: string;
  expectedAnswer?: string;
}

export type ScoredDataType = {
  question: string;
  key: string;
  expectedAnswer?: string;
  candidateAnswer: string;
  candidateAnswerScore?: number;
};

export interface Jobs {
  name: string;
  id: string;
  recruiterId: string;
  jobLocation: string;
  companies: any; //TODO: Replace with company type
}

export interface CandidateNode {
  name: string;
  id: string;
  engagementStatus: boolean;
  phoneNumber: string;
  email: string;
  input: string;
  startChat: boolean;
  jobs: Jobs;
  people: any; //TODO: replace with personNode type!
}

export interface CandidatesEdge {
  node: CandidateNode;
}
