import { UPDATE_ONE_CANDIDATE } from 'src/modules/gpt-requests/graphql/object-records/constants/record-mutations';
import { FIND_MANY_CANDIDATES } from 'src/modules/gpt-requests/graphql/object-records/constants/record-queries';
import { findAllQuery } from 'src/modules/gpt-requests/graphql/object-records/database-operations/create-record';

export const updateCustomPromptCumulativeScore = async (id: string) => {
  const candidateDataResponse = await findAllQuery({
    query: FIND_MANY_CANDIDATES,
    variables: {
      filter: {
        id: {
          eq: id,
        },
      },
    },
  });
  const candidateDataPromptAnswers =
    candidateDataResponse.data.candidates.edges[0].node.promptAnswers.edges;

  if (candidateDataPromptAnswers.length === 0) {
    return `This is empty candidateId: ${id}`;
  } else {
    const scores = candidateDataPromptAnswers.map(
      (candidateDataPromptAnswer) => {
        return candidateDataPromptAnswer.node.candidateAnswerScore;
      },
    );
    const cumulativeScore = scores.reduce(
      (acc: number, curr: number) => acc + curr,
      0,
    );
    const updatedCandidateCumulativeScoreResponse = await findAllQuery({
      query: UPDATE_ONE_CANDIDATE,
      variables: {
        idToUpdate: id,
        input: {
          cumulativeCustomPromptScore: cumulativeScore,
        },
      },
    });

    return updatedCandidateCumulativeScoreResponse;
  }
};
