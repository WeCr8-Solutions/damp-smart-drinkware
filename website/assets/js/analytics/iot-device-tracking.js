/**
 * IoT Device Tracking Module for GA4
 * Smart device tracking for DAMP Smart Drinkware
 *
 * @fileoverview Track device connections, battery, zones, and usage
 * @author WeCr8 Solutions LLC
 * @version 3.0.0
 */

import { Logger } from '../store/utils/logger.js';

/**
 * IoT Device Event Types
 */
export const IoTEventType = {
    // Device Management
    DEVICE_PAIRED: 'device_paired',
    DEVICE_UNPAIRED: 'device_unpaired',
    DEVICE_CONNECTED: 'device_connected',
    DEVICE_DISCONNECTED: 'device_disconnected',
    
    // Battery & Hardware
    BATTERY_LOW: 'battery_low',
    BATTERY_CRITICAL: 'battery_critical',
    BATTERY_CHARGING: 'battery_charging',
    FIRMWARE_UPDATE_START: 'firmware_update_start',
    FIRMWARE_UPDATE_COMPLETE: 'firmware_update_complete',
    
    // Alerts & Notifications
    ABANDON_ALERT: 'abandon_alert',
    ABANDON_ALERT_DISMISSED: 'abandon_alert_dismissed',
    ZONE_ALERT: 'zone_alert',
    FIND_DEVICE_ACTIVATED: 'find_device_activated',
    
    // Zone Management
    ZONE_CREATED: 'zone_created',
    ZONE_UPDATED: 'zone_updated',
    ZONE_DELETED: 'zone_deleted',
    ZONE_ENTERED: 'zone_entered',
    ZONE_EXITED: 'zone_exited',
    
    // Device Usage
    DEVICE_USAGE: 'device_usage',
    FEATURE_USED: 'feature_used',
    SETTINGS_CHANGED: 'settings_changed'
};

/**
 * Device Types
 */
export const DeviceType = {
    HANDLE: 'handle',
    SILICONE_BOTTOM: 'silicone_bottom',
    CUP_SLEEVE: 'cup_sleeve',
    BABY_BOTTLE: 'baby_bottle'
};

/**
 * Zone Types
 */
export const ZoneType = {
    HOME: 'home',
    OFFICE: 'office',
    VEHICLE: 'vehicle',
    GYM: 'gym',
    CUSTOM: 'custom'
};

/**
 * IoT Device Tracking Class
 */
export class IoTDeviceTracking {
    #logger = null;
    #debug = false;
    #measurementId = null;
    #activeDevices = new Map();
    #zones = new Map();

    constructor(config = {}) {
        this.#logger = new Logger('IoTDeviceTracking');
        this.#debug = config.debug || false;
        this.#measurementId = config.measurementId || 'G-YW2BN4SVPQ';
    }

