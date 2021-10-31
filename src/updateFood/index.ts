import { Food } from '../types';

// lambda-fns/updateFood.ts
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

async function updateFood(food: Food) {
  let params: Params = {
    TableName: process.env.TEST_TABLE,
    Key: {
      id: food.id,
      item: food.id,
    },
    ExpressionAttributeValues: {},
    ExpressionAttributeNames: {},
    UpdateExpression: '',
    ReturnValues: 'ALL_NEW',
  };
  let prefix = 'set ';
  const updatedAt = new Date().toISOString();
  let attributes = Object.keys(food);

  for (let i = 0; i < attributes.length; i++) {
    let attribute = attributes[i] as keyof Food;
    if (attribute !== 'id') {
      params['UpdateExpression'] +=
        prefix + '#' + `foodData.${attribute}` + ' = :' + attribute;
      params['ExpressionAttributeValues'][':' + attribute] = food[attribute];
      prefix = ', ';
    }
  }
  params['ExpressionAttributeNames']['#foodData'] = 'foodData';

  params['UpdateExpression'] += `, #updatedAt = :updatedAt`;
  params['ExpressionAttributeNames']['#updatedAt'] = 'updatedAt';
  params['ExpressionAttributeValues'][':updatedAt'] = updatedAt;



  try {
    const { Attributes } = await docClient.update(params).promise();
    return Attributes;
  } catch (err) {
    console.log('DynamoDB error: ', err);
    return {error: err};
  }
}

export default updateFood;
