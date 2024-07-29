// exports.handler = async (event, context) => {
//         try {
//             // Process the GET request as needed
//             const data = require('../../rxlaws.json');
//             const headers = {
//                 'Access-Control-Allow-Origin': '*', // Replace * with the appropriate domain
//                 'Access-Control-Allow-Headers': 'Content-Type',
//             };
//
//             // Return the data as the response
//             return {
//                 statusCode: 200,
//                 headers,
//                 body: JSON.stringify(data),
//             };
//         } catch (error) {
//             // Return an error response if there was an issue processing the request
//             return {
//                 statusCode: 500,
//                 body: JSON.stringify({ error: 'Failed to process GET request' }),
//             };
//         }
//
//
// };


exports.handler = async (event, context) => {
    try {
        // Extract query parameters from the request
        const keyword = event.queryStringParameters?.keyword ?? '';
        const selectedUrls = event.queryStringParameters?.selectedUrls?.split(',') ?? [];

        // Process the data based on query parameters
        const data = require('../../rxlaws.json');
        let filteredData = data.filter((item) => {
            // Filter based on selectedUrls
            return selectedUrls.includes(item['weblink']);
        });

        // Apply keyword filter if provided
        if (keyword.length > 0) {
            const filteredByKeyword = filteredData.filter((item) =>
                item['matchingtext'].toString().toUpperCase().contains(keyword.toUpperCase())
            );
            filteredData = filteredByKeyword;
        }

        const headers = {
            'Access-Control-Allow-Origin': '*', // Replace * with the appropriate domain
            'Access-Control-Allow-Headers': 'Content-Type',
        };

        // Return the filtered data as the response
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(filteredData),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to process GET request' }),
        };
    }
};
