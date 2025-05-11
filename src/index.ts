import { getInput, info, setFailed, setOutput } from "@actions/core";
import { addLabels, ensureLabelsExist, loadIssueReferences } from "./github";
import gitCommits, { extractIssueIds, uniqueFilter } from "./utils";

const run = async () => {
  try {
    const from = getInput("from");
    const to = getInput("to");
    const color = getInput("color");
    const labels = getInput("labels")
      .split(",")
      .map((label) => label.trim())
      .filter((label) => label.length > 0)
      .filter(uniqueFilter);

    // get all commits
    const commits = await gitCommits(from, to);

    // gather all pr ids from commit
    const prIds = extractIssueIds(commits);

    // gather all issues/pr ids from pr bodies
    const issueIds = await loadIssueReferences(prIds);
    const ids = prIds.concat(issueIds).filter(uniqueFilter);

    // create labels
    await ensureLabelsExist(labels, color);

    // add labels to all issues and prs
    info(
      `Adding labels "${labels.join(
        '", "',
      )}" to following issues and PRs: ${ids.join(", ")}`,
    );
    await addLabels(ids, labels);

    setOutput("issues", JSON.stringify(ids));
  } catch (error) {
    if (error instanceof Error) {
      setFailed(error);
    } else {
      setFailed(`${error}`);
    }
  }
};

run();
