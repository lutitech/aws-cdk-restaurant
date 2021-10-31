
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

async function deleteFood(id: string) {
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
      message: 'Food successfully deleted',
      data: id
    }
  } catch (err) {
    console.log('DynamoDB error: ', err);
    return {error: err };
  }
}

export default deleteFood;
