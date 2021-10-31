

const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

const listFoodByRestaurant = async (restaurantId: String) => {
    try {

        const params = {
            TableName: process.env.TEST_TABLE,
            IndexName: 'restaurantId-id-index',
            KeyConditionExpression: '#restaurantId = :restaurantId AND begins_with(#id, :food)',
            ExpressionAttributeNames: {
                '#id': 'id',
                '#restaurantId': 'restaurantId',
            },
            ExpressionAttributeValues: {
                 ':restaurantId': restaurantId,
                ':food': 'FOO',
            },
        };

    
        const {Items} = await docClient.query(params).promise();
        console.log(Items)
        return Items
    }catch (err) {
      console.log('DynamoDB error: ', err);
        return {error: err}
    }


};
export default listFoodByRestaurant;
