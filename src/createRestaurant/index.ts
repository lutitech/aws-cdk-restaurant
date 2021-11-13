
const AWS = require('aws-sdk');
import { v4 as uuidv4 } from 'uuid';
import { Restaurant } from '../types';
const docClient = new AWS.DynamoDB.DocumentClient();

const createRestaurant = async (restaurant: Restaurant) => {
  const id = `RES-${uuidv4()}`;
  const createdAt = new Date().toISOString();

  const restaurantObject = {};
  Object.assign(restaurantObject, {
    id,
    item: id,
    name: restaurant.name,
    email: restaurant.email,
    address: restaurant.address,
    //locationId: restaurant.locationId,
    phone: restaurant.phone,
    objectType: 'restaurant',
    createdAt,
  });
  const params = {
    TableName: process.env.TEST_TABLE,
    Item: restaurantObject,
  };
  
  try {
    await docClient.put(params).promise();
    Object.assign(restaurant);
    return {restaurant: restaurantObject};
    
    
  } catch (error) {
    console.log('DynamoDB error: ', error);
    console.log(restaurantObject)
    return {error: error};
  }
}

export default createRestaurant;
