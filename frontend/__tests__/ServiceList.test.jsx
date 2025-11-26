import { render, screen } from "@testing-library/react";
import ServiceList from "../src/components/ServiceList";

function makeService(overrides = {}) {
  return {
    id: 1,
    name: "Test Health Centre",
    address: "100 Test St",
    city: "Toronto",
    category: "Health",
    phone: "416-555-0000",
    website: "test.example.com",
    postalCode: "M5V 2T6",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    latitude: 43.65,
    longitude: -79.38,
    ...overrides,
  };
}

describe("ServiceList", () => {
  test("shows empty state when no services", () => {
    render(<ServiceList services={[]} />);

    expect(
      screen.getByText(/No services found for the current filters/i)
    ).toBeInTheDocument();
  });

  test("renders service rows when services are provided", () => {
    const services = [
      makeService({ id: 1, name: "Alpha Clinic" }),
      makeService({ id: 2, name: "Beta Food Bank", category: "Food Bank" }),
    ];

    render(
      <ServiceList
        services={services}
        onView={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
        isAdmin={true}
      />
    );

    // Heading row
    expect(screen.getByText(/Name/i)).toBeInTheDocument();

    // Data rows
    expect(screen.getByText("Alpha Clinic")).toBeInTheDocument();
    expect(screen.getByText("Beta Food Bank")).toBeInTheDocument();

    // Admin actions
    expect(screen.getAllByText(/Edit/i).length).toBe(2);
    expect(screen.getAllByText(/Delete/i).length).toBe(2);
  });
});