    /**
     * Track device pairing
     */
    trackDevicePaired(deviceData) {
        const event = {
            device_id: deviceData.deviceId,
            device_type: deviceData.deviceType || DeviceType.HANDLE,
            device_model: deviceData.deviceModel || 'v1.0',
            pairing_method: deviceData.pairingMethod || 'bluetooth',
            pairing_success: deviceData.success !== false,
            pairing_duration: deviceData.pairingDuration || 0,
            user_id: deviceData.userId
        };

        this.#sendEvent(IoTEventType.DEVICE_PAIRED, event);
        
        if (event.pairing_success) {
            this.#activeDevices.set(deviceData.deviceId, {
                ...deviceData,
                pairedAt: Date.now()
            });
        }

        this.#logger.info('Device paired', { 
            deviceId: deviceData.deviceId,
            success: event.pairing_success 
        });
    }

    /**
     * Track device connection status
     */
    trackDeviceConnection(deviceId, connected, connectionData = {}) {
        const event = {
            device_id: deviceId,
            connection_type: connectionData.connectionType || 'bluetooth',
            signal_strength: connectionData.signalStrength,
            connection_time: connectionData.connectionTime,
            reconnection: connectionData.reconnection || false
        };

        const eventType = connected ? IoTEventType.DEVICE_CONNECTED : IoTEventType.DEVICE_DISCONNECTED;
        this.#sendEvent(eventType, event);

        this.#logger.info(`Device ${connected ? 'connected' : 'disconnected'}`, { deviceId });
    }

    /**
     * Track battery events
     */
    trackBatteryEvent(deviceId, batteryLevel, eventType = null) {
        const event = {
            device_id: deviceId,
            battery_level: batteryLevel,
            battery_percentage: Math.round(batteryLevel)
        };

        // Auto-detect event type based on battery level
        if (!eventType) {
            if (batteryLevel <= 5) {
                eventType = IoTEventType.BATTERY_CRITICAL;
            } else if (batteryLevel <= 20) {
                eventType = IoTEventType.BATTERY_LOW;
            } else {
                eventType = IoTEventType.DEVICE_USAGE; // General battery update
            }
        }

        this.#sendEvent(eventType, event);

        if (batteryLevel <= 20) {
            this.#logger.warn('Low battery detected', { deviceId, batteryLevel });
        }
    }

    /**
     * Track firmware updates
     */
    trackFirmwareUpdate(deviceId, updateData) {
        const event = {
            device_id: deviceId,
            firmware_version: updateData.version,
            previous_version: updateData.previousVersion,
            update_size: updateData.updateSize,
            update_duration: updateData.duration
        };

        const eventType = updateData.complete 
            ? IoTEventType.FIRMWARE_UPDATE_COMPLETE 
            : IoTEventType.FIRMWARE_UPDATE_START;

        this.#sendEvent(eventType, event);

        this.#logger.info(`Firmware update ${updateData.complete ? 'completed' : 'started'}`, {
            deviceId,
            version: updateData.version
        });
    }

    /**
     * Track abandonment alerts
     */
    trackAbandonAlert(deviceId, alertData) {
        const event = {
            device_id: deviceId,
            alert_type: alertData.alertType || 'distance',
            distance: alertData.distance,
            time_away: alertData.timeAway,
            zone_name: alertData.zoneName,
            in_safe_zone: alertData.inSafeZone || false,
            alert_count: alertData.alertCount || 1
        };

        this.#sendEvent(IoTEventType.ABANDON_ALERT, event);

        this.#logger.info('Abandon alert triggered', { 
            deviceId,
            distance: alertData.distance 
        });
    }

    /**
     * Track alert dismissal
     */
    trackAlertDismissed(deviceId, dismissalData) {
        const event = {
            device_id: deviceId,
            alert_type: dismissalData.alertType,
            dismissal_method: dismissalData.dismissalMethod || 'tap',
            time_to_dismiss: dismissalData.timeToDismiss,
            action_taken: dismissalData.actionTaken || 'dismissed'
        };

        this.#sendEvent(IoTEventType.ABANDON_ALERT_DISMISSED, event);

        this.#logger.info('Alert dismissed', { 
            deviceId,
            method: dismissalData.dismissalMethod 
        });
    }

    /**
     * Track "Find My Device" feature
     */
    trackFindDevice(deviceId, findData = {}) {
        const event = {
            device_id: deviceId,
            find_method: findData.findMethod || 'app',
            device_found: findData.deviceFound || false,
            time_to_find: findData.timeToFind,
            distance: findData.distance
        };

        this.#sendEvent(IoTEventType.FIND_DEVICE_ACTIVATED, event);

        this.#logger.info('Find device activated', { deviceId });
    }

    /**
     * Track zone creation
     */
    trackZoneCreated(zoneData) {
        const event = {
            zone_id: zoneData.zoneId,
            zone_name: zoneData.zoneName,
            zone_type: zoneData.zoneType || ZoneType.CUSTOM,
            location_method: zoneData.locationMethod || 'wifi',
            wifi_networks_count: zoneData.wifiNetworksCount || 0,
            bluetooth_beacons_count: zoneData.bluetoothBeaconsCount || 0,
            radius: zoneData.radius,
            user_id: zoneData.userId
        };

        this.#sendEvent(IoTEventType.ZONE_CREATED, event);
        
        this.#zones.set(zoneData.zoneId, {
            ...zoneData,
            createdAt: Date.now()
        });

        this.#logger.info('Zone created', { 
            zoneName: zoneData.zoneName,
            zoneType: zoneData.zoneType 
        });
    }

    /**
     * Track zone updates
     */
    trackZoneUpdated(zoneId, updateData) {
        const event = {
            zone_id: zoneId,
            zone_name: updateData.zoneName,
            changes_made: updateData.changesMade || [],
            update_type: updateData.updateType || 'settings'
        };

        this.#sendEvent(IoTEventType.ZONE_UPDATED, event);

        this.#logger.info('Zone updated', { zoneId });
    }

    /**
     * Track zone entry/exit
     */
    trackZoneTransition(deviceId, zoneData, entered) {
        const event = {
            device_id: deviceId,
            zone_id: zoneData.zoneId,
            zone_name: zoneData.zoneName,
            zone_type: zoneData.zoneType,
            transition_method: zoneData.transitionMethod || 'wifi',
            confidence_score: zoneData.confidenceScore || 0.8
        };

        const eventType = entered ? IoTEventType.ZONE_ENTERED : IoTEventType.ZONE_EXITED;
        this.#sendEvent(eventType, event);

        this.#logger.info(`Zone ${entered ? 'entered' : 'exited'}`, { 
            deviceId,
            zoneName: zoneData.zoneName 
        });
    }

    /**
     * Track device usage patterns
     */
    trackDeviceUsage(deviceId, usageData) {
        const event = {
            device_id: deviceId,
            usage_duration: usageData.usageDuration,
            alerts_received: usageData.alertsReceived || 0,
            alerts_dismissed: usageData.alertsDismissed || 0,
            zones_visited: usageData.zonesVisited || 0,
            battery_consumed: usageData.batteryConsumed,
            connection_quality: usageData.connectionQuality || 'good'
        };

        this.#sendEvent(IoTEventType.DEVICE_USAGE, event);

        this.#logger.debug('Device usage tracked', { deviceId });
    }

    /**
     * Track feature usage
     */
    trackFeatureUsed(featureName, featureData = {}) {
        const event = {
            feature_name: featureName,
            device_id: featureData.deviceId,
            feature_category: featureData.category || 'device_management',
            success: featureData.success !== false,
            user_id: featureData.userId
        };

        this.#sendEvent(IoTEventType.FEATURE_USED, event);

        this.#logger.info('Feature used', { featureName });
    }

    /**
     * Track settings changes
     */
    trackSettingsChanged(settingsData) {
        const event = {
            device_id: settingsData.deviceId,
            setting_name: settingsData.settingName,
            setting_category: settingsData.category || 'general',
            old_value: settingsData.oldValue,
            new_value: settingsData.newValue,
            user_id: settingsData.userId
        };

        this.#sendEvent(IoTEventType.SETTINGS_CHANGED, event);

        this.#logger.info('Settings changed', { 
            setting: settingsData.settingName 
        });
    }

    /**
     * Get active devices summary
     */
    getActiveDevicesSummary() {
        return {
            total_devices: this.#activeDevices.size,
            total_zones: this.#zones.size,
            devices: Array.from(this.#activeDevices.values())
        };
    }

    /**
     * Send event to GA4
     * @private
     */
    #sendEvent(eventType, eventData) {
        if (typeof window === 'undefined' || !window.gtag) {
            this.#logger.warn('GA4 not available', { eventType });
            return;
        }

        try {
            window.gtag('event', eventType, {
                ...eventData,
                timestamp: Date.now(),
                platform: this.#getPlatform()
            });

            if (this.#debug) {
                this.#logger.debug('IoT event tracked', { 
                    type: eventType, 
                    data: eventData 
                });
            }
        } catch (error) {
            this.#logger.error('Failed to send IoT event', error);
        }
    }

    /**
     * Detect platform
     * @private
     */
    #getPlatform() {
        if (typeof navigator === 'undefined') return 'unknown';
        
        const userAgent = navigator.userAgent || '';
        if (/iPad|iPhone|iPod/.test(userAgent)) return 'ios';
        if (/android/i.test(userAgent)) return 'android';
        return 'web';
    }

    /**
     * Enable debug mode
     */
    setDebugMode(enabled = true) {
        this.#debug = enabled;
        this.#logger.info('IoT tracking debug mode', { enabled });
    }
}

