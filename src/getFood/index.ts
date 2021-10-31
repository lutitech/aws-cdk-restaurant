const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

async function getFood(foodId: string) {
  const params = {
    TableName: process.env.TEST_TABLE,
    Key: { id:foodId, item: foodId },
  };
  try {
    const { Item } = await docClient.get(params).promise();
    if (Item) {
      return { food: Item }
    } else {
      return { error: 'food does not exist' }
    }
  } catch (error) {
    console.log('DynamoDB error: ', error);
    return {error:error};
  }
}

export default getFood;