import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders home page heading", () => {
  render(<App />);
  const heading = screen.getByText(/Student Course Registration System/i);
  expect(heading).toBeInTheDocument();
});
