import { getInput, info, setFailed } from '@actions/core';
import gitCommits, { extractIssueIds, uniqueFilter } from './utils';
import { addLabels, ensureLabelsExist, loadPullRequests } from './github';

const run = async () => {
  try {
    const from = getInput('from');
    const to = getInput('to');
    const color = getInput('color');
    const labels = getInput('labels')
      .split(',')
      .map((label) => label.trim())
      .filter((label) => label.length > 0)
      .filter(uniqueFilter);

    // get all commits
    const commits = await gitCommits(from, to);

    // gather all pr ids from commit
    const prIds = extractIssueIds(commits);

    // gather all issues/pr ids from pr bodies
    const prs = await loadPullRequests(prIds);
    const issueIds = extractIssueIds(prs);
    const ids = prIds.concat(issueIds).filter(uniqueFilter);

    // create labels
    await ensureLabelsExist(labels, color);

    // add labels to all issues and prs
    info(
      `Adding labels "${labels.join(
        '", "'
      )}" to following issues and PRs: ${ids.join(', ')}`
    );
    await addLabels(ids, labels);
  } catch (error) {
    setFailed(error.message);
  }
};

run();
