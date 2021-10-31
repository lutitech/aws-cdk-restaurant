const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();


const listAllOrders = async () => {
    const params = {
        TableName: process.env.TEST_TABLE,
        FilterExpression: 'begins_with(id, :order) AND begins_with(#item, :order)',
        ExpressionAttributeNames: {
            '#item': 'item',
        },
        ExpressionAttributeValues: {
            ':order': 'ORD-',
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

export default listAllOrders