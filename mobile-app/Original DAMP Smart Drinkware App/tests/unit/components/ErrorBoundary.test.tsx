/**
 * 🧪 DAMP Smart Drinkware - Error Boundary Tests
 * Comprehensive unit tests for Google-level error handling
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Text, TouchableOpacity } from 'react-native';
import { AppErrorBoundary, withErrorBoundary, useErrorReporting } from '@/components/ErrorBoundary';

// Mock components for testing
const ThrowingComponent = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <Text testID="working-component">Component is working</Text>;
};

const TestComponent = () => <Text testID="test-component">Test Component</Text>;

describe('AppErrorBoundary', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('Error Catching', () => {
    test('should render children when no error occurs', () => {
      const { getByTestId } = render(
        <AppErrorBoundary>
          <ThrowingComponent shouldThrow={false} />
        </AppErrorBoundary>
      );

      expect(getByTestId('working-component')).toBeTruthy();
    });

    test('should catch and display error', () => {
      const { getByText, queryByTestId } = render(
        <AppErrorBoundary level="app">
          <ThrowingComponent shouldThrow={true} />
        </AppErrorBoundary>
      );

      expect(queryByTestId('working-component')).toBeNull();
      expect(getByText('Oops! Something went wrong')).toBeTruthy();
    });

    test('should call custom error handler', () => {
      const mockErrorHandler = jest.fn();

      render(
        <AppErrorBoundary onError={mockErrorHandler}>
          <ThrowingComponent shouldThrow={true} />
        </AppErrorBoundary>
      );

      expect(mockErrorHandler).toHaveBeenCalled();
      expect(mockErrorHandler).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String)
        })
      );
    });
  });

  describe('Error Levels', () => {
    test('should render app-level error UI', () => {
      const { getByText } = render(
        <AppErrorBoundary level="app">
          <ThrowingComponent shouldThrow={true} />
        </AppErrorBoundary>
      );

      expect(getByText('Oops! Something went wrong')).toBeTruthy();
      expect(getByText(/The app encountered an unexpected error/)).toBeTruthy();
    });

    test('should render screen-level error UI', () => {
      const { getByText } = render(
        <AppErrorBoundary level="screen">
          <ThrowingComponent shouldThrow={true} />
        </AppErrorBoundary>
      );

      expect(getByText('Screen Error')).toBeTruthy();
      expect(getByText(/This screen couldn't load properly/)).toBeTruthy();
    });

    test('should render component-level error UI', () => {
      const { getByText } = render(
        <AppErrorBoundary level="component">
          <ThrowingComponent shouldThrow={true} />
        </AppErrorBoundary>
      );

      expect(getByText('Component error')).toBeTruthy();
    });
  });

  describe('Retry Functionality', () => {
    test('should allow retry on app-level errors', async () => {
      let shouldThrow = true;
      
      const RetryTestComponent = () => {
        if (shouldThrow) {
          throw new Error('Retry test error');
        }
        return <Text testID="retry-success">Retry successful</Text>;
      };

      const { getByText, queryByTestId, rerender } = render(
        <AppErrorBoundary level="app">
          <RetryTestComponent />
        </AppErrorBoundary>
      );

      // Error should be displayed
      expect(getByText('Oops! Something went wrong')).toBeTruthy();

      // Fix the component
      shouldThrow = false;

      // Click retry button
      const retryButton = getByText(/Try Again/);
      fireEvent.press(retryButton);

      // Component should work after retry
      await waitFor(() => {
        expect(queryByTestId('retry-success')).toBeTruthy();
      });
    });

    test('should limit retry attempts', () => {
      const { getByText, queryByText } = render(
        <AppErrorBoundary level="app">
          <ThrowingComponent shouldThrow={true} />
        </AppErrorBoundary>
      );

      // Initial retry button should show (3 left)
      expect(getByText(/Try Again \(3 left\)/)).toBeTruthy();

      // Click retry 3 times
      const retryButton = getByText(/Try Again/);
      fireEvent.press(retryButton);
      fireEvent.press(getByText(/Try Again \(2 left\)/));
      fireEvent.press(getByText(/Try Again \(1 left\)/));

      // Retry button should no longer be available
      expect(queryByText(/Try Again/)).toBeNull();
    });
  });

  describe('Error Reporting', () => {
    test('should generate comprehensive error reports', () => {
      render(
        <AppErrorBoundary level="component">
          <ThrowingComponent shouldThrow={true} />
        </AppErrorBoundary>
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        '🚨 Error Boundary Caught Error:',
        expect.objectContaining({
          errorId: expect.any(String),
          message: 'Test error message',
          level: 'component',
          timestamp: expect.any(String),
          platform: expect.any(String)
        })
      );
    });

    test('should send report functionality', () => {
      const { getByText } = render(
        <AppErrorBoundary level="app">
          <ThrowingComponent shouldThrow={true} />
        </AppErrorBoundary>
      );

      const sendReportButton = getByText('Send Report');
      fireEvent.press(sendReportButton);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('📧 Error report sent to support:')
      );
    });
  });

  describe('Custom Fallback', () => {
    test('should render custom fallback UI', () => {
      const CustomFallback = <Text testID="custom-fallback">Custom Error UI</Text>;

      const { getByTestId } = render(
        <AppErrorBoundary fallback={CustomFallback}>
          <ThrowingComponent shouldThrow={true} />
        </AppErrorBoundary>
      );

      expect(getByTestId('custom-fallback')).toBeTruthy();
    });
  });

  describe('Error Reset', () => {
    test('should reset error state', () => {
      let boundaryRef: AppErrorBoundary | null = null;

      const { getByText, getByTestId, rerender } = render(
        <AppErrorBoundary
          ref={(ref) => { boundaryRef = ref; }}
          level="app"
        >
          <ThrowingComponent shouldThrow={true} />
        </AppErrorBoundary>
      );

      // Error should be displayed
      expect(getByText('Oops! Something went wrong')).toBeTruthy();

      // Reset error
      boundaryRef?.resetError();

      // Re-render with working component
      rerender(
        <AppErrorBoundary
          ref={(ref) => { boundaryRef = ref; }}
          level="app"
        >
          <ThrowingComponent shouldThrow={false} />
        </AppErrorBoundary>
      );

      // Component should render normally
      expect(getByTestId('working-component')).toBeTruthy();
    });
  });
});

describe('withErrorBoundary HOC', () => {
  test('should wrap component with error boundary', () => {
    const WrappedComponent = withErrorBoundary(TestComponent, 'screen');

    const { getByTestId } = render(<WrappedComponent />);

    expect(getByTestId('test-component')).toBeTruthy();
  });

  test('should catch errors in wrapped component', () => {
    const WrappedThrowingComponent = withErrorBoundary(
      () => <ThrowingComponent shouldThrow={true} />,
      'screen'
    );

    const { getByText } = render(<WrappedThrowingComponent />);

    expect(getByText('Screen Error')).toBeTruthy();
  });

  test('should have correct display name', () => {
    const WrappedComponent = withErrorBoundary(TestComponent, 'component');

    expect(WrappedComponent.displayName).toBe('withErrorBoundary(TestComponent)');
  });
});

describe('useErrorReporting Hook', () => {
  const TestHookComponent = () => {
    const { reportError } = useErrorReporting();

    const handleClick = () => {
      reportError(new Error('Manual error'), { context: 'test-button' });
    };

    return (
      <TouchableOpacity testID="report-error-button" onPress={handleClick}>
        <Text>Report Error</Text>
      </TouchableOpacity>
    );
  };

  test('should provide reportError function', () => {
    const { getByTestId } = render(<TestHookComponent />);
    const button = getByTestId('report-error-button');

    fireEvent.press(button);

    expect(consoleSpy).toHaveBeenCalledWith(
      'Manual error report:',
      expect.objectContaining({
        error: expect.any(Error),
        context: { context: 'test-button' }
      })
    );
  });
});

describe('Error Boundary Integration', () => {
  test('should work with multiple nested boundaries', () => {
    const NestedThrowingComponent = () => {
      throw new Error('Nested error');
    };

    const { getByText } = render(
      <AppErrorBoundary level="app">
        <AppErrorBoundary level="screen">
          <AppErrorBoundary level="component">
            <NestedThrowingComponent />
          </AppErrorBoundary>
        </AppErrorBoundary>
      </AppErrorBoundary>
    );

    // Inner-most boundary should catch the error
    expect(getByText('Component error')).toBeTruthy();
  });

  test('should handle async errors in effects', async () => {
    const AsyncErrorComponent = () => {
      React.useEffect(() => {
        // Simulate async error that can't be caught by error boundary
        setTimeout(() => {
          console.error('Async error occurred');
        }, 100);
      }, []);

      return <Text testID="async-component">Async Component</Text>;
    };

    const { getByTestId } = render(
      <AppErrorBoundary>
        <AsyncErrorComponent />
      </AppErrorBoundary>
    );

    // Component should render normally (error boundaries don't catch async errors)
    expect(getByTestId('async-component')).toBeTruthy();

    // Wait for async error
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Async error occurred');
    });
  });

  test('should track error metrics', () => {
    render(
      <AppErrorBoundary level="app">
        <ThrowingComponent shouldThrow={true} />
      </AppErrorBoundary>
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('📈 Error metrics tracked:')
    );
  });
});