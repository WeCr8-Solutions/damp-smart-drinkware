/**
 * DAMP Smart Drinkware - Test Data Factory
 * Centralized factory for creating consistent test data
 * Copyright 2025 WeCr8 Solutions LLC
 */

import { faker } from '@faker-js/faker';

export interface TestUser {
  id: string;
  email: string;
  displayName: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  preferences: {
    units: 'metric' | 'imperial';
    notifications: boolean;
    dataSharing: boolean;
    theme: 'light' | 'dark' | 'auto';
  };
  subscription?: {
    status: 'active' | 'inactive' | 'cancelled';
    plan: 'free' | 'premium' | 'pro';
    startDate: string;
    endDate?: string;
  };
}

export interface TestDevice {
  id: string;
  name: string;
  type: 'silicone-bottom' | 'damp-handle' | 'cup-sleeve' | 'baby-bottle';
  userId: string;
  batteryLevel: number;
  isConnected: boolean;
  lastSeen: string;
  firmwareVersion: string;
  serialNumber: string;
  macAddress: string;
  calibrationData?: {
    temperatureOffset: number;
    humidityOffset: number;
    pressureOffset: number;
  };
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
}

export interface TestSensorData {
  id?: string;
  deviceId: string;
  temperature: number;
  humidity: number;
  pressure?: number;
  batteryLevel: number;
  timestamp: number;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  metadata?: {
    signalStrength: number;
    dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
    syncStatus: 'synced' | 'pending' | 'failed';
  };
}

export interface TestBLEDevice {
  id: string;
  name: string;
  localName?: string;
  rssi: number;
  isConnectable: boolean;
  serviceUUIDs: string[];
  manufacturerData?: Buffer;
  txPowerLevel?: number;
  isConnected?: boolean;
}

export interface TestFirebaseDocument {
  id: string;
  collection: string;
  data: any;
  createdAt: Date;
  updatedAt: Date;
}

export class TestDataFactory {
  /**
   * Create a test user with realistic data
   */
  static createUser(overrides: Partial<TestUser> = {}): TestUser {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();

    return {
      id: faker.string.uuid(),
      email,
      displayName: `${firstName} ${lastName}`,
      emailVerified: faker.datatype.boolean({ probability: 0.8 }),
      createdAt: faker.date.past({ years: 2 }).toISOString(),
      updatedAt: faker.date.recent().toISOString(),
      preferences: {
        units: faker.helpers.arrayElement(['metric', 'imperial']),
        notifications: faker.datatype.boolean({ probability: 0.7 }),
        dataSharing: faker.datatype.boolean({ probability: 0.4 }),
        theme: faker.helpers.arrayElement(['light', 'dark', 'auto'])
      },
      subscription: faker.datatype.boolean({ probability: 0.3 }) ? {
        status: faker.helpers.arrayElement(['active', 'inactive', 'cancelled']),
        plan: faker.helpers.arrayElement(['free', 'premium', 'pro']),
        startDate: faker.date.past({ years: 1 }).toISOString(),
        endDate: faker.datatype.boolean({ probability: 0.2 })
          ? faker.date.future().toISOString()
          : undefined
      } : undefined,
      ...overrides
    };
  }

  /**
   * Create a test device with realistic specifications
   */
  static createDevice(overrides: Partial<TestDevice> = {}): TestDevice {
    const deviceType = overrides.type || faker.helpers.arrayElement([
      'silicone-bottom', 'damp-handle', 'cup-sleeve', 'baby-bottle'
    ]);

    const deviceNames: Record<string, string[]> = {
      'silicone-bottom': ['DAMP Silicone Base', 'Smart Silicone Bottom', 'DAMP SB Pro'],
      'damp-handle': ['DAMP Handle Universal', 'Smart Handle Grip', 'DAMP Handle Pro'],
      'cup-sleeve': ['DAMP Cup Sleeve', 'Smart Thermal Sleeve', 'DAMP Sleeve Pro'],
      'baby-bottle': ['DAMP Baby Monitor', 'Smart Baby Bottle', 'DAMP BB Care']
    };

    const name = faker.helpers.arrayElement(deviceNames[deviceType]);
    const serialPrefix = deviceType.toUpperCase().replace('-', '');

    return {
      id: `${deviceType.replace('-', '_')}_${faker.string.alphanumeric(8)}`,
      name,
      type: deviceType,
      userId: faker.string.uuid(),
      batteryLevel: faker.number.int({ min: 10, max: 100 }),
      isConnected: faker.datatype.boolean({ probability: 0.3 }),
      lastSeen: faker.date.recent({ days: 7 }).toISOString(),
      firmwareVersion: `${faker.number.int({ min: 1, max: 3 })}.${faker.number.int({ min: 0, max: 9 })}.${faker.number.int({ min: 0, max: 9 })}`,
      serialNumber: `${serialPrefix}${faker.date.recent().getFullYear()}${faker.string.numeric(6)}`,
      macAddress: faker.internet.mac(),
      calibrationData: faker.datatype.boolean({ probability: 0.8 }) ? {
        temperatureOffset: faker.number.float({ min: -2, max: 2, fractionDigits: 2 }),
        humidityOffset: faker.number.float({ min: -5, max: 5, fractionDigits: 2 }),
        pressureOffset: faker.number.float({ min: -1, max: 1, fractionDigits: 2 })
      } : undefined,
      location: faker.datatype.boolean({ probability: 0.6 }) ? {
        latitude: faker.location.latitude(),
        longitude: faker.location.longitude(),
        accuracy: faker.number.int({ min: 3, max: 15 })
      } : undefined,
      ...overrides
    };
  }

