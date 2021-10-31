

const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

const listOrdersByRestaurant = async (restaurantId: String) => {
    try {

        const params = {
            TableName: process.env.TEST_TABLE,
            IndexName: 'restaurantId-id-index',
            KeyConditionExpression: '#restaurantId = :restaurantId AND begins_with(#id, :order)',
            ExpressionAttributeNames: {
                '#id': 'id',
                '#restaurantId': 'restaurantId',
            },
            ExpressionAttributeValues: {
                 ':restaurantId': restaurantId,
                ':order': 'ORD',
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
export default listOrdersByRestaurant;
