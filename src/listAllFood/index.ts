const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();


const listAllFood = async() => {
    const params = {
        TableName: process.env.TEST_TABLE,
        FilterExpression: 'begins_with(id, :food) AND begins_with(#item, :food)',
        ExpressionAttributeNames: {
            '#item': 'item',
        },
        ExpressionAttributeValues: {
            ':food': 'FOO-',
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

export default listAllFood