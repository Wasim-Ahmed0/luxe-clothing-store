
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.6.0
 * Query Engine version: f676762280b54cd07c770017ed3711ddde35f37a
 */
Prisma.prismaVersion = {
  client: "6.6.0",
  engine: "f676762280b54cd07c770017ed3711ddde35f37a"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.StoreScalarFieldEnum = {
  store_id: 'store_id',
  store_name: 'store_name',
  location: 'location',
  area_code: 'area_code'
};

exports.Prisma.UserScalarFieldEnum = {
  user_id: 'user_id',
  username: 'username',
  email: 'email',
  password_hash: 'password_hash',
  role: 'role',
  store_id: 'store_id',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.ProductScalarFieldEnum = {
  product_id: 'product_id',
  name: 'name',
  description: 'description',
  price: 'price',
  category: 'category'
};

exports.Prisma.ProductVariantScalarFieldEnum = {
  variant_id: 'variant_id',
  product_id: 'product_id',
  size: 'size',
  color: 'color'
};

exports.Prisma.InventoryScalarFieldEnum = {
  inventory_id: 'inventory_id',
  store_id: 'store_id',
  product_id: 'product_id',
  variant_id: 'variant_id',
  quantity: 'quantity',
  status: 'status',
  last_updated: 'last_updated'
};

exports.Prisma.VirtualCartScalarFieldEnum = {
  cart_id: 'cart_id',
  user_id: 'user_id',
  store_id: 'store_id',
  created_at: 'created_at',
  expires_at: 'expires_at'
};

exports.Prisma.CartItemScalarFieldEnum = {
  cart_item_id: 'cart_item_id',
  cart_id: 'cart_id',
  variant_id: 'variant_id',
  quantity: 'quantity',
  price_at_time: 'price_at_time'
};

exports.Prisma.FittingCartScalarFieldEnum = {
  fitting_cart_id: 'fitting_cart_id',
  user_id: 'user_id',
  store_id: 'store_id',
  created_at: 'created_at',
  expires_at: 'expires_at'
};

exports.Prisma.FittingRoomRequestScalarFieldEnum = {
  request_id: 'request_id',
  fitting_cart_id: 'fitting_cart_id',
  user_id: 'user_id',
  store_id: 'store_id',
  fitting_room_id: 'fitting_room_id',
  variant_id: 'variant_id',
  status: 'status',
  created_at: 'created_at'
};

exports.Prisma.OrderScalarFieldEnum = {
  order_id: 'order_id',
  user_id: 'user_id',
  store_id: 'store_id',
  order_status: 'order_status',
  total_amount: 'total_amount',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.OrderDetailScalarFieldEnum = {
  order_detail_id: 'order_detail_id',
  order_id: 'order_id',
  variant_id: 'variant_id',
  quantity: 'quantity',
  price_at_purchase: 'price_at_purchase'
};

exports.Prisma.WishlistScalarFieldEnum = {
  wishlist_id: 'wishlist_id',
  user_id: 'user_id'
};

exports.Prisma.WishlistItemScalarFieldEnum = {
  wishlist_item_id: 'wishlist_item_id',
  wishlist_id: 'wishlist_id',
  variant_id: 'variant_id'
};

exports.Prisma.AnalyticsScalarFieldEnum = {
  analytics_id: 'analytics_id',
  event_type: 'event_type',
  variant_id: 'variant_id',
  user_id: 'user_id',
  store_id: 'store_id',
  timestamp: 'timestamp',
  weight: 'weight'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.Role = exports.$Enums.Role = {
  customer: 'customer',
  store_manager: 'store_manager',
  employee: 'employee'
};

exports.StockStatus = exports.$Enums.StockStatus = {
  available: 'available',
  unavailable: 'unavailable',
  discontinued: 'discontinued'
};

exports.RequestStatus = exports.$Enums.RequestStatus = {
  pending: 'pending',
  fulfilled: 'fulfilled',
  cancelled: 'cancelled'
};

exports.OrderStatus = exports.$Enums.OrderStatus = {
  pending: 'pending',
  completed: 'completed',
  cancelled: 'cancelled'
};

exports.EventType = exports.$Enums.EventType = {
  NFC_scan: 'NFC_scan',
  add_to_cart: 'add_to_cart',
  purchase: 'purchase',
  checkout: 'checkout'
};

exports.Prisma.ModelName = {
  Store: 'Store',
  User: 'User',
  Product: 'Product',
  ProductVariant: 'ProductVariant',
  Inventory: 'Inventory',
  VirtualCart: 'VirtualCart',
  CartItem: 'CartItem',
  FittingCart: 'FittingCart',
  FittingRoomRequest: 'FittingRoomRequest',
  Order: 'Order',
  OrderDetail: 'OrderDetail',
  Wishlist: 'Wishlist',
  WishlistItem: 'WishlistItem',
  Analytics: 'Analytics'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }

        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
