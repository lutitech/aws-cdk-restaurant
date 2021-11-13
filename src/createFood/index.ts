
const AWS = require('aws-sdk');
import { v4 as uuidv4 } from 'uuid';
import { Food } from '../types';
const docClient = new AWS.DynamoDB.DocumentClient();

const createFood = async (food: Food) => {
  const id = `FOO-${uuidv4()}`;
  const createdAt = new Date().toISOString();

  const foodObject = {};
  Object.assign(foodObject, {
    id,
    item: id,
    description: food.description,
    foodName: food.foodName,
    price: food.price,
    objectType: 'food',
    locationId: food.locationId,
    foodType: food.foodType,
    restaurantId: food.restaurantId,
    createdAt,
  });
  const params = {
    TableName: process.env.TEST_TABLE,
    Item: foodObject,
  };
  
  try {
    await docClient.put(params).promise();
    Object.assign(food);
    console.log(foodObject)
    return {food: foodObject};
    
  } catch (error) {
    console.log('DynamoDB error: ', error);
    return {error: error};
  }
}


export default createFood;
