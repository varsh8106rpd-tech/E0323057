const { getNotifications } = require("./api");

function getWeight(type) {
    switch (type) {
        case "Placement":
            return 3;
        case "Result":
            return 2;
        case "Event":
            return 1;
        default:
            return 0;
    }
}

function calculateScore(notification) {

    const weight = getWeight(notification.Type);

    const ageHours =
        (Date.now() -
            new Date(notification.Timestamp).getTime()) /
        (1000 * 60 * 60);

    const recencyScore = Math.max(
        0,
        100 - ageHours
    );

    return weight * 100 + recencyScore;
}

async function main() {

    const notifications =
        await getNotifications();

    const top10 = notifications
        .map(n => ({
            ...n,
            priorityScore:
                calculateScore(n)
        }))
        .sort(
            (a, b) =>
                b.priorityScore -
                a.priorityScore
        )
        .slice(0, 10);

    console.log(
        "\n===== TOP 10 PRIORITY NOTIFICATIONS =====\n"
    );

    console.table(
        top10.map(n => ({
            ID: n.ID,
            Type: n.Type,
            Message: n.Message,
            Score: n.priorityScore
        }))
    );
}

main();