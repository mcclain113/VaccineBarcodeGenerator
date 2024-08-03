//import fetch from 'node-fetch'

// exports.handler = async (event, context) => {
//         try {
//             // Process the GET request as needed
//             const data = require('../../rxlaws.json');
//             const headers = {
//                 'Access-Control-Allow-Origin': '*', // Replace * with the appropriate domain
//                 'Access-Control-Allow-Headers': 'Content-Type',
//             };

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


// };


exports.handler = async (event, context) => {
    try {
      // Extract query parameters from the request
      const keyword = event.queryStringParameters?.keyword ?? '';
      const selectedUrls = event.queryStringParameters?.selectedUrls?.split(',') ?? [];
  
      // Process the data based on query parameters
      const data = require('../../rxlaws.json');
  
      // Filter based on selectedUrls (if any)
      let filteredData = selectedUrls.length > 0 ? data.filter(item => selectedUrls.includes(item['weblink'])) : data;
  
      // Apply keyword filter if provided (using the filtered data)
      if (keyword.length > 0) {
        filteredData = filteredData.filter((item) => {
          const matchingText = item['matchingtext']?.toString()?.toUpperCase() || '';
          return matchingText.includes(keyword.toUpperCase());
        });
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