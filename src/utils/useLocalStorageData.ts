import { useSyncExternalStore } from "react";
import type { Account } from "../types";

export const DATA_LOCAL_STORAGE_EVENT = "dataLocalSettingEvent";
const LOCAL_STORAGE_KEY = "data";

const getLocalStorageData = (): string => {
  const dataLocalSetting = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (dataLocalSetting) {
    return dataLocalSetting;
  }
  const json = JSON.stringify([
    { id: 1, name: "Visa", transactions: [], balance: 0, limit: 10000 },
    { id: 2, name: "Mastercard", transactions: [], balance: 0, limit: 10000 },
  ]);
  localStorage.setItem(LOCAL_STORAGE_KEY, json);
  return json;
};

const useLocalStorageData = (): [string, (value: Account[]) => void] => {
  const setLocalStorageChart = (value: Account[]) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(value));
    window.dispatchEvent(new Event(DATA_LOCAL_STORAGE_EVENT));
  };
  const localStorageStore = useSyncExternalStore((listener: () => void) => {
    window.addEventListener(DATA_LOCAL_STORAGE_EVENT, listener);
    return () => {
      window.removeEventListener(DATA_LOCAL_STORAGE_EVENT, listener);
    };
  }, getLocalStorageData);
  return [localStorageStore, setLocalStorageChart];
};

export default useLocalStorageData;
