# GitHub Commit Notifier

Get webhook notifications for new commits on public GitHub repositories you do not own. GitHub already allows you to set up webhook notifications for your own repositories, but there is no option to receive notifications for public repositories that you do not own.

## Requirements

- [Node.js and npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm?ref=meilisearch-blog)

## Setup

1. Download the source code and enter directory:
```bash
git clone https://github.com/mhille813/github-commit-notifier.git
cd github-commit-notifier
```

2. Install dependencies:
```bash
npm install
```

3. Create a .env file with content:
```dotenv
# .env
REPO="{owner}/{repo}"       # Required
WEBHOOK_URL_LIST=["..."]    # Required
PERSONAL_ACCESS_TOKEN="..." # Optional
```
`PERSONAL_ACCESS_TOKEN` is *optional*, `REPO` and `WEBHOOK_URL_LIST` are *required*.
- `REPO`: The GitHub repository to track (Example: github.com/**--> mhille813/github-commit-notifier <--**)
- `WEBHOOK_URL_LIST`: List of webhook URLs, separated by commas, must be written on a single line in the .env file
- `PERSONAL_ACCESS_TOKEN`: Optional [Personal Access Token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens) for authenticating API requests.

4. Run the program:
```bash
node app.js
```

## List of dependencies

- [dotenv](https://www.npmjs.com/package/dotenv)

## How it works

This program works by periodically checking the [commits REST API](https://docs.github.com/en/rest/commits/commits?apiVersion=2026-03-10) with the [`since`](https://docs.github.com/en/rest/commits/commits?apiVersion=2026-03-10#:~:text=since) and [`until`](https://docs.github.com/en/rest/commits/commits?apiVersion=2026-03-10#:~:text=until) query parameters. Every time the API is called, the program updates these variables for the next time it calls the API, this way only new commits are returned. If there are new commits, the program loops over them and uses the following data to format the webhook embed messages:

- (if available): commitData.author.login
- (if available): commitData.author.html_url
- (if available): commitData.author.avatar_url
- commitData.commit.message
- commitData.html_url
- commitData.sha

This data is then sent to the specified webhook URLs in a nicely formatted embed message.
![Example image](/example.png)
