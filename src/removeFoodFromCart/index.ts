
// const AWS = require('aws-sdk');
// const docClient = new AWS.DynamoDB.DocumentClient();
// import { Cart } from '../types';

// async function removeFoodFromCart({
//   userId,
//   foodId,
// }: {
//   userId: string;
//   foodId: string;
// }) {
//   const createdAt = new Date().toISOString();
//   const params = {
//     TableName: process.env.TEST_TABLE,
//     KeyConditionExpression: '#id = :id AND begins_with(#item, :cart)',
//     ExpressionAttributeNames: {
//       '#id': 'id',
//       '#item': 'item',
//     },
//     ExpressionAttributeValues: {
//       ':id': userId,
//       ':cart': 'CART',
//     },
//   };
//   try {
//     const { Items } = await docClient.query(params).promise();
//     if (Items.length > 0) {
//       let cartId = Items[0].item;
//       let cartParams = {
//         TableName: process.env.TEST_TABLE,
//         Key: {
//           id: cartId,
//           item: cartId,
//         },
//       };
//       const { Item: Cart } = (await docClient.get(cartParams).promise()) as {
//         Item: Cart;
//       };
//       const index = Cart.cartData.findIndex(
//         (item) => item.foodId === foodId
//       );
//       if (index !== -1) {
//         Cart.cartData.splice(index, 1);
//       }
//       Cart.updatedAt = createdAt;
//       let updatedCartParams = {
//         TableName: process.env.TEST_TABLE,
//         Item: Cart,
//       };
//       await docClient.put(updatedCartParams).promise();
//       return Cart;
//     }
//   } catch (err) {
//     console.log('DynamoDB error: ', err);
//     return {error: err};
//   }
// }

// export default removeFoodFromCart;
