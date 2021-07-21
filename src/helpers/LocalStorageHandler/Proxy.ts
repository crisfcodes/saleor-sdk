import AsyncStorage from "@react-native-async-storage/async-storage";
import { NamedObservable } from "../NamedObservable";
import { LocalStorageEvents, LocalStorageItems } from "./types";
import { isExpired } from "./utils";
/**
 * Sets or removes data from local storage in one of the specified data format.
 * If data is set to null, then it is removed from local storage.
 * If needed, it stringify data for persistence in local storage or parse such data to be retrieved
 * in desired format.
 */
class LocalStorageHandlerProxy extends NamedObservable<
  LocalStorageItems | LocalStorageEvents
> {
  /**
   * Stringify object/string and saves it to local storage with expiration date.
   *
   * @param {LocalStorageItems} name
   * @param {string | TItem | null} item
   * @returns {Promise<void>}
   * @protected
   */
  protected async saveItem<TItem extends object>(
    name: LocalStorageItems,
    item: TItem | string | null
  ): Promise<void> {
    try {
      const wrappedItem = {
        item,
        timestamp: Date.now(),
      };
      if(name === LocalStorageItems.CHECKOUT){
        if(item?._W){
          await AsyncStorage.setItem(name, JSON.stringify(item._W || {}));
        } else{
          await AsyncStorage.setItem(name, JSON.stringify(item || {}));
        }
      } else {
        await AsyncStorage.setItem(name, JSON.stringify(wrappedItem));
      }
    } catch (error) {
      throw new Error(error.message);
    }
    console.log(name, item);
    this.notifyChange(name, item);
  }
  /**
   * Retrieve item from local storage and parse it as object/string.
   *
   * @param {LocalStorageItems} name
   * @returns {Promise<TItem | null>}
   * @protected
   */
  protected static async retrieveItem<TItem extends {}>(
    name: LocalStorageItems
  ): Promise<TItem | null> {
    try {
      const value = await AsyncStorage.getItem(name);
      if (!value) return null;
      const item = JSON.parse(value);
      if (isExpired(item)) {
        await AsyncStorage.removeItem(name);
        return null;
      }
      if(name === "data_checkout"){
        return item;
      } else {
        return item.value;
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }
  /**
   * Remove whole storage data
   *
   * @returns {Promise<void>}
   * @protected
   */
  protected async clearStorage(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      throw new Error(error.message);
    }
    this.notifyChange(LocalStorageEvents.CLEAR, undefined);
  }
}
export default LocalStorageHandlerProxy;