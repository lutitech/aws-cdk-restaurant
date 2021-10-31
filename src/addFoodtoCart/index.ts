// lambda-fns/addItemToCart.ts
const AWS = require('aws-sdk');
import { v4 as uuidv4 } from 'uuid';
const docClient = new AWS.DynamoDB.DocumentClient();
import { CartPayload, Cart } from '../types';

async function addFoodtoCart({
  payload,
  userId,
}: {
  payload: CartPayload;
  userId: string;
}) {
  const id = `CART-${uuidv4()}`;
  const createdAt = new Date().toISOString();
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
    if (Items.length === 0) {
      // create new cart
      payload.totalPrice =
        parseInt(payload.foodPrice) * parseInt(payload.foodQty);

      try {
        let cart: Cart = {
          id,
          item: id,
          cartData: [payload],
          subTotal: payload.totalPrice,
          createdAt,
          updatedAt: createdAt,
        };
        const cartParams = {
          TableName: process.env.TEST_TABLE,
          Item: cart,
        };

        const userAssignedCartParams = {
          TableName: process.env.TEST_TABLE,
          Item: {
            id: userId,
            item: id,
            createdAt,
            updatedAt: createdAt,
          },
        };
        await docClient
          .transactWrite({
            TransactItems: [
              {
                Put: cartParams,
              },
              {
                Put: userAssignedCartParams,
              },
            ],
          })
          .promise();
        return cart;
      } catch (err) {
        console.log('DynamoDB error: ', err);
        return err;
      }
    } else if (Items.length > 0) {
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
      const index = Cart.cartData.findIndex(
        (item) => item.foodId === payload.foodId
      );
      if (index !== -1) {
        Cart.cartData[index].foodQty = (parseInt(
          Cart.cartData[index].foodQty
        ) + parseInt(payload.foodQty)) as unknown as string;
        Cart.cartData[index].totalPrice =
          parseInt(Cart.cartData[index].foodQty) *
          parseInt(payload.foodPrice);
      } else {
        payload.totalPrice =
          parseInt(payload.foodPrice) * parseInt(payload.foodQty);
        Cart.cartData = [...Cart.cartData, payload];
      }
      Cart.subTotal = Cart.cartData
        .map((item) => item.totalPrice)
        .reduce((acc, next) => acc + next);
      Cart.updatedAt = createdAt;
      let updatedCartParams = {
        TableName: process.env.KLIC_TABLE,
        Item: Cart,
      };
      await docClient.put(updatedCartParams).promise();
      return Cart;
    }
  } catch (err) {
    console.log('DynamoDB error: ', err);
    return err;
  }
}

export default addFoodtoCart;
