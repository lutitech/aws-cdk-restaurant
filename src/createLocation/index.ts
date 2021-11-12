
const AWS = require('aws-sdk');
import { v4 as uuidv4 } from 'uuid';
import { Location } from '../types';
const docClient = new AWS.DynamoDB.DocumentClient();

const createLocation = async (location: Location) => {
  const id = `LOC-${uuidv4()}`;
  const createdAt = new Date().toISOString();

  const locationObject = {};
  Object.assign(locationObject, {

    id,
    item: id,
    name: location.name,
   
    createdAt,
  });
  const params = { 
    TableName: process.env.TEST_TABLE,
    Item: locationObject,
  };
  
  try {
    await docClient.put(params).promise();
    Object.assign(location);
    return {location: locationObject};
  } catch (error) {
    console.log('DynamoDB error: ', error);
    return {error: error};
  }
}

export default createLocation;
