import { extractIssueIds } from "./utils";

describe("extractIssueIds()", () => {
  it("extracts all ids", () => {
    const messages = [
      "feat: new awesome feature (#1234)",
      "chore: added something good in #567",
      "This PR closes #890",
      "This PR is super duper\nAlso fixes #98huh\nPart of #987, #654",
    ];

    const ids = extractIssueIds(messages);

    expect(ids).toEqual([1234, 567, 890, 98, 987, 654]);
  });

  it("does not include duplicates", () => {
    const messages = [
      "feat: new awesome feature (#1234)",
      "This PR is super duper\nAlso fixes #98huh\nPart of #1234",
    ];
    const ids = extractIssueIds(messages);

    expect(ids).toEqual([1234, 98]);
  });
});
