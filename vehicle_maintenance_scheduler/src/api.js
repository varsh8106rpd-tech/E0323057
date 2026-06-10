const axios = require("axios");
const { getToken } = require("./auth");

const BASE_URL = "http://4.224.186.213/evaluation-service";

async function getDepots() {
    const token = await getToken();

    const response = await axios.get(
        `${BASE_URL}/depots`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data.depots;
}

async function getVehicles() {
    const token = await getToken();

    const response = await axios.get(
        `${BASE_URL}/vehicles`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data.vehicles;
}

module.exports = {
    getDepots,
    getVehicles
};