// Export singleton instance
const iotDeviceTracking = new IoTDeviceTracking();
export default iotDeviceTracking;

// Export convenience functions
export const trackDevicePaired = (deviceData) => iotDeviceTracking.trackDevicePaired(deviceData);
export const trackDeviceConnection = (deviceId, connected, data) => iotDeviceTracking.trackDeviceConnection(deviceId, connected, data);
export const trackBatteryEvent = (deviceId, level, type) => iotDeviceTracking.trackBatteryEvent(deviceId, level, type);
export const trackFirmwareUpdate = (deviceId, data) => iotDeviceTracking.trackFirmwareUpdate(deviceId, data);
export const trackAbandonAlert = (deviceId, data) => iotDeviceTracking.trackAbandonAlert(deviceId, data);
export const trackAlertDismissed = (deviceId, data) => iotDeviceTracking.trackAlertDismissed(deviceId, data);
export const trackFindDevice = (deviceId, data) => iotDeviceTracking.trackFindDevice(deviceId, data);
export const trackZoneCreated = (data) => iotDeviceTracking.trackZoneCreated(data);
export const trackZoneUpdated = (zoneId, data) => iotDeviceTracking.trackZoneUpdated(zoneId, data);
export const trackZoneTransition = (deviceId, zoneData, entered) => iotDeviceTracking.trackZoneTransition(deviceId, zoneData, entered);
export const trackDeviceUsage = (deviceId, data) => iotDeviceTracking.trackDeviceUsage(deviceId, data);
export const trackFeatureUsed = (name, data) => iotDeviceTracking.trackFeatureUsed(name, data);
export const trackSettingsChanged = (data) => iotDeviceTracking.trackSettingsChanged(data);

