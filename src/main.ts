import createFood from "./createFood"
import getFood from "./getFood"
import listAllFood from "./listAllFood"
import listAllOrders from "./listAllOrders"
import createRestaurant from "./createRestaurant"
import getRestaurant from "./getRestaurant"
import listAllRestaurants from "./listAllRestaurants"
import listFoodByRestaurant from "./listFoodByRestaurant"
import addFoodtoCart from "./addFoodtoCart"
//import removeFoodFromCart from "./removeFoodFromCart"
import addCartFoodToOrderHistory from "./addCartFoodToOrderHistory"
import getAdminDashboard from "./getAdminDashboard"
import deleteFood from "./deleteFood"
import deleteRestaurant from "./deleteRestaurant"
import listOrdersByRestaurant from "./listOrdersByRestaurant"
import updateFood from "./updateFood"
import updateRestaurant from "./updateRestaurant"
import signIn from "./signIn"
import createLocation from "./createLocation"
import listFoodByLocation from "./listFoodByLocation"
import {
    Food, 
    Restaurant,
    CartPayload,
    LoginPayload,
    Location
} from "./types"


type AppSyncEvent = {
    info: {  
        fieldName: string
    },
    identity:{
        sub: string

    },
    arguments: {
        id: string
        foodName: string
        locationId: String
        restaurantId: string
        userId: string
        foodPayload: Food
        restaurantPayload: Restaurant
        cartItemPayload: CartPayload
        loginPayload: LoginPayload
        locationPayload: Location
    }
}

exports.handler = async (event:AppSyncEvent) => {
    switch(event.info.fieldName){
        case 'signIn':
            return await signIn(event.arguments.loginPayload)
        case 'createFood':
            return await createFood(event.arguments.foodPayload)
        case 'deleteFood':
            return await deleteFood(event.arguments.id)
        case 'getFood':
            return await getFood(event.arguments.id)
        case 'listAllFood':
            return await listAllFood()
        case 'listAllOrders':
            return await listAllOrders()
        case 'createRestaurant':
            return await createRestaurant(event.arguments.restaurantPayload)
        case 'deleteRestaurant':
            return await deleteRestaurant(event.arguments.id)
        case 'getRestaurant':
            return await getRestaurant(event.arguments.id)
        case 'listAllRestaurants':
            return await listAllRestaurants ()
        case 'listFoodByRestaurant':
            return await listFoodByRestaurant(event.arguments.restaurantId)
        case 'addFoodtoCart':
            return await addFoodtoCart({
                userId: (event.arguments.userId),
                payload: event.arguments.cartItemPayload,
              })
        
        case 'addCartFoodToOrderHistory':
                    return await addCartFoodToOrderHistory({
                        userId:event.arguments.userId,
                        restaurantId: event.arguments.restaurantId});
        case 'getAdminDashboard':
            return await getAdminDashboard(event.arguments.id)
        case 'listOrdersByRestaurant':
            return await listOrdersByRestaurant(event.arguments.id)
        case 'updateFood': 
            return await updateFood(event.arguments.foodPayload)
        case 'updateRestaurant':
            return await updateRestaurant(event.arguments.restaurantPayload)
        case 'createLocation':
            return await createLocation(event.arguments.locationPayload)
        case 'listFoodByLocation':
            return await listFoodByLocation(event.arguments.foodName, event.arguments.locationId);
        default:
            return null
    }
}