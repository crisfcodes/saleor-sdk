import { ApolloClientManager } from "../../data/ApolloClientManager";
import { LocalStorageHandler } from "../../helpers/LocalStorageHandler";

import { QueuedJobsHandler } from "../QueuedJobsHandler";

export enum ErrorCartTypes {
  "SET_CART_ITEM",
}

export class CartQueuedJobs extends QueuedJobsHandler<ErrorCartTypes> {
  private apolloClientManager: ApolloClientManager;

  private localStorageHandler: LocalStorageHandler;

  constructor(
    localStorageHandler: LocalStorageHandler,
    apolloClientManager: ApolloClientManager
  ) {
    super();
    this.localStorageHandler = localStorageHandler;
    this.apolloClientManager = apolloClientManager;
  }

  setCartItem = async () => {
    const checkout = await LocalStorageHandler.getCheckout();

    if (checkout) {
      const { data, error } = await this.apolloClientManager.setCartItem(
        checkout?._W? checkout?._W : checkout
      );
      if (error && this.onErrorListener) {
        this.onErrorListener(error, ErrorCartTypes.SET_CART_ITEM);
      } else if (data) {
        await this.localStorageHandler.setCheckout({
          ...(checkout?._W? checkout?._W : checkout),
          availablePaymentGateways: data.availablePaymentGateways,
          availableShippingMethods: data.availableShippingMethods,
          lines: data.lines,
          promoCodeDiscount: data.promoCodeDiscount,
          shippingMethod: data.shippingMethod,
        });
      }
    }
  };
}
