require('dotenv').config();

// Change this value to control how often the program should check for new commits.
const intervalSeconds = 60;

// Do not change
let sinceTimestamp = new Date().toISOString();
let untilTimestamp;


async function sendWebhooks(webhookEmbeds) {
    if (webhookEmbeds.length === 0) {
        console.log("Unable to send webhooks: 0 embeds")
        return;
    }

    console.log("Sending webhooks");

    // Multiple webhooks support
    for (const webhookUrl of JSON.parse(process.env.WEBHOOK_URL_LIST)) {
        const embedListCopy = webhookEmbeds.slice();
        do {
            const webhookData = {
                embeds: embedListCopy.splice(0, 10)
            }
            await fetch(webhookUrl, {
                method: "POST",
                body: JSON.stringify(webhookData),
                headers: {
                    "Content-Type": "application/json"
                }
            }).catch(error => console.error("Error sending webhook:", error));
        } while (embedListCopy.length > 0);
    }
}


function checkNewCommits() {
    console.log("Checking new commits");

    const headers = {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2026-03-10",
    }
    // Optional auth token
    if (process.env.PERSONAL_ACCESS_TOKEN !== undefined) {
        headers.Authorization = `Bearer ${process.env.PERSONAL_ACCESS_TOKEN}`;
    }

    // Added untilTimestamp to prevent edge cases
    untilTimestamp = new Date().toISOString();
    fetch(`https://api.github.com/repos/${process.env.REPO}/commits?since=${sinceTimestamp}&until=${untilTimestamp}`, {
        headers: headers
    })
        .then(response => {
            if (!response.ok) {
                return Promise.reject(`${response.status}: ${response.statusText}`);
            }
            console.log("Response OK");
            return response.json();
        })
        .then(data => {
            sinceTimestamp = untilTimestamp;

            if (data.length === 0) {
                console.log("No new commits");
                return;
            }

            console.log(`Processing ${data.length} new commits`);
            let webhookEmbeds = [];
            data.forEach(commitData => {
                const userName = commitData.author?.login;
                const userURL = commitData.author?.html_url;
                const userAvatarURL = commitData.author?.avatar_url;

                const commitMessage = commitData.commit.message;
                const commitURL = commitData.html_url;
                const commitSHA = commitData.sha;
                const commitSHAShort = commitSHA.slice(0, 7);

                const webhookEmbedData = {
                    title: `Commit ${commitSHAShort}`,
                    description: commitMessage,
                    color: 1031998,
                    url: commitURL
                };
                if (userName !== undefined && userURL !== undefined && userAvatarURL !== undefined) {
                    webhookEmbedData.author = {
                        name: userName,
                        icon_url: userAvatarURL,
                        url: userURL
                    };
                }
                webhookEmbeds.push(webhookEmbedData);
            });

            // API lists commits from newest to oldest, but webhook should list from oldest to newest
            webhookEmbeds.reverse();

            sendWebhooks(webhookEmbeds);
        })
        .catch(error => console.error("Error checking commits:", error));
}

setInterval(checkNewCommits, intervalSeconds * 1000);