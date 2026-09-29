/*

export function handler(event, context, callback) {

  const { API_TOKEN } = process.env.MY_API_KEY


return API_TOKEN;

}*/

export async function handler(event, context) {
  // 1. Fixed the environment variable assignment (destructuring a string usually returns undefined)
  const API_TOKEN = process.env.MY_API_KEY;

  // 2. Netlify functions require returning an object with a statusCode and a stringified body
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ token: API_TOKEN })
  };
}