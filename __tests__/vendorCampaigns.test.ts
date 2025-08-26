import { GET as getVendors, POST as createVendor } from "@/app/api/backend/vendors/route";
import { GET as getVendorById, PATCH as patchVendor } from "@/app/api/backend/vendors/[id]/route";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
    prisma: {
        vendors: {
            findMany: jest.fn(),
            create: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
        },
    },
}));

jest.mock("bcrypt", () => ({
    hash: jest.fn().mockResolvedValue("hashed"),
}));

describe("Vendors API", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    // --------- GET /vendors ---------
    it("should return list of vendors", async () => {
        (prisma.vendors.findMany as jest.Mock).mockResolvedValue([
            {
                id: "uuid",
                name: "Test Vendor",
                vendorName: "TV Inc.",
                email: "vendor@example.com",
                address: "123 Street",
                googleMapLink: null,
                domain: "tv.com",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);

        const response = await getVendors();
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json.success).toBe(true);
        expect(json.vendors).toHaveLength(1);
        expect(prisma.vendors.findMany).toHaveBeenCalled();
    });

    // --------- POST /vendors ---------
    it("should create a new vendor with hashed fields", async () => {
        const mockVendor = {
            id: "uuid",
            name: "New Vendor",
            vendorName: "NV Inc.",
            email: "new@example.com",
            address: "New Address",
            googleMapLink: null,
            domain: "nv.com",
        };

        (prisma.vendors.create as jest.Mock).mockResolvedValue(mockVendor);

        const req = new Request("http://localhost/api/backend/vendors", {
            method: "POST",
            body: JSON.stringify({
                name: "New Vendor",
                mobile: "1234567890",
                password: "secret123",
                vendorName: "NV Inc.",
                email: "new@example.com",
                address: "New Address",
                domain: "nv.com",
            }),
        });

        const response = await createVendor(req);
        const json = await response.json();

        expect(response.status).toBe(201);
        expect(json.success).toBe(true);
        expect(prisma.vendors.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    mobile: "hashed",
                    password: "hashed",
                }),
            })
        );
    });

    // --------- GET /vendors/[id] ---------
    it("should fetch vendor by ID", async () => {
        const vendorId = "uuid";
        (prisma.vendors.findUnique as jest.Mock).mockResolvedValue({
            id: vendorId,
            name: "Vendor A",
            vendorName: "VA Co",
            email: "va@example.com",
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        const response = await getVendorById({} as Request, { params: { id: vendorId } });
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json.success).toBe(true);
        expect(prisma.vendors.findUnique).toHaveBeenCalledWith({
            where: { id: vendorId },
            select: expect.any(Object),
        });
    });

    // --------- PATCH /vendors/[id] ---------
    it("should update a vendor", async () => {
        const vendorId = "uuid";
        (prisma.vendors.update as jest.Mock).mockResolvedValue({
            id: vendorId,
            name: "Updated Name",
            vendorName: "UV Inc.",
            email: "uv@example.com",
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        const req = new Request(`http://localhost/api/backend/vendors/${vendorId}`, {
            method: "PATCH",
            body: JSON.stringify({
                name: "Updated Name",
                password: "newpass123",
            }),
        });

        const response = await patchVendor(req, { params: { id: vendorId } });
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json.success).toBe(true);
        expect(prisma.vendors.update).toHaveBeenCalledWith({
            where: { id: vendorId },
            data: expect.objectContaining({
                name: "Updated Name",
                password: "hashed",
            }),
            select: expect.any(Object),
        });
    });

    // --------- PATCH: No fields ---------
    it("should return 400 if no fields to update", async () => {
        const req = new Request("http://localhost/api/backend/vendors/id", {
            method: "PATCH",
            body: JSON.stringify({}),
        });

        const response = await patchVendor(req, { params: { id: "id" } });
        const json = await response.json();

        expect(response.status).toBe(400);
        expect(json.success).toBe(false);
        expect(json.message).toBe("No fields to update");
    });
});
