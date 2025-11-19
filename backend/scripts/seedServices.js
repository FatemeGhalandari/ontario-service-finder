const prisma = require("../lib/prisma");

async function main() {
  console.log("Seeding services...");

  // Clear existing data (dev only)
  await prisma.service.deleteMany();

  const services = [
    {
      name: "Downtown Community Health Centre",
      address: "123 Queen St W",
      city: "Toronto",
      category: "Health",
      phone: "416-555-1001",
      website: "https://example-health-toronto.ca",
      postalCode: "M5H 2M9",
    },
    {
      name: "Parkdale Community Legal Clinic",
      address: "220 Cowan Ave",
      city: "Toronto",
      category: "Legal",
      phone: "416-555-2002",
      website: "https://example-legal-parkdale.ca",
      postalCode: "M6K 2N6",
    },
    {
      name: "Eastside Food Bank",
      address: "45 Main St",
      city: "Hamilton",
      category: "Food Bank",
      phone: "905-555-3003",
      website: "",
      postalCode: "L8H 1A1",
    },
    {
      name: "Ottawa Community Housing Resource Centre",
      address: "750 Somerset St W",
      city: "Ottawa",
      category: "Housing",
      phone: "613-555-4004",
      website: "ottawa-housing-example.ca",
      postalCode: "K1R 6P9",
    },
    {
      name: "North York Youth Employment Hub",
      address: "10 Finch Ave W",
      city: "Toronto",
      category: "Employment",
      phone: "416-555-5005",
      website: "",
      postalCode: "M2N 6L9",
    },
    {
      name: "Scarborough Women's Shelter",
      address: "Confidential Location",
      city: "Toronto",
      category: "Shelter",
      phone: "416-555-6006",
      website: "",
      postalCode: "M1P 4X1",
    },
    {
      name: "Waterloo Newcomer Settlement Centre",
      address: "55 King St S",
      city: "Waterloo",
      category: "Settlement",
      phone: "519-555-7007",
      website: "https://waterloo-newcomers-example.ca",
      postalCode: "N2J 1P2",
    },
    {
      name: "Mississauga Seniors Recreation Centre",
      address: "100 Lakeshore Rd W",
      city: "Mississauga",
      category: "Seniors",
      phone: "905-555-8008",
      website: "",
      postalCode: "L5H 1G3",
    },
    {
      name: "Downtown Toronto Public Library Branch",
      address: "789 Yonge St",
      city: "Toronto",
      category: "Library",
      phone: "416-555-9009",
      website: "torontopubliclibrary.ca",
      postalCode: "M4W 2G8",
    },
    {
      name: "Kingston Mental Health Support Centre",
      address: "300 Princess St",
      city: "Kingston",
      category: "Mental Health",
      phone: "613-555-1010",
      website: "",
      postalCode: "K7L 1B4",
    },
  ];

  await prisma.service.createMany({
    data: services,
  });

  console.log(`Inserted ${services.length} services.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
