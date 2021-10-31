const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();
var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();

exports.handler = async (event: any, context: any, callback: any) => {
  const createdAt = new Date().toISOString();
  if (event.request.userAttributes.sub) {``
    const params = {
      TableName: process.env.TEST_TABLE,
      Item: {
        id: `USR-${event.request.userAttributes.sub}`,
        item: `USR-${event.request.userAttributes.sub}`,
        username: event.userName,
        email: event.request.userAttributes.email,
        firstName: event.request.userAttributes.firstName || '',
        lastName: event.request.userAttributes.lastName || '',
        objectType: 'user',
        createdAt: createdAt,
        updatedAt: createdAt,
      },
    };
    var groupParams = {
      GroupName: 'Default',
      UserPoolId: ' eu-west-1_O3LJHb6yA',
      Username: event.userName
    };
    try {
      await docClient.put(params).promise();
      await cognitoidentityserviceprovider.adminAddUserToGroup(groupParams).promise();
    } catch (err) {
      console.log('DynamoDB error: ', err);
    }
    callback(null, event);
  } else {
    console.log('No item written to ddb');
    callback(null, event);
  }
};
