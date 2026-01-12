import { AdminCustomerSubscriptionsService as ApiCustomerSubscriptionsAdminService } from '@/lib/api';
import { BaseService } from './base-service';

export type SubscriptionStatus =
  | 'PENDING_PAYMENT'
  | 'PENDING_ACTIVATION'
  | 'ACTIVE'
  | 'EXPIRED'
  | 'CANCELLED';

export type PaymentMethod =
  | 'VISA_ON_DELIVERY'
  | 'CASH_ON_DELIVERY'
  | 'CLIQ'
  | 'GOLD_COINS';

export interface CustomerSubscription {
  id: string;
  status: SubscriptionStatus;
  purchasedAt: string;
  paymentConfirmedAt?: string;
  paymentConfirmedBy?: string;
  activatedAt?: string;
  expiresAt?: string;
  activationCode?: string;
  activationCodeSentAt?: string;
  activationCodeExpiry?: string;
  paymentMethod: PaymentMethod;
  pricePaid: number;
  coinsAwarded: number;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    mobileNumber: string;
  };
  plan: {
    id: string;
    name: string;
    coinCost: number;
    validityDays: number;
    description?: string;
  };
  goldCoinTransactions?: Array<{
    id: string;
    type: string;
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    description: string;
    createdAt: string;
  }>;
}

export interface SubscriptionMetrics {
  total: number;
  byStatus: {
    pendingPayment: number;
    pendingActivation: number;
    active: number;
    expired: number;
    cancelled: number;
  };
}

export class CustomerSubscriptionsService extends BaseService {
  async findAll(status?: SubscriptionStatus, customerId?: string): Promise<CustomerSubscription[]> {
    return this.handleRequest<CustomerSubscription[]>(
      ApiCustomerSubscriptionsAdminService.customerSubscriptionsAdminControllerGetAllSubscriptions(
        status,
        customerId
      )
    );
  }

  async findOne(id: string): Promise<CustomerSubscription> {
    return this.handleRequest<CustomerSubscription>(
      ApiCustomerSubscriptionsAdminService.customerSubscriptionsAdminControllerGetSubscriptionDetails(id)
    );
  }

  async confirmPaymentAndSendCode(id: string): Promise<CustomerSubscription> {
    return this.handleRequest<CustomerSubscription>(
      ApiCustomerSubscriptionsAdminService.customerSubscriptionsAdminControllerConfirmPaymentAndSendCode(id)
    );
  }

  async resendCode(id: string): Promise<CustomerSubscription> {
    return this.handleRequest<CustomerSubscription>(
      ApiCustomerSubscriptionsAdminService.customerSubscriptionsAdminControllerResendActivationCode(id)
    );
  }

  async cancel(id: string): Promise<CustomerSubscription> {
    return this.handleRequest<CustomerSubscription>(
      ApiCustomerSubscriptionsAdminService.customerSubscriptionsAdminControllerCancelSubscription(id)
    );
  }

  async getMetrics(): Promise<SubscriptionMetrics> {
    return this.handleRequest<SubscriptionMetrics>(
      ApiCustomerSubscriptionsAdminService.customerSubscriptionsAdminControllerGetMetrics()
    );
  }
}

export const customerSubscriptionsService = new CustomerSubscriptionsService();
