

const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

const listFoodByLocation = async (foodName: String, locationId: String) => {
    try {

        const params = {
            TableName: process.env.TEST_TABLE,
            IndexName: 'locationId-id-index',
            KeyConditionExpression: '#locationId = :locationId',
            FilterExpression: '#foodName = :foodName',
            ExpressionAttributeNames: {
                '#locationId': 'locationId',
                '#foodName': 'foodName'
            },
            ExpressionAttributeValues: {
                 ':locationId': locationId,
                ':foodName': foodName
            },
  }
       const {Items} = await docClient.query(params).promise();
        console.log(Items)
        return Items
    }catch (err) {
      console.log('DynamoDB error: ', err);
        return {error: err}
    }


};
export default listFoodByLocation;


