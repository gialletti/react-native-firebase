// @flow
import { NativeModules } from 'react-native';
// import { version as ReactVersion } from 'react';
// import ReactNativeVersion from 'react-native/Libraries/Core/ReactNativeVersion';
import INTERNALS from '../../utils/internals';
import { isIOS } from '../../utils';
import ModuleBase from '../../utils/ModuleBase';
import PACKAGE from '../../../package.json';

const FirebaseCoreModule = NativeModules.RNFirebase;

type GoogleApiAvailabilityType = {
  status: number,
  isAvailable: boolean,
  isUserResolvableError?: boolean,
  hasResolution?: boolean,
  error?: string
}

export const MODULE_NAME = 'RNFirebaseUtils';
export const NAMESPACE = 'utils';

export default class RNFirebaseUtils extends ModuleBase {
  /**
   *
   */
  checkPlayServicesAvailability() {
    if (isIOS) return;

    const { status } = this.playServicesAvailability;

    if (!this.playServicesAvailability.isAvailable) {
      if (INTERNALS.OPTIONS.promptOnMissingPlayServices && this.playServicesAvailability.isUserResolvableError) {
        this.promptForPlayServices();
      } else {
        const error = INTERNALS.STRINGS.ERROR_PLAY_SERVICES(status);
        if (INTERNALS.OPTIONS.errorOnMissingPlayServices) {
          if (status === 2) console.warn(error); // only warn if it exists but may need an update
          else throw new Error(error);
        } else {
          console.warn(error);
        }
      }
    }
  }

  promptForPlayServices() {
    if (isIOS) return null;
    return FirebaseCoreModule.promptForPlayServices();
  }

  resolutionForPlayServices() {
    if (isIOS) return null;
    return FirebaseCoreModule.resolutionForPlayServices();
  }

  makePlayServicesAvailable() {
    if (isIOS) return null;
    return FirebaseCoreModule.makePlayServicesAvailable();
  }

  /**
   * Set the global logging level for all logs.
   *
   * @param logLevel
   */
  set logLevel(logLevel: string) {
    INTERNALS.OPTIONS.logLevel = logLevel;
  }

  /**
   * Returns props from the android GoogleApiAvailability sdk
   * @android
   * @return {RNFirebase.GoogleApiAvailabilityType|{isAvailable: boolean, status: number}}
   */
  get playServicesAvailability(): GoogleApiAvailabilityType {
    return FirebaseCoreModule.playServicesAvailability || { isAvailable: true, status: 0 };
  }

  /**
   * Enable/Disable throwing an error or warning on detecting a play services problem
   * @android
   * @param bool
   */
  set errorOnMissingPlayServices(bool: boolean) {
    INTERNALS.OPTIONS.errorOnMissingPlayServices = bool;
  }

  /**
   * Enable/Disable automatic prompting of the play services update dialog
   * @android
   * @param bool
   */
  set promptOnMissingPlayServices(bool: boolean) {
    INTERNALS.OPTIONS.promptOnMissingPlayServices = bool;
  }
}


export const statics = {
  // VERSIONS: {
  //   react: ReactVersion,
  //   'react-native': Object.values(ReactNativeVersion.version).slice(0, 3).join('.'),
  //   'react-native-firebase': PACKAGE.version,
  // },
};
