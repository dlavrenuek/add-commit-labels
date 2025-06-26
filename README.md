# Add labels to issues and PRs based on git history

<a href="https://github.com/dlavrenuek/add-commit-labels/actions"><img alt="javscript-action status" src="https://github.com/dlavrenuek/add-commit-labels/actions/workflows/development.yaml/badge.svg"></a>

This GitHub action reads the git history, extract issue/PR ids from commit messages and PR closing references and adds
the specified labels to these issues and pull requests. Can be used in combination with other actions to f.e. add
version labels to all issues that were included in a release.

To identify which issues will be labeled following steps are performed:

1. Git commit messages are retrieved using `${from}...${to}`
2. Issue/PR ids are extracted from commit messages (excluding commit body) using `/#[0-9]*/g`
3. For every extracted id - if a pull request is found, its closing issue references will be loaded\*
4. Given labels are added to all issues and pull requests identified in steps 2 and 3

The issue ids are first extracted from commit messages (only the first line, not full commit bodies).

\*Only the first 20 closing issue references for every pull request will be retrieved.

## Example Usage

This example adds the labels `super` and `duper` to all issues/PRs found in git history from `v1.0.0` to HEAD

```yaml
steps:
  - uses: actions/checkout@v3
    with:
      fetch-depth: 0

  - uses: dlavrenuek/add-commit-labels@1.0.4
    with:
      # Commit SHA, tag or reference as starting point (excluded from history)
      from: 1.0.0
      # Commit SHA, tag or reference as ending point (included in history)
      to: HEAD
      # Comma separated labels that should be added to issues/PRs. Non-existing labels will be created
      labels: super, duper
      # Color for newly created labels (optional, RGB hex format without leading `#`)
      color: aa55aa
    env:
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Input Variables

Inputs available through `with`:

| Input  | Description                                                                                    | Required |
| ------ | ---------------------------------------------------------------------------------------------- | -------- |
| from   | Commit SHA, tag or reference as starting point (excluded from history)                         | ✔       |
| to     | Commit SHA, tag or reference as ending point (included in history)                             | ✔       |
| labels | Comma separated labels that should be added to issues/PRs. Non-existing labels will be created | ✔       |
| color  | Color for newly created labels. If not specified GitHub will pick a random color               |          |

### Output Variables

Output available through the step's `outputs`:

| Output | Description                                                                |
| ------ | -------------------------------------------------------------------------- |
| issues | Issue and PR ids in JSON format that were labeled. Example: [65, 102, 115] |

## Contribute

If you want to contribute, feel free to [open an issue](https://github.com/dlavrenuek/add-commit-labels/issues) or
submit a [pull request](https://github.com/dlavrenuek/add-commit-labels/pulls).
