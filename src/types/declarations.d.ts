// Type declarations for packages without TypeScript definitions

declare module 'react-native-haptic-feedback' {
  type HapticFeedbackTypes =
    | 'selection'
    | 'impactLight'
    | 'impactMedium'
    | 'impactHeavy'
    | 'rigid'
    | 'soft'
    | 'notificationSuccess'
    | 'notificationWarning'
    | 'notificationError'
    | 'clockTick'
    | 'contextClick'
    | 'keyboardPress'
    | 'keyboardRelease'
    | 'keyboardTap'
    | 'longPress'
    | 'textHandleMove'
    | 'virtualKey'
    | 'virtualKeyRelease';

  interface HapticOptions {
    enableVibrateFallback?: boolean;
    ignoreAndroidSystemSettings?: boolean;
  }

  const ReactNativeHapticFeedback: {
    trigger: (type: HapticFeedbackTypes, options?: HapticOptions) => void;
  };

  export default ReactNativeHapticFeedback;
}

declare module 'react-native-biometrics' {
  export interface BiometryTypes {
    TouchID: 'TouchID';
    FaceID: 'FaceID';
    Biometrics: 'Biometrics';
  }

  export interface IsSensorAvailableResult {
    available: boolean;
    biometryType?: string;
    error?: string;
  }

  export interface CreateSignatureResult {
    success: boolean;
    signature?: string;
    error?: string;
  }

  export interface SimplePromptResult {
    success: boolean;
    error?: string;
  }

  export default class ReactNativeBiometrics {
    constructor(options?: { allowDeviceCredentials?: boolean });
    isSensorAvailable(): Promise<IsSensorAvailableResult>;
    createKeys(): Promise<{ publicKey: string }>;
    biometricKeysExist(): Promise<{ keysExist: boolean }>;
    deleteKeys(): Promise<{ keysDeleted: boolean }>;
    createSignature(options: {
      promptMessage: string;
      payload: string;
      cancelButtonText?: string;
    }): Promise<CreateSignatureResult>;
    simplePrompt(options: {
      promptMessage: string;
      cancelButtonText?: string;
      fallbackPromptMessage?: string;
    }): Promise<SimplePromptResult>;
  }
}
