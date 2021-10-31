const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();


const listAllRestaurants = async() => {
    const params = {
        TableName: process.env.TEST_TABLE,
        FilterExpression: 'begins_with(id, :restaurant) AND begins_with(#item, :restaurant)',
        ExpressionAttributeNames: {
            '#item': 'item',
        },
        ExpressionAttributeValues: {
            ':restaurant': 'RES-',
        },
    };
    try {
        const { Items } = await docClient.scan(params).promise();
        return Items;
    }
    catch (err) {
        console.log('DynamoDB error: ', err);
        return { error: err };
    }
}

export default listAllRestaurants