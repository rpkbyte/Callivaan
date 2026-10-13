# Callivaan Android Mobile App — Production Release Guide

This document defines the build, signing, and direct APK release procedures for Callivaan, fulfilling **T-028** and **T-029** of `docs/tasks.md`.

## 1. Release Architecture & Scope

- **Control Surface:** The Android app provides daily management: Overview metrics, Agent settings, Call history & lead drawers, Phone route setup guidance, WhatsApp pairing, and Usage/Billing status.
- **PSTN Media Isolation:** The app does **NOT** process live PSTN audio streams. Telephony audio runs strictly between the cloud provider (Exotel) and the Callivaan Media Gateway (`apps/media-gateway`).
- **Secret Safety:** The mobile client bundle contains **ZERO** service secrets, database keys, or provider tokens. All operations authenticate via short-lived JWT tokens.

## 2. Protected Keystore Generation (One-Time Setup)

To generate the official production release signing key:

```bash
keytool -genkeypair -v \
  -keystore callivaan-release.keystore \
  -alias callivaan-key-alias \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

> **CRITICAL SECURITY RULE:** Never commit `callivaan-release.keystore` or passwords to source control. Store the keystore file and credentials in your cloud Secret Manager.

## 3. Gradle Signing Configuration

In `android/app/build.gradle`:

```groovy
android {
    ...
    defaultConfig {
        applicationId "com.callivaan.app"
        minSdkVersion 23
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"
    }
    signingConfigs {
        release {
            if (project.hasProperty('CALLIVAAN_UPLOAD_STORE_FILE')) {
                storeFile file(CALLIVAAN_UPLOAD_STORE_FILE)
                storePassword System.getenv("CALLIVAAN_STORE_PASSWORD")
                keyAlias System.getenv("CALLIVAAN_KEY_ALIAS")
                keyPassword System.getenv("CALLIVAAN_KEY_PASSWORD")
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
        }
    }
}
```

## 4. Building the Production Release APK

To assemble the signed APK:

```bash
cd android
./gradlew clean assembleRelease
```

The output file will be generated at:
`android/app/build/outputs/apk/release/app-release.apk`

Rename this package to:
`callivaan-v1.0.0.apk`

## 5. Checksum and Integrity Verification

Compute the cryptographic SHA-256 hash before publishing:

```bash
sha256sum callivaan-v1.0.0.apk
```

Publish the resulting hash on the official website download page (`apps/web` downloads section) so users can verify the integrity of their download.

## 6. Website Direct Sideloading Guidance for Customers

Because Callivaan is distributed directly from the product website without Google Play:

1. **Download:** Customer visits `https://callivaan.demo/#apk` on their Android device and taps **Download APK**.
2. **Permission Prompt:** Android displays a security notice: *"For your security, your phone is not allowed to install unknown apps from this source"*.
3. **Grant Permission:** Tap **Settings**, toggle on **Allow from this source**, and tap Back.
4. **Install:** Tap **Install**. Once complete, tap **Open**.
5. **Sign In:** Use your registered account credentials to immediately link your tenant and manage calls.
