

const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

const listFoodByLocation = async (foodName: String, locationId: String) => {
    try {

        const params = {
            TableName: process.env.TEST_TABLE,
           FilterExpression: "contains(locationId, :locationId) AND contains(foodName, :foodName) ",
            ExpressionAttributeValues: {
              ":foodName": foodName,
              ":locationId": locationId
            },
  }
       const {Items} = await docClient.scan(params).promise();
        console.log(Items)
        return Items
    }catch (err) {
      console.log('DynamoDB error: ', err);
        return {error: err}
    }


};
export default listFoodByLocation;


