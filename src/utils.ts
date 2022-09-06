import simpleGit from 'simple-git';

const git = simpleGit();

export const uniqueFilter = <T>(value: T, index: number, self: T[]) =>
  self.indexOf(value) === index;

export const extractIssueIds = (messages: string[]) =>
  ([] as number[])
    .concat(
      ...messages.map(
        (message) =>
          message
            .match(/#[0-9]*/g)
            ?.map((id) => id.substring(1))
            .map((id) => parseInt(id))
            .filter((id) => !isNaN(id)) || []
      )
    )
    .filter(uniqueFilter);

export default async function gitCommits(from: string, to: string) {
  const log = await git.log({
    from,
    to,
  });

  return log.all.map(({ message }) => message);
}
