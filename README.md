# Add labels to issues and PRs based on git history

<a href="https://github.com/dlavrenuek/add-commit-labels/actions"><img alt="javscript-action status" src="https://github.com/dlavrenuek/add-commit-labels/actions/workflows/development.yaml/badge.svg"></a>

This GitHub action reads the git history, extract issue/PR ids from commit messages and PR descriptions and adds the
specified labels to these issues and pull requests. Can be used in combination with other actions to f.e. add version
labels to all issues that were included in a release.

To identify which issues will be labeled following steps are performed:

1. Git commit messages are retrieved using `${from}...${to}`
2. Issue/PR ids are extracted from commit messages (excluding commit body) using `/#[0-9]*/g`
3. For every extracted id - if a pull request is found it will be loaded and issue ids are extracted from PR body using
   the same format as in step 3
4. Given labels are added to all issues and pull requests identified in steps 2 and 3

The issue ids are first extracted from commit messages (only the first line, not full commit bodies).

## Example Usage

This example adds the labels `super` and `duper` to all issues/PRs found in git history from `v1.0.0` to HEAD

```yaml
steps:
  - uses: actions/checkout@v2
    with:
      fetch-depth: 0

  - uses: dlavrenuek/add-commit-labels@1.0.0
    with:
      from: v1.0.0
      to: HEAD
      labels: super, duper
```

### Input Variables

Inputs available through `with`:

| Input  | Description                                                                      | Required |
| ------ | -------------------------------------------------------------------------------- | -------- |
| from   | Commit SHA, tag or reference as starting point                                   | ✔        |
| to     | Commit SHA, tag or reference as ending point                                     | ✔        |
| labels | Labels that should be added to issues/PRs. Non-existing labels will be created   | ✔        |
| color  | Color for newly created labels. If not specified GitHub will pick a random color |          |

### Complete workflow

A complete workflow for creating a draft release can be
found [here](https://github.com/dlavrenuek/add-commit-labels/blob/master/.github/workflows/release.yml).

## Contribute

If you want to contribute, feel free to [open an issue](https://github.com/dlavrenuek/add-commit-labels/issues) or
submit a [pull request](https://github.com/dlavrenuek/add-commit-labels/pulls).
