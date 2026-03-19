const prisma = require("../lib/prisma");

async function main() {
  console.log("Checking services table...");

  const existingCount = await prisma.service.count();

  if (existingCount > 0) {
    console.log(
      `Seed skipped. Database already has ${existingCount} services.`,
    );
    return;
  }

  const services = [
    {
      name: "Downtown Community Health Centre",
      address: "123 Queen St W",
      city: "Toronto",
      category: "Health",
      phone: "416-555-1001",
      website: "https://example.org/downtown-health",
      postalCode: "M5H 2M9",
      latitude: 43.6532,
      longitude: -79.3832,
    },
    {
      name: "Parkdale Community Legal Clinic",
      address: "220 Cowan Ave",
      city: "Toronto",
      category: "Legal",
      phone: "416-555-2002",
      website: "https://example.org/parkdale-legal",
      postalCode: "M6K 2N6",
      latitude: 43.6395,
      longitude: -79.4376,
    },
    {
      name: "Harbourfront Mental Wellness Clinic",
      address: "250 Queens Quay W",
      city: "Toronto",
      category: "Mental Health",
      phone: "416-555-3003",
      website: "https://example.org/harbourfront-wellness",
      postalCode: "M5J 2N5",
      latitude: 43.6396,
      longitude: -79.3803,
    },
    {
      name: "North York Employment Resource Hub",
      address: "5000 Yonge St",
      city: "Toronto",
      category: "Employment",
      phone: "416-555-4004",
      website: "https://example.org/northyork-employment",
      postalCode: "M2N 7E9",
      latitude: 43.768,
      longitude: -79.412,
    },
    {
      name: "Ottawa Housing Help Centre",
      address: "120 Slater St",
      city: "Ottawa",
      category: "Housing",
      phone: "613-555-5005",
      website: "https://example.org/ottawa-housing",
      postalCode: "K1P 5H2",
      latitude: 45.4215,
      longitude: -75.6972,
    },
    {
      name: "Rideau Mental Health Walk-in Clinic",
      address: "75 Rideau St",
      city: "Ottawa",
      category: "Mental Health",
      phone: "613-555-6006",
      website: "https://example.org/rideau-mental-health",
      postalCode: "K1N 5W4",
      latitude: 45.427,
      longitude: -75.69,
    },
    {
      name: "Hamilton Community Food Share",
      address: "15 Barton St E",
      city: "Hamilton",
      category: "Food Bank",
      phone: "905-555-7007",
      website: "https://example.org/hamilton-food-share",
      postalCode: "L8L 2V6",
      latitude: 43.2557,
      longitude: -79.8711,
    },
    {
      name: "Mountainview Family Shelter",
      address: "40 Upper James St",
      city: "Hamilton",
      category: "Shelter",
      phone: "905-555-8008",
      website: "https://example.org/mountainview-shelter",
      postalCode: "L9C 1X2",
      latitude: 43.243,
      longitude: -79.884,
    },
    {
      name: "Peel Community Employment Services",
      address: "151 City Centre Dr",
      city: "Mississauga",
      category: "Employment",
      phone: "905-555-9009",
      website: "https://example.org/peel-employment",
      postalCode: "L5B 1M7",
      latitude: 43.589,
      longitude: -79.6441,
    },
    {
      name: "Waterloo Region Settlement Services",
      address: "150 Frederick St",
      city: "Kitchener",
      category: "Settlement",
      phone: "519-555-1010",
      website: "https://example.org/waterloo-settlement",
      postalCode: "N2H 2M2",
      latitude: 43.4503,
      longitude: -80.486,
    },
    {
      name: "Downtown Guelph Community Centre",
      address: "20 Carden St",
      city: "Guelph",
      category: "Community Centre",
      phone: "519-555-1111",
      website: "https://example.org/guelph-community",
      postalCode: "N1H 3A2",
      latitude: 43.5448,
      longitude: -80.2482,
    },
    {
      name: "Thunder Bay Community Health and Wellness",
      address: "200 Red River Rd",
      city: "Thunder Bay",
      category: "Health",
      phone: "807-555-1212",
      website: "https://example.org/thunderbay-health",
      postalCode: "P7B 1A4",
      latitude: 48.4333,
      longitude: -89.22,
    },
  ];

  await prisma.service.createMany({
    data: services,
  });

  console.log(`Inserted ${services.length} services.`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
