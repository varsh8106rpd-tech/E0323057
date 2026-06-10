const axios = require("axios");
const { getToken } = require("./auth");

const BASE_URL = "http://4.224.186.213/evaluation-service";

async function getNotifications() {
    const token = await getToken();

    const response = await axios.get(
        `${BASE_URL}/notifications`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data.notifications;
}

module.exports = { getNotifications };