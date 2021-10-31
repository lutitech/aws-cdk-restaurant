import { LoginPayload } from '../types';
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();
var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();



const signIn = async (payload: LoginPayload) => {
    var params = {
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: process.env.USER_POOL_WEB_CLIENT_ID /* required */,
      AuthParameters: {
        USERNAME: payload.username,
        PASSWORD: payload.password,
      },
     };
     try {
      const { AuthenticationResult } = await cognitoidentityserviceprovider
        .initiateAuth(params)
        .promise();
      
      var tokenCode = AuthenticationResult.AccessToken
      const base64Url = tokenCode.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const buff = Buffer.from(base64, 'base64');
      const payloadinit = buff.toString('ascii');
      const payload = JSON.parse(payloadinit);
      const userId = payload.sub
      
  
      const userParams = {
        TableName: process.env.TEST_TABLE,
        Key: { id: `USR-${userId}`, item: `USR-${userId}` },
      };
  
      const { Item } = await docClient.get(userParams).promise();
    

         return {user: Item, token: AuthenticationResult}
      
     } catch (err) {
      console.log('Cognito error: ', err);
      return {error: err}
    }
  };
  
  export default signIn;