#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(RNSplitView, NSObject)

RCT_EXTERN_METHOD(isIPad:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(getDeviceType:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(getHorizontalSizeClass:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(getRecommendedSplitRatio:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(shouldShowSplitView:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

@end
