const axios = require("axios");
const { getToken } = require("./auth");
const { BASE_URL } = require("./constants");

async function Log(stack, level, packageName, message) {

    try {

        const token = await getToken();

        const response = await axios.post(
            `${BASE_URL}/logs`,
            {
                stack,
                level,
                package: packageName,
                message
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return response.data;

    } catch (error) {

        console.error(
            error.response?.data || error.message
        );
    }
}

module.exports = { Log };