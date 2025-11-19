const prisma = require("../lib/prisma");
const {
  serviceCreateSchema,
  serviceUpdateSchema,
  formatZodError,
  ZodError,
} = require("../validation/serviceSchemas");

async function listServices(req, res, next) {
  const { q, city, category, page = "1", pageSize = "10" } = req.query;

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

  const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
  const perPage = Math.min(Math.max(parseInt(pageSize, 10) || 10, 1), 100);
  const skip = (pageNumber - 1) * perPage;

  try {
    const [total, services] = await Promise.all([
      prisma.service.count({ where }),
      prisma.service.findMany({
        where,
        orderBy: { createdAt: "desc" },
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

    const newService = await prisma.service.create({
      data: {
        name: parsed.name,
        address: parsed.address,
        city: parsed.city,
        category: parsed.category || null,
        phone: parsed.phone || null,
        website: parsed.website || null,
        postalCode: parsed.postalCode || null,
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

module.exports = {
  listServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
};
