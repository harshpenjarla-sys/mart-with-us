/**
 * Payment Abstraction Layer
 * Architecture:
 * PaymentService -> PaymentProviderInterface -> MockPaymentProvider / RazorpayProvider (Future)
 */

class MockPaymentProvider {
  async processPayment({ orderId, amount, method, customer }) {
    // Simulate real gateway latency & validation
    return new Promise((resolve) => {
      setTimeout(() => {
        const isSuccess = true; // In mock mode, defaults to success unless specified
        const transactionId = 'TXN_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7).toUpperCase();

        if (isSuccess) {
          resolve({
            success: true,
            transactionId,
            gateway: 'MOCK_GATEWAY_V1',
            status: 'PAID',
            amount,
            currency: 'INR',
            paidAt: new Date().toISOString(),
            message: `Mock payment via ${method} processed successfully.`
          });
        } else {
          resolve({
            success: false,
            transactionId,
            gateway: 'MOCK_GATEWAY_V1',
            status: 'FAILED',
            amount,
            currency: 'INR',
            message: 'Payment verification failed at gateway.'
          });
        }
      }, 500);
    });
  }

  async refundPayment({ transactionId, amount, reason }) {
    return {
      success: true,
      refundId: 'REF_' + Date.now(),
      transactionId,
      amount,
      status: 'REFUNDED',
      refundedAt: new Date().toISOString()
    };
  }
}

class RazorpayProvider {
  constructor(apiKey, apiSecret) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }

  async processPayment() {
    throw new Error('Razorpay credentials not configured in environment. Using MockPaymentProvider.');
  }

  async refundPayment() {
    throw new Error('Razorpay credentials not configured.');
  }
}

class PaymentService {
  constructor() {
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      this.provider = new RazorpayProvider(process.env.RAZORPAY_KEY_ID, process.env.RAZORPAY_KEY_SECRET);
      this.providerName = 'Razorpay';
    } else {
      this.provider = new MockPaymentProvider();
      this.providerName = 'MockPaymentProvider (Demo)';
    }
  }

  async initiateCheckout({ orderId, amount, method, customer }) {
    if (method === 'Cash on Delivery') {
      return {
        success: true,
        transactionId: 'COD_' + Date.now(),
        gateway: 'CASH_ON_DELIVERY',
        status: 'PENDING',
        amount,
        currency: 'INR',
        paidAt: null,
        message: 'Cash on Delivery selected. Payment will be collected on dropoff.'
      };
    }

    return await this.provider.processPayment({ orderId, amount, method, customer });
  }

  async processRefund({ transactionId, amount, reason }) {
    return await this.provider.refundPayment({ transactionId, amount, reason });
  }
}

module.exports = new PaymentService();
