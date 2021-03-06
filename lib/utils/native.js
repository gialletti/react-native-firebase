/*
 * @flow
 */
import { NativeModules } from 'react-native';
import { initialiseNativeModuleEventEmitter } from './events';
import INTERNALS from './internals';

import type ModuleBase from './ModuleBase';
import type { FirebaseModuleConfig } from '../types';

// Firebase Native SDKs that support multiple app instances
const MULTI_APP_MODULES = [
  'RNFirebaseAuth',
  'RNFirebaseDatabase',
  'RNFirebaseFirestore',
  'RNFirebaseStorage',
];

const NATIVE_MODULES: { [string]: Object } = {};

/**
 * Prepends appName arg to all native method calls
 * @param appName
 * @param NativeModule
 */
const nativeWithApp = (appName: string, NativeModule: Object): Object => {
  const native = {};
  const methods = Object.keys(NativeModule);

  for (let i = 0, len = methods.length; i < len; i++) {
    const method = methods[i];
    native[method] = (...args) => {
      return NativeModule[method](...[appName, ...args]);
    };
  }

  return native;
};

const getModuleKey = (module: ModuleBase): string => `${module.app.name}:${module.namespace}`;

export const getNativeModule = (module: ModuleBase): Object => {
  const key = getModuleKey(module);
  return NATIVE_MODULES[key];
};

export const initialiseNativeModule = (module: ModuleBase, config: FirebaseModuleConfig): Object => {
  const { moduleName, namespace } = config;
  const nativeModule = NativeModules[moduleName];
  const key = getModuleKey(module);

  if (!nativeModule && namespace !== 'utils') {
    throw new Error(INTERNALS.STRINGS.ERROR_MISSING_MODULE(namespace, moduleName));
  }

  // used by the modules that extend ModuleBase
  // to access their native module counterpart
  if (!MULTI_APP_MODULES.includes(moduleName)) {
    NATIVE_MODULES[key] = nativeModule;
  } else {
    NATIVE_MODULES[key] = nativeWithApp(module.app.name, nativeModule);
  }

  initialiseNativeModuleEventEmitter(module, config);

  return NATIVE_MODULES[key];
};
