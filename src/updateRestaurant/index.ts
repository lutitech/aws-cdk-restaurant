import { Restaurant } from '../types';

// lambda-fns/updateRestaurant.ts
const AWS = require('aws-sdk');

const docClient = new AWS.DynamoDB.DocumentClient();

type Params = {
  TableName: string | undefined;
  Key: string | {};
  ExpressionAttributeValues: any;
  ExpressionAttributeNames: any;
  UpdateExpression: string;
  ReturnValues: string;
};

async function updateRestaurant(restaurant: Restaurant) {
  let params: Params = {
    TableName: process.env.TEST_TABLE,
    Key: {
      id: restaurant.id,
      item: restaurant.id,
    },
    ExpressionAttributeValues: {},
    ExpressionAttributeNames: {},
    UpdateExpression: '',
    ReturnValues: 'ALL_NEW',
  };
  let prefix = 'set ';
  const updatedAt = new Date().toISOString();
  let attributes = Object.keys(restaurant);

  for (let i = 0; i < attributes.length; i++) {
    let attribute = attributes[i] as keyof Restaurant;
    if (attribute !== 'id') {
      params['UpdateExpression'] +=
        prefix + '#' + `restaurantData.${attribute}` + ' = :' + attribute;
      params['ExpressionAttributeValues'][':' + attribute] = restaurant[attribute];
      prefix = ', ';
    }
  }
  params['ExpressionAttributeNames']['#restaurantData'] = 'restaurantData';

  params['UpdateExpression'] += `, #updatedAt = :updatedAt`;
  params['ExpressionAttributeNames']['#updatedAt'] = 'updatedAt';
  params['ExpressionAttributeValues'][':updatedAt'] = updatedAt;



  try {
    const { Attributes } = await docClient.update(params).promise();
    console.log(Attributes)
    return {restaurant: Attributes};
  } catch (err) {
    console.log('DynamoDB error: ', err);
    return {error: err};
  }
}

export default updateRestaurant;
