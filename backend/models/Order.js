const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:     String,
  brand:    String,
  category: String,
  condition: String,
  image:    String,
  price:    { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  variant: {
    color:    { name: String, hex: String },
    storage:  String,
  },
});

const orderSchema = new mongoose.Schema({
  orderNumber:       { type: String, unique: true },
  invoiceNumber:     { type: String, unique: true, sparse: true },
  user:              { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  guestInfo: {
    name:      String,
    firstName: String,
    lastName:  String,
    email:     String,
    phone:     String,
  },
  customer: {
    firstName: String,
    lastName:  String,
    email:     String,
    phone:     String,
  },
  items:        [orderItemSchema],
  delivery: {
    region:  String,
    address: String,
    notes:   String,
    fee:     { type: Number, default: 0 },
    method:  { type: String, enum: ['delivery', 'pickup'], default: 'delivery' },
  },
  payment: {
    method:  { type: String, enum: ['pay_on_pickup', 'paystack'], default: 'pay_on_pickup' },
    status:  { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    reference: String,
    paidAt:  Date,
  },
  promoCode:   String,
  discount:    { type: Number, default: 0 },
  subtotal:    { type: Number, required: true },
  tax:         { type: Number, default: 0, min: 0 },
  total:       { type: Number, required: true },
  status:      { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  statusHistory: [{
    status:    String,
    note:      String,
    updatedAt: { type: Date, default: Date.now },
  }],
  notes:       String,
}, { timestamps: true });

// Auto order number - unpredictable random
orderSchema.pre('save', async function () {
  if (!this.orderNumber) {
    const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
    const ts = Date.now().toString(36).toUpperCase();
    this.orderNumber = `AIS-${ts}-${rand}`;
  }
  if (!this.invoiceNumber) {
    this.invoiceNumber = this.orderNumber;
  }
});
module.exports = mongoose.model('Order', orderSchema);
