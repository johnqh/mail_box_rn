import UIKit
import React

/**
 * Native Split View Module for iPad
 *
 * Provides device type detection and split view capabilities
 * for true UISplitViewController behavior on iPad.
 */
@objc(RNSplitView)
class RNSplitView: NSObject {

  @objc
  static func moduleName() -> String {
    return "RNSplitView"
  }

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true
  }

  /**
   * Check if the current device is an iPad
   */
  @objc
  func isIPad(_ resolve: @escaping RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      let isIPad = UIDevice.current.userInterfaceIdiom == .pad
      resolve(isIPad)
    }
  }

  /**
   * Get the current device type
   */
  @objc
  func getDeviceType(_ resolve: @escaping RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      let idiom = UIDevice.current.userInterfaceIdiom
      switch idiom {
      case .pad:
        resolve("tablet")
      case .phone:
        resolve("phone")
      case .mac:
        resolve("desktop")
      default:
        resolve("unknown")
      }
    }
  }

  /**
   * Get the current horizontal size class
   * - compact: Phone-like layout
   * - regular: Tablet-like layout with room for split view
   */
  @objc
  func getHorizontalSizeClass(_ resolve: @escaping RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      guard let window = UIApplication.shared.connectedScenes
        .compactMap({ $0 as? UIWindowScene })
        .flatMap({ $0.windows })
        .first(where: { $0.isKeyWindow }) else {
        resolve("unknown")
        return
      }

      let sizeClass = window.traitCollection.horizontalSizeClass
      switch sizeClass {
      case .compact:
        resolve("compact")
      case .regular:
        resolve("regular")
      default:
        resolve("unknown")
      }
    }
  }

  /**
   * Get recommended split ratio based on device and orientation
   */
  @objc
  func getRecommendedSplitRatio(_ resolve: @escaping RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      let screenWidth = UIScreen.main.bounds.width
      let screenHeight = UIScreen.main.bounds.height
      let isLandscape = screenWidth > screenHeight

      // iPads in portrait should have larger master panel
      if UIDevice.current.userInterfaceIdiom == .pad {
        if isLandscape {
          resolve(0.35) // 35% for master in landscape
        } else {
          resolve(0.40) // 40% for master in portrait
        }
      } else {
        resolve(1.0) // Full width on phones
      }
    }
  }

  /**
   * Check if the app should show split view layout
   * Based on iOS Human Interface Guidelines
   */
  @objc
  func shouldShowSplitView(_ resolve: @escaping RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      guard let window = UIApplication.shared.connectedScenes
        .compactMap({ $0 as? UIWindowScene })
        .flatMap({ $0.windows })
        .first(where: { $0.isKeyWindow }) else {
        resolve(false)
        return
      }

      // Show split view only on iPad with regular horizontal size class
      let isIPad = UIDevice.current.userInterfaceIdiom == .pad
      let isRegular = window.traitCollection.horizontalSizeClass == .regular
      resolve(isIPad && isRegular)
    }
  }
}
