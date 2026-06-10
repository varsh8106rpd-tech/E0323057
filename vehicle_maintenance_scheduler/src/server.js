const express = require("express");
const { getDepots, getVehicles } = require("./api");
const { optimizeTasks } = require("./scheduler");

const { Log } = require("../../logging_middleware/src/logger");

const app = express();

app.get("/schedule", async (req, res) => {

    try {

        await Log(
            "backend",
            "info",
            "service",
            "Fetching depot information"
        );

        const depots = await getDepots();

        await Log(
            "backend",
            "info",
            "service",
            "Fetching vehicle tasks"
        );

        const vehicles = await getVehicles();

        const results = [];

        for (const depot of depots) {

            const result = optimizeTasks(
                vehicles,
                depot.MechanicHours
            );

            results.push({
                depotId: depot.ID,
                mechanicHours: depot.MechanicHours,
                totalImpact: result.totalImpact,
                selectedTasks: result.selectedTasks
            });
        }

        await Log(
            "backend",
            "info",
            "service",
            "Optimization completed"
        );

        res.json(results);

    } catch (error) {

        await Log(
            "backend",
            "error",
            "service",
            error.message
        );

        res.status(500).json({
            error: error.message
        });
    }
});

app.listen(3000, () => {
    console.log(
        "Vehicle Scheduler running on port 3000"
    );
});