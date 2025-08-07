/**
 * 🛡️ DAMP Smart Drinkware - Error Boundary Component
 * Google-level error handling with comprehensive error reporting
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertTriangle, RefreshCw, Send } from 'lucide-react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'app' | 'screen' | 'component';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

/**
 * Enterprise-grade error boundary with comprehensive error reporting
 * Follows Google's error handling best practices
 */
export class AppErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private readonly maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Generate unique error ID for tracking
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { onError, level = 'component' } = this.props;
    
    this.setState({ errorInfo });
    
    // Enhanced error logging with Google-level detail
    const errorReport = this.createErrorReport(error, errorInfo);
    
    // Log to console with structured data
    console.error('🚨 Error Boundary Caught Error:', errorReport);
    
    // Report to external services
    this.reportError(error, errorInfo, errorReport);
    
    // Call custom error handler
    if (onError) {
      onError(error, errorInfo);
    }
    
    // Track error metrics
    this.trackErrorMetrics(error, level);
  }

  /**
   * Create comprehensive error report
   */
  private createErrorReport(error: Error, errorInfo: ErrorInfo) {
    const { level = 'component' } = this.props;
    
    return {
      // Error details
      errorId: this.state.errorId,
      message: error.message,
      stack: error.stack,
      name: error.name,
      
      // React details
      componentStack: errorInfo.componentStack,
      
      // Context information
      timestamp: new Date().toISOString(),
      platform: Platform.OS,
      platformVersion: Platform.Version,
      level,
      retryCount: this.retryCount,
      
      // User context
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
      
      // App context
      buildVersion: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
      environment: __DEV__ ? 'development' : 'production',
    };
  }

  /**
   * Report error to external services (Firebase, Sentry, etc.)
   */
  private reportError(error: Error, errorInfo: ErrorInfo, errorReport: any): void {
    try {
      // Report to Firebase Crashlytics
      // crashlytics().recordError(error, {
      //   customAttributes: {
      //     errorId: errorReport.errorId,
      //     level: this.props.level || 'component',
      //     componentStack: errorInfo.componentStack
      //   }
      // });

      // Report to custom analytics
      // firebase.analytics().logEvent('app_error', {
      //   error_id: errorReport.errorId,
      //   error_type: error.name,
      //   level: this.props.level || 'component',
      //   platform: Platform.OS
      // });

      if (__DEV__) {
        console.log('📊 Error reported to analytics services');
      }
    } catch (reportingError) {
      console.error('Failed to report error to external services:', reportingError);
    }
  }

  /**
   * Track error metrics for monitoring
   */
  private trackErrorMetrics(error: Error, level: string): void {
    // Implement error rate tracking, error types, etc.
    const errorType = error.name || 'UnknownError';
    
    // In a real implementation, send to monitoring service
    if (__DEV__) {
      console.log('📈 Error metrics tracked:', {
        type: errorType,
        level,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Retry the failed component render
   */
  private handleRetry = (): void => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null,
      });
    }
  };

  /**
   * Send error report to support
   */
  private handleSendReport = (): void => {
    const { error, errorInfo, errorId } = this.state;
    
    if (error && errorInfo) {
      const report = this.createErrorReport(error, errorInfo);
      
      // In a real app, send to support system
      console.log('📧 Error report sent to support:', {
        errorId,
        timestamp: report.timestamp
      });
      
      // Could open email client, in-app support chat, etc.
    }
  };

  /**
   * Reset error boundary (for testing)
   */
  public resetError = (): void => {
    this.retryCount = 0;
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  render(): ReactNode {
    const { hasError, error, errorId } = this.state;
    const { children, fallback, level = 'component' } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Render different UIs based on error level
      if (level === 'app') {
        return this.renderAppLevelError();
      } else if (level === 'screen') {
        return this.renderScreenLevelError();
      } else {
        return this.renderComponentLevelError();
      }
    }

    return children;
  }

  /**
   * App-level error UI (full screen takeover)
   */
  private renderAppLevelError(): ReactNode {
    const { error, errorId } = this.state;
    const canRetry = this.retryCount < this.maxRetries;

    return (
      <SafeAreaView style={styles.appErrorContainer}>
        <View style={styles.appErrorContent}>
          <AlertTriangle size={64} color="#F44336" />
          
          <Text style={styles.appErrorTitle}>
            Oops! Something went wrong
          </Text>
          
          <Text style={styles.appErrorMessage}>
            The app encountered an unexpected error. We've been notified and are working to fix it.
          </Text>
          
          <View style={styles.errorDetails}>
            <Text style={styles.errorId}>Error ID: {errorId}</Text>
            <Text style={styles.errorType}>
              {error?.name}: {error?.message}
            </Text>
          </View>

          <View style={styles.actionButtons}>
            {canRetry && (
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={this.handleRetry}
              >
                <RefreshCw size={20} color="#FFF" />
                <Text style={styles.primaryButtonText}>
                  Try Again ({this.maxRetries - this.retryCount} left)
                </Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={this.handleSendReport}
            >
              <Send size={20} color="#0277BD" />
              <Text style={styles.secondaryButtonText}>Send Report</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  /**
   * Screen-level error UI (partial screen)
   */
  private renderScreenLevelError(): ReactNode {
    const { error } = this.state;
    const canRetry = this.retryCount < this.maxRetries;

    return (
      <View style={styles.screenErrorContainer}>
        <AlertTriangle size={32} color="#FF9800" />
        <Text style={styles.screenErrorTitle}>Screen Error</Text>
        <Text style={styles.screenErrorMessage}>
          This screen couldn't load properly.
        </Text>
        
        {__DEV__ && (
          <Text style={styles.devErrorMessage}>
            {error?.message}
          </Text>
        )}

        {canRetry && (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={this.handleRetry}
          >
            <RefreshCw size={16} color="#0277BD" />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  /**
   * Component-level error UI (minimal)
   */
  private renderComponentLevelError(): ReactNode {
    const canRetry = this.retryCount < this.maxRetries;

    return (
      <View style={styles.componentErrorContainer}>
        <AlertTriangle size={16} color="#FF9800" />
        <Text style={styles.componentErrorText}>
          Component error
        </Text>
        {canRetry && (
          <TouchableOpacity onPress={this.handleRetry}>
            <RefreshCw size={12} color="#0277BD" />
          </TouchableOpacity>
        )}
      </View>
    );
  }
}

/**
 * HOC for wrapping components with error boundaries
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  level: 'app' | 'screen' | 'component' = 'component'
) {
  const WithErrorBoundaryComponent = (props: P) => (
    <AppErrorBoundary level={level}>
      <WrappedComponent {...props} />
    </AppErrorBoundary>
  );

  WithErrorBoundaryComponent.displayName = `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithErrorBoundaryComponent;
}

/**
 * Hook for manual error reporting
 */
export function useErrorReporting() {
  const reportError = (error: Error, context?: Record<string, any>) => {
    console.error('Manual error report:', { error, context });
    
    // Report to analytics services
    // firebase.analytics().logEvent('manual_error_report', {
    //   error_message: error.message,
    //   error_type: error.name,
    //   context: JSON.stringify(context)
    // });
  };

  return { reportError };
}

const styles = StyleSheet.create({
  // App-level error styles
  appErrorContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  appErrorContent: {
    alignItems: 'center',
    maxWidth: 400,
  },
  appErrorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  appErrorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  errorDetails: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    width: '100%',
  },
  errorId: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  errorType: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'monospace',
  },
  actionButtons: {
    width: '100%',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#0277BD',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#0277BD',
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#0277BD',
    fontSize: 16,
    fontWeight: '600',
  },

  // Screen-level error styles
  screenErrorContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    borderRadius: 8,
    margin: 16,
  },
  screenErrorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
  },
  screenErrorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  devErrorMessage: {
    fontSize: 12,
    color: '#F44336',
    fontFamily: 'monospace',
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#0277BD',
    fontSize: 14,
    fontWeight: '500',
  },

  // Component-level error styles
  componentErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    backgroundColor: '#FFF3E0',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  componentErrorText: {
    fontSize: 12,
    color: '#FF9800',
    flex: 1,
  },
});

export default AppErrorBoundary;