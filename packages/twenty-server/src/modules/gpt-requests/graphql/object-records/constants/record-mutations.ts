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
    expectedAnswer
    position
    updatedAt
    question
    id
  }
}`;

export const CREATE_ONE_PERSON = `mutation CreateOnePerson($input: PersonCreateInput!) {
  createPerson(data: $input) {
    __typename
    email
    xLink {
      label
      url
      __typename
    }
    phone
    attachments {
      edges {
        node {
          __typename
          clientInterviewId
          createdAt
          fullPath
          candidateId
          answerId
          recruiterInterviewId
          authorId
          activityId
          screeningId
          opportunityId
          offerId
          questionId
          updatedAt
          promptQuestionId
          companyId
          jobId
          personId
          whatsappMessageId
          promptAnswerId
          id
          cvsentId
          type
          name
        }
        __typename
      }
      __typename
    }
    createdAt
    position
    updatedAt
    companyId
    name {
      firstName
      lastName
      __typename
    }
    id
    avatarUrl
    jobTitle
    linkedinLink {
      label
      url
      __typename
    }
    city
  }
}`;

export const UPDATE_ONE_PERSON = `mutation UpdateOnePerson($idToUpdate: ID!, $input: PersonUpdateInput!) {
  updatePerson(id: $idToUpdate, data: $input) {
    __typename
    email
    xLink {
      label
      url
      __typename
    }
    phone
    company {
      __typename
      createdAt
      idealCustomerProfile
      accountOwnerId
      employees
      annualRecurringRevenue {
        amountMicros
        currencyCode
        __typename
      }
      position
      linkedinLink {
        label
        url
        __typename
      }
      xLink {
        label
        url
        __typename
      }
      descriptionOneliner
      domainName
      updatedAt
      address
      name
      id
    }
    attachments {
      edges {
        node {
          __typename
          clientInterviewId
          createdAt
          fullPath
          candidateId
          answerId
          recruiterInterviewId
          authorId
          activityId
          screeningId
          opportunityId
          offerId
          questionId
          updatedAt
          promptQuestionId
          companyId
          jobId
          personId
          whatsappMessageId
          promptAnswerId
          id
          cvsentId
          type
          name
        }
        __typename
      }
      __typename
    }
    createdAt
    position
    updatedAt
    companyId
    name {
      firstName
      lastName
      __typename
    }
    id
    avatarUrl
    jobTitle
    linkedinLink {
      label
      url
      __typename
    }
    city
  }
}`;

export const CREATE_ONE_ATTACHMENT = `mutation CreateOneAttachment($input: AttachmentCreateInput!) {
  createAttachment(data: $input) {
    __typename
    fullPath
    personId
    type
    recruiterInterviewId
    candidateId
    person {
      __typename
      phone
      id
      email
      avatarUrl
      position
      companyId
      updatedAt
      city
      name {
        firstName
        lastName
        __typename
      }
      xLink {
        label
        url
        __typename
      }
      jobTitle
      createdAt
      linkedinLink {
        label
        url
        __typename
      }
    }
    createdAt
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
}`;