  /**
   * Create realistic sensor data readings
   */
  static createSensorData(overrides: Partial<TestSensorData> = {}): TestSensorData {
    // Generate realistic temperature (indoor range)
    const temperature = faker.number.float({ min: 18, max: 28, fractionDigits: 1 });

    // Generate humidity based on temperature (realistic correlation)
    const baseHumidity = temperature < 22 ? 55 : 45;
    const humidity = faker.number.float({
      min: Math.max(30, baseHumidity - 15),
      max: Math.min(70, baseHumidity + 15),
      fractionDigits: 1
    });

    // Generate realistic pressure (sea level range)
    const pressure = faker.number.float({ min: 980, max: 1040, fractionDigits: 2 });

    return {
      id: faker.string.uuid(),
      deviceId: `device_${faker.string.alphanumeric(8)}`,
      temperature,
      humidity,
      pressure,
      batteryLevel: faker.number.int({ min: 15, max: 100 }),
      timestamp: faker.date.recent({ days: 1 }).getTime(),
      location: faker.datatype.boolean({ probability: 0.4 }) ? {
        latitude: faker.location.latitude(),
        longitude: faker.location.longitude(),
        accuracy: faker.number.int({ min: 3, max: 20 })
      } : undefined,
      metadata: {
        signalStrength: faker.number.int({ min: -90, max: -30 }),
        dataQuality: faker.helpers.arrayElement(['excellent', 'good', 'fair', 'poor']),
        syncStatus: faker.helpers.arrayElement(['synced', 'pending', 'failed'])
      },
      ...overrides
    };
  }

  /**
   * Create BLE device advertisement data
   */
  static createBLEDevice(overrides: Partial<TestBLEDevice> = {}): TestBLEDevice {
    const deviceType = faker.helpers.arrayElement(['SB', 'DH', 'CS', 'BB']);
    const deviceNumber = faker.string.numeric(3);
    const localName = `DAMP-${deviceType}-${deviceNumber}`;

    return {
      id: faker.string.alphanumeric(17, { casing: 'upper' }).replace(/(.{2})/g, '$1:').slice(0, -1),
      name: `DAMP ${deviceType} Device`,
      localName,
      rssi: faker.number.int({ min: -80, max: -30 }),
      isConnectable: faker.datatype.boolean({ probability: 0.9 }),
      serviceUUIDs: [
        '12345678-1234-1234-1234-123456789abc', // DAMP primary service
        ...(faker.datatype.boolean({ probability: 0.3 })
          ? ['180f'] // Battery service
          : []),
        ...(faker.datatype.boolean({ probability: 0.2 })
          ? ['180a'] // Device information service
          : [])
      ],
      manufacturerData: Buffer.from([
        0x01, 0x02, // DAMP manufacturer ID
        ...Array.from({ length: 8 }, () => faker.number.int({ min: 0, max: 255 }))
      ]),
      txPowerLevel: faker.number.int({ min: -20, max: 4 }),
      isConnected: false,
      ...overrides
    };
  }

  /**
   * Create Firebase document structure
   */
  static createFirebaseDocument(
    collection: string,
    data: any,
    overrides: Partial<TestFirebaseDocument> = {}
  ): TestFirebaseDocument {
    return {
      id: faker.string.alphanumeric(20),
      collection,
      data: {
        ...data,
        createdAt: faker.date.past().toISOString(),
        updatedAt: faker.date.recent().toISOString()
      },
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      ...overrides
    };
  }

