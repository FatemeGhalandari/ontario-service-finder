const prisma = require("../lib/prisma");
const {
  serviceCreateSchema,
  serviceUpdateSchema,
  formatZodError,
  ZodError,
} = require("../validation/serviceSchemas");

function buildServiceWhereClause({ q, city, category }) {
  const where = {};

  if (q && q.trim()) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { address: { contains: q, mode: "insensitive" } },
      { city: { contains: q, mode: "insensitive" } },
      { category: { contains: q, mode: "insensitive" } },
      { postalCode: { contains: q, mode: "insensitive" } },
    ];
  }

  if (city && city.trim()) {
    where.city = {
      equals: city.trim(),
      mode: "insensitive",
    };
  }

  if (category && category.trim()) {
    where.category = {
      equals: category.trim(),
      mode: "insensitive",
    };
  }

  return where;
}

function buildServiceOrderBy({ sortBy, sortDirection }) {
  const direction = sortDirection === "asc" ? "asc" : "desc";

  switch (sortBy) {
    case "name":
      return [{ name: direction }];
    case "city":
      return [{ city: direction }, { name: "asc" }];
    case "category":
      return [{ category: direction }, { name: "asc" }];
    case "createdAt":
    default:
      return [{ createdAt: direction }];
  }
}

function parseCoordinate(value, min, max, fieldName) {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  const num = Number(value);
  if (Number.isNaN(num)) {
    throw new Error(`Invalid ${fieldName}`);
  }
  if (num < min || num > max) {
    throw new Error(`Invalid ${fieldName}`);
  }
  return num;
}

async function listServices(req, res, next) {
  const {
    q,
    city,
    category,
    page = "1",
    pageSize = "10",
    sortBy = "createdAt",
    sortDirection = "desc",
  } = req.query;

  const where = buildServiceWhereClause({ q, city, category });
  const orderBy = buildServiceOrderBy({ sortBy, sortDirection });
  const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
  const perPage = Math.min(Math.max(parseInt(pageSize, 10) || 10, 1), 100);
  const skip = (pageNumber - 1) * perPage;

  try {
    const [total, services] = await Promise.all([
      prisma.service.count({ where }),
      prisma.service.findMany({
        where,
        orderBy,
        skip,
        take: perPage,
      }),
    ]);

    res.json({
      data: services,
      total,
      page: pageNumber,
      pageSize: perPage,
      totalPages: Math.ceil(total / perPage),
    });
  } catch (err) {
    console.error("Error fetching services", err);
    next(err);
  }
}

async function exportServices(req, res, next) {
  const {
    q,
    city,
    category,
    sortBy = "createdAt",
    sortDirection = "desc",
  } = req.query;
  const where = buildServiceWhereClause({ q, city, category });
  const orderBy = buildServiceOrderBy({ sortBy, sortDirection });

  try {
    const services = await prisma.service.findMany({
      where,
      orderBy,
    });

    const headers = [
      "id",
      "name",
      "address",
      "city",
      "category",
      "phone",
      "website",
      "postalCode",
      "latitude",
      "longitude",
      "createdAt",
      "updatedAt",
    ];

    function escapeCsv(value) {
      if (value === null || value === undefined) return "";
      const s = String(value);
      if (s.includes('"') || s.includes(",") || s.includes("\n")) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    }

    const rows = services.map((s) => [
      s.id,
      s.name,
      s.address,
      s.city,
      s.category || "",
      s.phone || "",
      s.website || "",
      s.postalCode || "",
      s.latitude ?? "",
      s.longitude ?? "",
      s.createdAt?.toISOString?.() || "",
      s.updatedAt?.toISOString?.() || "",
    ]);

    const csvLines = [
      headers.join(","),
      ...rows.map((row) => row.map(escapeCsv).join(",")),
    ];

    const csv = csvLines.join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="services.csv"');
    res.status(200).send(csv);
  } catch (err) {
    console.error("Error exporting services", err);
    next(err);
  }
}

async function getServiceById(req, res, next) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Invalid service id" });
  }

  try {
    const service = await prisma.service.findUnique({ where: { id } });
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }
    res.json(service);
  } catch (err) {
    console.error("Error fetching service", err);
    next(err);
  }
}

async function createService(req, res, next) {
  try {
    const parsed = serviceCreateSchema.parse(req.body);

    let latitude = null;
    let longitude = null;

    try {
      latitude = parseCoordinate(req.body.latitude, -90, 90, "latitude");
      longitude = parseCoordinate(req.body.longitude, -180, 180, "longitude");
    } catch (coordErr) {
      return res
        .status(400)
        .json({ error: coordErr.message || "Invalid coordinates" });
    }

    const newService = await prisma.service.create({
      data: {
        name: parsed.name,
        address: parsed.address,
        city: parsed.city,
        category: parsed.category || null,
        phone: parsed.phone || null,
        website: parsed.website || null,
        postalCode: parsed.postalCode || null,
        latitude,
        longitude,
      },
    });

    res.status(201).json(newService);
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        error: "Validation failed",
        details: formatZodError(err),
      });
    }
    console.error("Error creating service", err);
    next(err);
  }
}

async function updateService(req, res, next) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Invalid service id" });
  }

  try {
    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Service not found" });
    }

    const parsed = serviceUpdateSchema.parse(req.body);

    let latitude = existing.latitude;
    let longitude = existing.longitude;

    if ("latitude" in req.body) {
      try {
        latitude = parseCoordinate(req.body.latitude, -90, 90, "latitude");
      } catch (coordErr) {
        return res
          .status(400)
          .json({ error: coordErr.message || "Invalid latitude" });
      }
    }

    if ("longitude" in req.body) {
      try {
        longitude = parseCoordinate(req.body.longitude, -180, 180, "longitude");
      } catch (coordErr) {
        return res
          .status(400)
          .json({ error: coordErr.message || "Invalid longitude" });
      }
    }

    const updated = await prisma.service.update({
      where: { id },
      data: {
        name: parsed.name ?? existing.name,
        address: parsed.address ?? existing.address,
        city: parsed.city ?? existing.city,
        category:
          parsed.category !== undefined ? parsed.category : existing.category,
        phone: parsed.phone !== undefined ? parsed.phone : existing.phone,
        website:
          parsed.website !== undefined ? parsed.website : existing.website,
        postalCode:
          parsed.postalCode !== undefined
            ? parsed.postalCode
            : existing.postalCode,
        latitude,
        longitude,
      },
    });

    res.json(updated);
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        error: "Validation failed",
        details: formatZodError(err),
      });
    }
    console.error("Error updating service", err);
    next(err);
  }
}

async function deleteService(req, res, next) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Invalid service id" });
  }

  try {
    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Service not found" });
    }

    await prisma.service.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting service", err);
    next(err);
  }
}

async function getServiceStats(req, res, next) {
  try {
    const totalServices = await prisma.service.count();

    const byCityRaw = await prisma.service.groupBy({
      by: ["city"],
      _count: { _all: true },
      orderBy: { city: "asc" },
    });

    const byCategoryRaw = await prisma.service.groupBy({
      by: ["category"],
      _count: { _all: true },
      orderBy: { category: "asc" },
    });

    const byCity = byCityRaw.map((row) => ({
      city: row.city,
      count: row._count._all,
    }));

    const byCategory = byCategoryRaw.map((row) => ({
      category: row.category || "Uncategorized",
      count: row._count._all,
    }));

    res.json({
      totalServices,
      byCity,
      byCategory,
    });
  } catch (err) {
    console.error("Error getting service stats", err);
    next(err);
  }
}

module.exports = {
  listServices,
  exportServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getServiceStats,
};
