import { v4 as uuidv4 } from 'uuid';
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();
import {  Cart } from '../types';

async function addCartFoodToOrderHistory ( {
    userId,
    restaurantId}: {
        userId: string;
        restaurantId: string


    })  {
    const createdAt = new Date().toISOString();
    const id = `ORD-${uuidv4()}`;
    const params = {
      TableName: process.env.TEST_TABLE,
      KeyConditionExpression: '#id = :id AND begins_with(#item, :cart)',
      ExpressionAttributeNames: {
        '#id': 'id',
        '#item': 'item',
      },
      ExpressionAttributeValues: {
        ':id': userId,
        ':cart': 'CART',
      },
    };
  
    try {
      const { Items } = await docClient.query(params).promise();
      if (Items.length > 0) {
        let cartId = Items[0].item;
        let cartParams = {
          TableName: process.env.TEST_TABLE,
          Key: {
            id: cartId,
            item: cartId,
          },
        };
        const { Item: Cart } = (await docClient.get(cartParams).promise()) as {
          Item: Cart;
        };
        let order = {
          id,
          item: id,
          orderData: Cart.cartData,
          subtotal: Cart.subTotal,
          objectType: 'order',
          restaurantId: restaurantId,
          createdAt,
          updatedAt: createdAt,
        };
        const orderParams = {
          TableName: process.env.TEST_TABLE,
          Item: order,
        };
        const userAssignedOrderParams = {
          TableName: process.env.TEST_TABLE,
          Item: {
            id: userId,
            item: id,
            createdAt,
            updatedAt: createdAt,
          },
        };
        // const restaurantOrderParams = {
        //     TableName: process.env.TEST_TABLE,
        //     Item: {
        //       id: restaurantId,
        //       item: id,
        //       createdAt,
        //       updatedAt: createdAt,
        //     },
        //   };
        Cart.cartData = [];
        Cart.subTotal = 0;
        Cart.updatedAt = createdAt;
        let clearedCartParams = {
          TableName: process.env.TEST_TABLE,
          Item: Cart,
        };
        await docClient
          .transactWrite({
            TransactItems: [
              {
                Put: orderParams,
              },
              {
                Put: clearedCartParams,
              },
              {
                Put: userAssignedOrderParams,
              },
            //   {
            //     Put: restaurantOrderParams
            //   }
            ],
          })
          .promise();
        console.log(Items)
        return Items;
      }
    } catch (err) {
      console.log('DynamoDB error: ', err);
      return err;
    }
  };
export default addCartFoodToOrderHistory