  /**
   * Create a batch of related test data
   */
  static createUserWithDevicesAndData(options: {
    deviceCount?: number;
    dataPointsPerDevice?: number;
    timeRangeHours?: number;
  } = {}) {
    const {
      deviceCount = 2,
      dataPointsPerDevice = 24,
      timeRangeHours = 24
    } = options;

    const user = this.createUser();
    const devices = Array.from({ length: deviceCount }, () =>
      this.createDevice({ userId: user.id })
    );

    const sensorData = devices.flatMap(device =>
      Array.from({ length: dataPointsPerDevice }, (_, i) =>
        this.createSensorData({
          deviceId: device.id,
          timestamp: Date.now() - (i * (timeRangeHours * 60 * 60 * 1000) / dataPointsPerDevice)
        })
      )
    );

    return {
      user,
      devices,
      sensorData
    };
  }

  /**
   * Create time series data for performance testing
   */
  static createTimeSeriesData(options: {
    deviceId: string;
    startTime: number;
    endTime: number;
    intervalMs: number;
    includeAnomalies?: boolean;
  }) {
    const {
      deviceId,
      startTime,
      endTime,
      intervalMs,
      includeAnomalies = false
    } = options;

    const dataPoints = [];
    let currentTime = startTime;
    let baseTemp = 22;
    let baseHumidity = 45;

    while (currentTime <= endTime) {
      let temperature = baseTemp + faker.number.float({ min: -2, max: 2, fractionDigits: 1 });
      let humidity = baseHumidity + faker.number.float({ min: -10, max: 10, fractionDigits: 1 });

      // Add anomalies occasionally
      if (includeAnomalies && faker.datatype.boolean({ probability: 0.05 })) {
        temperature += faker.helpers.arrayElement([-10, 10]); // Temperature spike/drop
        humidity += faker.helpers.arrayElement([-20, 20]); // Humidity spike/drop
      }

      dataPoints.push(this.createSensorData({
        deviceId,
        temperature,
        humidity,
        timestamp: currentTime,
        batteryLevel: Math.max(10, 100 - Math.floor((currentTime - startTime) / (1000 * 60 * 60 * 24))), // 1% per day
      }));

      currentTime += intervalMs;

      // Gradual drift in base values
      baseTemp += faker.number.float({ min: -0.1, max: 0.1, fractionDigits: 2 });
      baseHumidity += faker.number.float({ min: -0.5, max: 0.5, fractionDigits: 2 });
    }

    return dataPoints;
  }

  /**
   * Create test data for stress testing
   */
  static createStressTestData(options: {
    userCount: number;
    devicesPerUser: number;
    dataPointsPerDevice: number;
  }) {
    const { userCount, devicesPerUser, dataPointsPerDevice } = options;

    const users = Array.from({ length: userCount }, () => this.createUser());

    const allData = users.map(user => {
      const devices = Array.from({ length: devicesPerUser }, () =>
        this.createDevice({ userId: user.id })
      );

      const sensorData = devices.flatMap(device =>
        Array.from({ length: dataPointsPerDevice }, () =>
          this.createSensorData({ deviceId: device.id })
        )
      );

      return { user, devices, sensorData };
    });

    return allData;
  }

  /**
   * Create mock API responses
   */
  static createMockAPIResponse(data: any, options: {
    success?: boolean;
    statusCode?: number;
    message?: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
    };
  } = {}) {
    const {
      success = true,
      statusCode = 200,
      message = success ? 'Success' : 'Error',
      pagination
    } = options;

    return {
      success,
      statusCode,
      message,
      data: success ? data : null,
      error: success ? null : { message, code: statusCode },
      timestamp: new Date().toISOString(),
      ...(pagination && { pagination })
    };
  }

  /**
   * Reset faker seed for consistent test data
   */
  static seedRandom(seed: number = 12345) {
    faker.seed(seed);
  }

  /**
   * Generate unique test identifiers
   */
  static generateTestId(prefix: string = 'test'): string {
    return `${prefix}_${Date.now()}_${faker.string.alphanumeric(8)}`;
  }
}

// Export commonly used factory methods as standalone functions
export const createTestUser = TestDataFactory.createUser;
export const createTestDevice = TestDataFactory.createDevice;
export const createTestSensorData = TestDataFactory.createSensorData;
export const createTestBLEDevice = TestDataFactory.createBLEDevice;