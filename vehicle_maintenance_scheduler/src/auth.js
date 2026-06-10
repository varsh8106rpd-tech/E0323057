const axios = require("axios");

async function getToken() {
    try {
        const response = await axios.post(
            "http://4.224.186.213/evaluation-service/auth",
            {
                email: "varsh2910rpd@gmail.com",
                name: "amirta varsan r",
                rollNo: "e0323057",
                accessCode: "DvwEDZ",
                clientID: "098dcafd-8468-4767-bb1a-e55b3af64bff",
                clientSecret: "aRJMMnqtrePDrhFb"
            },
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        return response.data.access_token;

    } catch (error) {
        console.error("Authentication Failed");
        console.error(
            error.response?.data || error.message
        );
        throw error;
    }
}

module.exports = { getToken };