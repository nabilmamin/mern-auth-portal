import { render, screen } from '@testing-library/react';
import App from './App';

// Build unit tests for the App component

// This is a basic test to check if the App component renders without crashing
// The test checks if the "learn react" link is present in the component
// If the link is present, the test passes
test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
