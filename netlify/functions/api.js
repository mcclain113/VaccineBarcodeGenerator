exports.handler = async (event, context) => {
        try {
            // Process the GET request as needed
            const data = require('../../rxlaws.json');
            const headers = {
                'Access-Control-Allow-Origin': '*', // Replace * with the appropriate domain
                'Access-Control-Allow-Headers': 'Content-Type',
            };

            // Return the data as the response
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(data),
            };
        } catch (error) {
            // Return an error response if there was an issue processing the request
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to process GET request' }),
            };
        }


};
