# Contributing to frontend-toolkit-utilities

When contributing to an existing package, or building a new one, work should:

- Always be done in a branch
- Always follow the best practices in the [front-end playbook](https://github.com/springernature/frontend-playbook/)
- Always involve updating or adding to the relevant parts of the documentation
- Always be linted
- **May** include any versioning information (see separate [versioning guidelines](#versioning))
    - If this is a new package version as `0.0.0` in the `package.json` to stop auto-publication
- Always be submitted via a pull request in the [`#frontend-pr`](https://springernature.slack.com/messages/C0GJK53TQ/) slack room

### Pull requests

- Good pull requests - patches, improvements, new features - should remain focused in scope and avoid containing unrelated commits. You should follow the guidelines in the [front-end playbook](https://github.com/springernature/frontend-playbook/blob/master/practices/code-review.md)
- Please adhere to the coding conventions used throughout a project (indentation, accurate comments, etc.) and any other requirements (such as test coverage)
- Merging pull requests should be done via [squash and merge](https://help.github.com/articles/about-pull-request-merges/#squash-and-merge-your-pull-request-commits)
- Once your pull request has been merged back to the master branch, you can follow the [versioning guidelines](#versioning) below to publish your changes. **Note**: you do not have to create a new version after every merge. Related merges can be bundled into one new version

### Linting

Whenever you make changes to this repo, you should run the linter locally before you commit your work. The following command is available to do this:

```
$ npm run lint
```

### Versioning

All packages are versioned individually using [semver](http://semver.org/). You should read through the semver documentation, and the guidelines in the [front-end playbook](https://github.com/springernature/frontend-playbook/blob/master/practices/semver.md).

To publish a new version of a package, or to publish a new package:

1. Version commits can be managed in their own PR or as part of your package update PR
2. Increment either the major, minor, or patch version in the relevant `package.json`. If you're unsure which, have a chat about it or re-read the semver docs
    * Development versions of a package should start at version `0.1.0` as per the [semver documentation](https://semver.org/#spec-item-4)
3. Add an entry to the relevant `HISTORY.md` file outlining the changes in the new version. Take your time, this log should be useful to developers – it should help them make decisions about whether they can upgrade. If this file is not updated then travis will fail the build.
4. (Make sure you only publish one package at a time)
6. Code review your pull request and merge
7. The build system will automatically publish your new version based on the `package.json` version

### Vulnerability detection

After publication of a new package, it needs to be added to Snyk so that the dependencies can be tracked. More information on Snyk can be found in the [front-end playbook](https://github.com/springernature/frontend-playbook/blob/master/practices/managing-node-projects.md#dependency-management-tools)

To add a new package to Snyk:

1. Make sure that you are authorised via your GutHub account
2. Log into Snyk and switch to the `springernature` organisation
3. Switch to the `Projects` tab and search for `frontend-toolkit-utilities`
4. Click the + icon to add your new package
5. Add the target path to the `package.json` file e.g. `packages/my-package/package.json`
