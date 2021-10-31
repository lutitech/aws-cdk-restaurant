const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

const getRestaurant = async(restaurantId: string) => {
  const params = {
    TableName: process.env.TEST_TABLE,
    Key: { id:restaurantId, item: restaurantId },
  };
  try {
    const { Item } = await docClient.get(params).promise();
    if (Item) {
      return { restaurant: Item }
    } else {
      return { error: 'resturant does not exist' }
    }
  } catch (error) {
    console.log('DynamoDB error: ', error);
    return {error:error};
  }
}

export default getRestaurant;