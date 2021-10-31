
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

async function deleteRestaurant(id: string) {
  const params = {
    TableName: process.env.TEST_TABLE,
    Key: {
      id: id,
      item: id,
    },
  };
  try {
    await docClient.delete(params).promise();
    return {
      status: 'success',
      message: 'Restaurant successfully deleted',
      data: id
    }
  } catch (err) {
    console.log('DynamoDB error: ', err);
    return {error: err};
  }
}

export default deleteRestaurant;
