export type Food = {
    id: String
    foodName: String
    description: String
    price: String
    foodType: String
    rating: String
    images: [String]
    restaurantId: String
    locationId: String
}

export type Order = {
    id: String
    restaurantId: String
    totalAmount: String
    PaidAmount: String
    remarks: String
}

export type Restaurant = {
    id: String
    name: String
    email: String
    address: String
    phone: String
}

export type Cart = {
	id: String
    item: string;
    cartData: CartPayload[]
	subTotal: number
	createdAt: String
	updatedAt: String
}

export type CartPayload = {
	foodId: String
	foodType: String
	foodName: String
	foodPrice: string
	totalPrice: number
	foodImage: String
	foodQty: string
	
}

export type LoginPayload ={
	username: String
	password: String
}

export type Location = {
    id: String
    name: String
}