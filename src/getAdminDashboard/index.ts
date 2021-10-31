const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

const getAdminDashboard= async (userId: String) => {
    try {

        const params = {
            TableName: process.env.TEST_TABLE,
            Key: {id: `USR-${userId}`, item: `USR-${userId}`},
        };
        const {Item} = await docClient.get(params).promise();

            const foodParams = {
            TableName: process.env.TEST_TABLE,
            IndexName: 'objectType-id-index',
            KeyConditionExpression: '#objectType = :objectType AND begins_with(#id, :food)',
            ExpressionAttributeNames: {
                '#id': 'id',
                '#objectType': 'objectType',
            },
            ExpressionAttributeValues: {
                ':objectType': 'food',
                ':food': 'FOO',
            },
        };

        const restaurantParams = {
            TableName: process.env.TEST_TABLE,
            IndexName: 'objectType-id-index',
            KeyConditionExpression: '#objectType = :objectType AND begins_with(#id, :restaurant)',
            ExpressionAttributeNames: {
                '#id': 'id',
                '#objectType': 'objectType', 
            },
            ExpressionAttributeValues: {
                ':objectType': 'restaurant',
                ':restaurant': 'RES',
            },
        }
        const orderParams = {
            TableName: process.env.TEST_TABLE,
            IndexName: 'objectType-id-index',
            KeyConditionExpression: '#objectType = :objectType AND begins_with(#id, :order)',
            ExpressionAttributeNames: {
                '#id': 'id',
                '#objectType': 'objectType',
            },
            ExpressionAttributeValues: {
                ':objectType': 'order',
                ':order': 'ORD',
            },
        }

        const userParams = {
            TableName: process.env.TEST_TABLE,
            IndexName: 'objectType-id-index',
            KeyConditionExpression: '#objectType = :objectType AND begins_with(#id, :user)',
            ExpressionAttributeNames: {
                '#id': 'id',
                '#objectType': 'objectType'
            },
            ExpressionAttributeValues: {
                ':objectType': 'user',
                ':user': 'USR',
            },
        };

       

        let totalEarnings: number = 0
        let stringVal: String = ""
        const data = await docClient.query(foodParams).promise();
        const data2= await docClient.query( restaurantParams).promise();
        const data3 = await docClient.query(orderParams).promise();
        const data4 = await docClient.query(userParams).promise();
       
        
        for (let i = 0; i < data.Items.length; i++) {
            stringVal = data.Items[i].price
            totalEarnings = totalEarnings + Number(stringVal)
        }
        
        console.log(data)

        const adminSummary = {
            totalRestaurant: data2.Items.length,
            totalFood: data.Items.length,
            totalOrders: data3.Items.length,
            totalUsers: data4.Items.length,
            totalEarnings: totalEarnings.toString()
        }

        return {user: Item, adminSummary: adminSummary}
    }catch (err) {
        console.log('Cognito error: ', err);
        return {error: err}
    }


};
export default getAdminDashboard;