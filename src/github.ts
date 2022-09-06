import { Octokit } from '@octokit/rest';
import { context } from '@actions/github';
import { info } from '@actions/core';
import pLimit from 'p-limit';

const octokit = new Octokit({ auth: `token ${process.env.GITHUB_TOKEN}` });
const requestLimit = pLimit(10);

export const loadPullRequests = async (ids: number[]) =>
  (
    await Promise.all(
      ids.map((id) =>
        requestLimit(async () => {
          try {
            const pr = await octokit.pulls.get({
              ...context.repo,
              pull_number: id,
            });

            if (pr.status !== 200) {
              return null;
            }

            return pr.data.body;
          } catch (e) {
            info(
              `Retrieving pull request with id "${id}" failed with the message: ${e}`
            );
            return null;
          }
        })
      )
    )
  ).filter((pr): pr is string => pr !== null);

export const ensureLabelsExist = async (labels: string[], color: string) =>
  Promise.all(
    labels.map((name) =>
      requestLimit(async () => {
        try {
          await octokit.issues.createLabel({
            ...context.repo,
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
          ...context.repo,
          issue_number: id,
          labels,
        })
      )
    )
  );
