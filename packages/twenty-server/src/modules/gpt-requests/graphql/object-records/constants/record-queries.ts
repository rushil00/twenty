export const FIND_MANY_PROMPTS_QUESTION = `
  query FindManyPromptQuestions(
    $filter: PromptQuestionFilterInput
    $orderBy: PromptQuestionOrderByInput
    $lastCursor: String
    $limit: Int
  ) {
    promptQuestions(
      filter: $filter
      orderBy: $orderBy
      first: $limit
      after: $lastCursor
    ) {
      edges {
        node {
          __typename
          name
          updatedAt
          promptAnswer {
            edges {
              node {
                __typename
                promptQuestionId
                position
                name
                candidateId
                createdAt
                id
                candidateAnswerScore
                updatedAt
                candidateAnswer
              }
              __typename
            }
            __typename
          }
          id
          timelineActivities {
            edges {
              node {
                __typename
                promptAnswerId
                questionId
                opportunityId
                properties
                recruiterInterviewId
                whatsappMessageId
                happensAt
                cvsentId
                promptQuestionId
                linkedRecordCachedName
                linkedRecordId
                answerId
                linkedObjectMetadataId
                personId
                screeningId
                name
                clientInterviewId
                candidateId
                companyId
                offerId
                createdAt
                jobId
                workspaceMemberId
                id
                updatedAt
              }
              __typename
            }
            __typename
          }
          createdAt
          favorites {
            edges {
              node {
                __typename
                recruiterInterviewId
                id
                companyId
                candidateId
                screeningId
                jobId
                personId
                createdAt
                whatsappMessageId
                offerId
                answerId
                promptQuestionId
                updatedAt
                cvsentId
                clientInterviewId
                workspaceMemberId
                opportunityId
                position
                questionId
                promptAnswerId
              }
              __typename
            }
            __typename
          }
          activityTargets {
            edges {
              node {
                __typename
                recruiterInterviewId
                companyId
                candidateId
                activityId
                personId
                whatsappMessageId
                id
                opportunityId
                updatedAt
                promptAnswerId
                offerId
                clientInterviewId
                screeningId
                cvsentId
                jobId
                promptQuestionId
                questionId
                createdAt
                answerId
              }
              __typename
            }
            __typename
          }
          attachments {
            edges {
              node {
                __typename
                clientInterviewId
                recruiterInterviewId
                personId
                fullPath
                screeningId
                promptQuestionId
                cvsentId
                name
                whatsappMessageId
                createdAt
                offerId
                promptAnswerId
                activityId
                authorId
                candidateId
                questionId
                id
                opportunityId
                answerId
                updatedAt
                type
                jobId
                companyId
              }
              __typename
            }
            __typename
          }
          expectedAnswer
          job {
            __typename
            id
            name
            isActive
            companiesId
            updatedAt
            jobLocation
            position
            createdAt
            recruiterId
          }
          position
          jobId
        }
        cursor
        __typename
      }
      pageInfo {
        hasNextPage
        startCursor
        endCursor
        __typename
      }
      totalCount
      __typename
    }
  }
`;
export const FIND_MANY_PROMPT_ANSWERS = `
  query FindManyPromptAnswers(
    $filter: PromptAnswerFilterInput
    $orderBy: PromptAnswerOrderByInput
    $lastCursor: String
    $limit: Int
  ) {
    promptAnswers(
      filter: $filter
      orderBy: $orderBy
      first: $limit
      after: $lastCursor
    ) {
      edges {
        node {
          __typename
          promptQuestionId
          timelineActivities {
            edges {
              node {
                __typename
                promptAnswerId
                questionId
                opportunityId
                properties
                recruiterInterviewId
                whatsappMessageId
                happensAt
                cvsentId
                promptQuestionId
                linkedRecordCachedName
                linkedRecordId
                answerId
                linkedObjectMetadataId
                personId
                screeningId
                name
                clientInterviewId
                candidateId
                companyId
                offerId
                createdAt
                jobId
                workspaceMemberId
                id
                updatedAt
              }
              __typename
            }
            __typename
          }
          position
          name
          candidateId
          attachments {
            edges {
              node {
                __typename
                clientInterviewId
                recruiterInterviewId
                personId
                fullPath
                screeningId
                promptQuestionId
                cvsentId
                name
                whatsappMessageId
                createdAt
                offerId
                promptAnswerId
                activityId
                authorId
                candidateId
                questionId
                id
                opportunityId
                answerId
                updatedAt
                type
                jobId
                companyId
              }
              __typename
            }
            __typename
          }
          createdAt
          promptQuestion {
            __typename
            name
            updatedAt
            id
            createdAt
            expectedAnswer
            position
            jobId
          }
          id
          activityTargets {
            edges {
              node {
                __typename
                recruiterInterviewId
                companyId
                candidateId
                activityId
                personId
                whatsappMessageId
                id
                opportunityId
                updatedAt
                promptAnswerId
                offerId
                clientInterviewId
                screeningId
                cvsentId
                jobId
                promptQuestionId
                questionId
                createdAt
                answerId
              }
              __typename
            }
            __typename
          }
          candidateAnswerScore
          updatedAt
          candidateAnswer
          candidate {
            __typename
            startChat
            status
            jobsId
            aCustomQuestion
            position
            updatedAt
            name
            peopleId
            createdAt
            id
            engagementStatus
          }
          favorites {
            edges {
              node {
                __typename
                recruiterInterviewId
                id
                companyId
                candidateId
                screeningId
                jobId
                personId
                createdAt
                whatsappMessageId
                offerId
                answerId
                promptQuestionId
                updatedAt
                cvsentId
                clientInterviewId
                workspaceMemberId
                opportunityId
                position
                questionId
                promptAnswerId
              }
              __typename
            }
            __typename
          }
        }
        cursor
        __typename
      }
      pageInfo {
        hasNextPage
        startCursor
        endCursor
        __typename
      }
      totalCount
      __typename
    }
  }
`;

