import { graphql, GraphqlResponseError } from '@octokit/graphql';
import { Octokit } from '@octokit/rest';
import { context } from '@actions/github';
import { info } from '@actions/core';
import pLimit from 'p-limit';
import { uniqueFilter } from './utils';

const { repo, owner } = context.repo;
const api = graphql.defaults({
  headers: {
    authorization: `token ${process.env.GITHUB_TOKEN}`,
  },
});
const octokit = new Octokit({ auth: `token ${process.env.GITHUB_TOKEN}` });
const requestLimit = pLimit(10);

const logApiError = (message: string, error: unknown) => {
  info(message);

  if (error instanceof GraphqlResponseError) {
    info(`Error message: ${error.message}`);
  } else {
    info(`Error message: ${error}`);
  }
};

export const loadIssueReferences = async (ids: number[]): Promise<number[]> => {
  type IssueReferenceResponse = {
    repository?: {
      pullRequest?: {
        closingIssuesReferences?: {
          nodes: {
            number: number;
          }[];
        };
      };
    };
  };

  const references = await Promise.all(
    ids.map(async (id) => {
      try {
        const { repository } = await api<IssueReferenceResponse>(
          `
            query IssueReference($owner: String!, $repo: String!, $id: Int!){
              repository(name: $repo, owner: $owner) {
                pullRequest(number: $id) {
                  closingIssuesReferences(first: 20) {
                    nodes {
                      number
                    }
                  }
                }
              }
            }`,
          {
            repo,
            owner,
            id,
          }
        );

        return (
          repository?.pullRequest?.closingIssuesReferences?.nodes.map(
            ({ number }) => number
          ) || []
        );
      } catch (error) {
        logApiError(`Retrieving pull request with id "${id}" failed`, error);
        return [];
      }
    })
  );

  return ([] as number[]).concat(...references).filter(uniqueFilter);
};

export const ensureLabelsExist = async (labels: string[], color: string) =>
  Promise.all(
    labels.map((name) =>
      requestLimit(async () => {
        try {
          await octokit.issues.createLabel({
            repo,
            owner,
            color: color || undefined,
            name,
          });
        } catch (e) {
          info(`Label ${name} could not be created, reason: ${e}`);
        }
      })
    )
  );

export const addLabels = async (issueIds: number[], labels: string[]) =>
  Promise.all(
    issueIds.map((id) =>
      requestLimit(() =>
        octokit.issues.addLabels({
          repo,
          owner,
          issue_number: id,
          labels,
        })
      )
    )
  );
