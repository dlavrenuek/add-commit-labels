import simpleGit from "simple-git";

const git = simpleGit();

export const uniqueFilter = <T>(value: T, index: number, self: T[]): boolean =>
  self.indexOf(value) === index;

export const extractIssueIds = (messages: string[]): number[] =>
  ([] as number[])
    .concat(
      ...messages.map(
        (message) =>
          message
            .match(/#[0-9]*/g)
            ?.map((id) => id.substring(1))
            .map((id) => Number.parseInt(id))
            .filter((id) => !Number.isNaN(id)) || [],
      ),
    )
    .filter(uniqueFilter);

export default async function gitCommits(
  from: string,
  to: string,
): Promise<string[]> {
  const log = await git.log({
    from,
    to,
  });

  return log.all.map(({ message }) => message);
}
