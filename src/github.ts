import { info } from "@actions/core";
import { context } from "@actions/github";
import { GraphqlResponseError, graphql } from "@octokit/graphql";
import { Octokit } from "@octokit/rest";
import pLimit from "p-limit";
import { uniqueFilter } from "./utils";

const { repo, owner } = context.repo;
const api = graphql.defaults({
  headers: {
    authorization: `token ${process.env.GITHUB_TOKEN}`,
  },
});
const octokit = new Octokit({ auth: `token ${process.env.GITHUB_TOKEN}` });
// limit of 1 will make requests sequential to avoid secondary request limits
// ref: https://docs.github.com/en/rest/guides/best-practices-for-integrators#dealing-with-secondary-rate-limits
const requestLimit = pLimit(1);

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
    ids.map((id) =>
      requestLimit(async () => {
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
            },
          );

          return (
            repository?.pullRequest?.closingIssuesReferences?.nodes.map(
              ({ number }) => number,
            ) || []
          );
        } catch (error) {
          logApiError(`Retrieving pull request with id "${id}" failed`, error);
          return [];
        }
      }),
    ),
  );

  return ([] as number[]).concat(...references).filter(uniqueFilter);
};

export const ensureLabelsExist = async (
  labels: string[],
  color: string,
): Promise<void> => {
  await Promise.all(
    labels.map((name) =>
      requestLimit(async () => {
        try {
          await octokit.issues.getLabel({
            repo,
            owner,
            name,
          });
        } catch (_e) {
          info(`Label "${name}" does not exist and will be created`);

          await octokit.issues.createLabel({
            repo,
            owner,
            color: color || undefined,
            name,
          });
        }
      }),
    ),
  );
};

export const addLabels = async (
  issueIds: number[],
  labels: string[],
): Promise<unknown[]> =>
  Promise.all(
    issueIds.map((id) =>
      requestLimit(() =>
        octokit.issues.addLabels({
          repo,
          owner,
          issue_number: id,
          labels,
        }),
      ),
    ),
  );
