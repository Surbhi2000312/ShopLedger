'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const invoice = require('../lib/invoice');
const pricing = require('../lib/pricing');

function line(name, price, qty, hsn) {
  return { name, sku: name.toUpperCase(), price, qty, hsn, gstRate: undefined };
}

function checkOrder(id, items, coupon, expectedInvoice, expectedCheckout) {
  const order = { id, items, coupon };
  const invoiceFigures = invoice.computeInvoiceFigures(order);
  const checkoutFigures = pricing.computeTotals(items, coupon);

  assert.deepEqual(invoiceFigures, expectedInvoice);
  assert.equal(checkoutFigures.subtotal, expectedCheckout.subtotal);
  assert.equal(checkoutFigures.discount, expectedCheckout.discount);
  assert.equal(checkoutFigures.tax, expectedCheckout.tax);
  assert.equal(checkoutFigures.total, expectedCheckout.total);
}

test('CURRENT BEHAVIOUR: #1001 invoice applies default GST to 5% and 12% HSN lines', function () {
  checkOrder(1001, [
    line('Rice', 1000, 1, '1006'),
    line('Ghee', 500, 1, '0405')
  ], '', {
    subtotal: 1500,
    discount: 0,
    tax: 110,
    cgst: 55,
    sgst: 55,
    total: 1610,
    rows: [
      { name: 'Rice', sku: 'RICE', hsn: '1006', qty: 1, price: 1000, gstPercent: 5, line: 1000, lineTax: 50 },
      { name: 'Ghee', sku: 'GHEE', hsn: '0405', qty: 1, price: 500, gstPercent: 12, line: 500, lineTax: 60 }
    ]
  }, { subtotal: 1500, discount: 0, tax: 110, total: 1610 });
});

test('CURRENT BEHAVIOUR: #1002 SAVE10 discount is applied before HSN GST', function () {
  checkOrder(1002, [line('Rice', 1000, 1, '1006')], 'SAVE10', {
    subtotal: 1000,
    discount: 100,
    tax: 45,
    cgst: 22.5,
    sgst: 22.5,
    total: 945,
    rows: [
      { name: 'Rice', sku: 'RICE', hsn: '1006', qty: 1, price: 1000, gstPercent: 5, line: 1000, lineTax: 45 }
    ]
  }, { subtotal: 1000, discount: 100, tax: 45, total: 945 });
});

test('CURRENT BEHAVIOUR: #1004 SAVE10 invoice applies the ₹150 cap before GST', function () {
  checkOrder(1004, [line('Tea', 2240, 1, '0902')], 'SAVE10', {
    subtotal: 2240,
    discount: 150,
    tax: 376.2,
    cgst: 188.1,
    sgst: 188.1,
    total: 2466.2,
    rows: [
      { name: 'Tea', sku: 'TEA', hsn: '0902', qty: 1, price: 2240, gstPercent: 18, line: 2240, lineTax: 376.2 }
    ]
  }, { subtotal: 2240, discount: 150, tax: 376.2, total: 2466.2 });
});

test('CURRENT BEHAVIOUR: #1008 invoice matches checkout for an undiscounted 18% item', function () {
  checkOrder(1008, [line('Tea', 500, 1, '0902')], '', {
    subtotal: 500,
    discount: 0,
    tax: 90,
    cgst: 45,
    sgst: 45,
    total: 590,
    rows: [
      { name: 'Tea', sku: 'TEA', hsn: '0902', qty: 1, price: 500, gstPercent: 18, line: 500, lineTax: 90 }
    ]
  }, { subtotal: 500, discount: 0, tax: 90, total: 590 });
});

test('invoice figures match checkout HSN GST and capped pre-tax coupon discount', function () {
  const items = [
    line('Rice', 1000, 1, '1006'),
    line('Ghee', 1240, 1, '0405')
  ];
  const checkout = pricing.computeTotals(items, 'SAVE10');
  const figures = invoice.computeInvoiceFigures({ id: 1004, items, coupon: 'SAVE10' });

  assert.deepEqual(figures, {
    subtotal: 2240,
    discount: 150,
    tax: 185.49,
    cgst: 92.75,
    sgst: 92.74,
    total: 2275.49,
    rows: [
      { name: 'Rice', sku: 'RICE', hsn: '1006', qty: 1, price: 1000, gstPercent: 5, line: 1000, lineTax: 46.65 },
      { name: 'Ghee', sku: 'GHEE', hsn: '0405', qty: 1, price: 1240, gstPercent: 12, line: 1240, lineTax: 138.84 }
    ]
  });
  assert.equal(figures.subtotal, checkout.subtotal);
  assert.equal(figures.discount, checkout.discount);
  assert.equal(figures.tax, checkout.tax);
  assert.equal(figures.total, checkout.total);
});
