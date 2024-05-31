export const CREATE_ONE_PROMPT_ANSWER = `mutation CreateOnePromptAnswer($input: PromptAnswerCreateInput!) {
  createPromptAnswer(data: $input) {
    __typename
    favorites {
      edges {
        node {
          __typename
          clientInterviewId
          recruiterInterviewId
          personId
          updatedAt
          cvsentId
          jobId
          promptAnswerId
          id
          questionId
          offerId
          whatsappMessageId
          workspaceMemberId
          opportunityId
          createdAt
          screeningId
          companyId
          promptQuestionId
          answerId
          position
          candidateId
        }
        __typename
      }
      __typename
    }
    position
    candidateId
    updatedAt
    candidate {
      __typename
      status
      jobsId
      position
      id
      updatedAt
      engagementStatus
      peopleId
      name
      createdAt
      startChat
    }
    candidateAnswer
    createdAt
    candidateAnswerScore
    name
    id
  }
}`;
export const CREATE_ONE_PROMPT_QUESTION = `mutation CreateOnePromptQuestion($input: PromptQuestionCreateInput!) {
  createPromptQuestion(data: $input) {
    __typename
    jobId
    name
    attachments {
      edges {
        node {
          __typename
          clientInterviewId
          questionId
          fullPath
          opportunityId
          offerId
          activityId
          answerId
          personId
          type
          recruiterInterviewId
          candidateId
          companyId
          createdAt
          promptAnswerId
          updatedAt
          authorId
          id
          whatsappMessageId
          screeningId
          name
          jobId
          promptQuestionId
          cvsentId
        }
        __typename
      }
      __typename
    }
    job {
      __typename
      createdAt
      position
      id
      isActive
      updatedAt
      jobLocation
      companiesId
      recruiterId
      name
    }
    expectedAnswer
    position
    updatedAt
    question
    id
  }
}`;