export const FIND_MANY_PROMPT_ANSWERS_2 = `query FindManyPromptAnswers($filter: PromptAnswerFilterInput, $orderBy: PromptAnswerOrderByInput, $lastCursor: String, $limit: Int) {
  promptAnswers(
    filter: $filter
    orderBy: $orderBy
    first: $limit
    after: $lastCursor
  ) {
    edges {
      node {
        __typename
        promptQuestionId
        timelineActivities {
          edges {
            node {
              __typename
              promptAnswerId
              questionId
              opportunityId
              properties
              recruiterInterviewId
              whatsappMessageId
              happensAt
              cvsentId
              promptQuestionId
              linkedRecordCachedName
              linkedRecordId
              answerId
              linkedObjectMetadataId
              personId
              screeningId
              name
              clientInterviewId
              candidateId
              companyId
              offerId
              createdAt
              jobId
              workspaceMemberId
              id
              updatedAt
            }
            __typename
          }
          __typename
        }
        position
        name
        candidateId
        attachments {
          edges {
            node {
              __typename
              clientInterviewId
              recruiterInterviewId
              personId
              fullPath
              screeningId
              promptQuestionId
              cvsentId
              name
              whatsappMessageId
              createdAt
              offerId
              promptAnswerId
              activityId
              authorId
              candidateId
              questionId
              id
              opportunityId
              answerId
              updatedAt
              type
              jobId
              companyId
            }
            __typename
          }
          __typename
        }
        createdAt
        promptQuestion {
          __typename
          name
          updatedAt
          id
          createdAt
          question
          expectedAnswer
          position
          jobId
        }
        id
        activityTargets {
          edges {
            node {
              __typename
              recruiterInterviewId
              companyId
              candidateId
              activityId
              personId
              whatsappMessageId
              id
              opportunityId
              updatedAt
              promptAnswerId
              offerId
              clientInterviewId
              screeningId
              cvsentId
              jobId
              promptQuestionId
              questionId
              createdAt
              answerId
            }
            __typename
          }
          __typename
        }
        candidateAnswerScore
        updatedAt
        candidateAnswer
        candidate {
          __typename
          startChat
          status
          jobsId
          aCustomQuestion
          position
          updatedAt
          name
          peopleId
          createdAt
          id
          engagementStatus
        }
        favorites {
          edges {
            node {
              __typename
              recruiterInterviewId
              id
              companyId
              candidateId
              screeningId
              jobId
              personId
              createdAt
              whatsappMessageId
              offerId
              answerId
              promptQuestionId
              updatedAt
              cvsentId
              clientInterviewId
              workspaceMemberId
              opportunityId
              position
              questionId
              promptAnswerId
            }
            __typename
          }
          __typename
        }
      }
      cursor
      __typename
    }
    pageInfo {
      hasNextPage
      startCursor
      endCursor
      __typename
    }
    totalCount
    __typename
  }
}`;
