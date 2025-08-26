import {GET as getCampaigns, POST as createCampaign} from "@/app/api/backend/vendor-campaigns/route";
import {GET as getCampaignById} from "@/app/api/backend/vendor-campaigns/[id]/route";
import {prisma} from "@/lib/prisma";
import { PATCH as patchCampaign } from "@/app/api/backend/vendor-campaigns/[id]/route";
import {Prisma} from "@/generated/prisma";

jest.mock("@/lib/prisma", () => ({
    prisma: {
        vendorCampaigns: {
            findMany: jest.fn(),
            create: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
        },
    },
}));

describe("Vendor Campaigns API", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    // --------- GET /vendor-campaigns ---------
    it("should return list of vendor campaigns", async () => {
        (prisma.vendorCampaigns.findMany as jest.Mock).mockResolvedValue([
            {
                id: "campaign-uuid",
                name: "Diwali Campaign",
                vendorId: "vendor-uuid",
                templateCampaignId: "template-id",
                templateCampaignDetails: {},
                status: "Draft",
                vendor: {
                    id: "vendor-uuid",
                    name: "Vendor A",
                    vendorName: "VA Inc.",
                },
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);

        const response = await getCampaigns();
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json.success).toBe(true);
        expect(json.campaigns).toHaveLength(1);
        expect(prisma.vendorCampaigns.findMany).toHaveBeenCalled();
    });

    // --------- POST /vendor-campaigns ---------
    it("should create a new vendor campaign", async () => {
        const mockCampaign = {
            id: "new-campaign-uuid",
        };

        (prisma.vendorCampaigns.create as jest.Mock).mockResolvedValue(mockCampaign);

        const req = new Request("http://localhost/api/backend/vendor-campaigns", {
            method: "POST",
            body: JSON.stringify({
                name: "New Vendor Campaign",
                vendorId: "d0f1c73c-a572-48a6-b6d9-1fb0a6e801b7",
                templateCampaignId: "test1",
                templateCampaignDetails: {
                    success: true,
                    data: {
                        properties: [
                            {
                                campaignTemplates: [
                                    {id: 1, name: "Template A"},
                                    {id: 2, name: "Template B"},
                                ],
                            },
                        ],
                    },
                },
                status: "Draft",
            }),
        });

        const response = await createCampaign(req);
        const json = await response.json();

        expect(response.status).toBe(201);
        expect(json.success).toBe(true);
        expect(json.campaignId).toBe("new-campaign-uuid");
        expect(prisma.vendorCampaigns.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    vendorId: "d0f1c73c-a572-48a6-b6d9-1fb0a6e801b7",
                    templateCampaignId: "test1",
                    name: "New Vendor Campaign",
                }),
            })
        );
    });

    // --------- GET /vendor-campaigns/[id] ---------
    it("should fetch vendor campaign by ID", async () => {
        const campaignId = "e09eb861-f0ce-410a-93fc-19340443cd37";

        (prisma.vendorCampaigns.findUnique as jest.Mock).mockResolvedValue({
            id: campaignId,
            name: "Test Campaign",
            vendorId: "vendor-uuid",
            templateCampaignId: "template-1",
            templateCampaignDetails: {},
            status: "Draft",
            vendor: {
                id: "vendor-uuid",
                name: "Vendor A",
                vendorName: "VA Inc.",
            },
        });

        const response = await getCampaignById({} as Request, {params: {id: campaignId}});
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json.success).toBe(true);
        expect(json.vendorCampaign.id).toBe(campaignId);
        expect(prisma.vendorCampaigns.findUnique).toHaveBeenCalledWith({
            where: {id: campaignId},
            include: {
                vendor: {
                    select: {
                        id: true,
                        name: true,
                        vendorName: true,
                    },
                },
            },
        });
    });

    // --------- GET /vendor-campaigns/[id]: not found ---------
    it("should return 404 if vendor campaign not found", async () => {
        (prisma.vendorCampaigns.findUnique as jest.Mock).mockResolvedValue(null);

        const response = await getCampaignById({} as Request, {params: {id: "non-existent-id"}});
        const json = await response.json();

        expect(response.status).toBe(404);
        expect(json.success).toBe(false);
        expect(json.message).toBe("Vendor Campaign not found");
    });

    // --------- POST /vendor-campaigns: invalid input ---------
    it("should return 400 on invalid input", async () => {
        const req = new Request("http://localhost/api/backend/vendor-campaigns", {
            method: "POST",
            body: JSON.stringify({
                vendorId: "not-a-uuid",
                templateCampaignId: 123,
            }),
        });

        const response = await createCampaign(req);
        const json = await response.json();

        expect(response.status).toBe(400);
        expect(json.success).toBe(false);
        expect(json.errors).toBeDefined();
    });
});


// --------- PATCH /vendor-campaigns/[id] ---------
describe("PATCH /vendor-campaigns/:id", () => {
    const campaignId = "e09eb861-f0ce-410a-93fc-19340443cd37";

    it("should successfully update vendor campaign", async () => {
        (prisma.vendorCampaigns.update as jest.Mock).mockResolvedValue({
            id: campaignId,
            name: "New Vendor Campaign",
            status: "Draft",
            vendor: {
                id: "d0f1c73c-a572-48a6-b6d9-1fb0a6e801b7",
                name: "Sakeeb Biradra",
                vendorName: "Vijaya Sales Baner",
            },
        });

        const req = new Request(`http://localhost/api/backend/vendor-campaigns/${campaignId}`, {
            method: "PATCH",
            body: JSON.stringify({
                name: "New Vendor Campaign",
                status: "Draft",
                templateCampaignDetails: {
                    data: {
                        properties: [
                            {
                                campaignTemplates: [
                                    {id: 1, name: "Mrunal Diwali Campaign"},
                                    {id: 2, name: "Rajkumar Rao Diwali Campaign"},
                                    {id: 3, name: "Sreeleela Diwali Campaign"},
                                ],
                            },
                        ],
                    },
                    success: true,
                },
            }),
        });

        const response = await patchCampaign(req, {params: {id: campaignId}});
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json.success).toBe(true);
        expect(prisma.vendorCampaigns.update).toHaveBeenCalledWith({
            where: {id: campaignId},
            data: {
                name: "New Vendor Campaign",
                status: "Draft",
                templateCampaignDetails: expect.any(Object),
            },
            include: {
                vendor: {
                    select: {
                        id: true,
                        name: true,
                        vendorName: true,
                    },
                },
            },
        });
    });

    it("should return 400 if no fields to update", async () => {
        const req = new Request(`http://localhost/api/backend/vendor-campaigns/${campaignId}`, {
            method: "PATCH",
            body: JSON.stringify({}),
        });

        const response = await patchCampaign(req, {params: {id: campaignId}});
        const json = await response.json();

        expect(response.status).toBe(400);
        expect(json.success).toBe(false);
        expect(json.message).toBe("No fields to update");
    });

    it("should return 400 on invalid input", async () => {
        const req = new Request(`http://localhost/api/backend/vendor-campaigns/${campaignId}`, {
            method: "PATCH",
            body: JSON.stringify({
                status: "InvalidStatus", // Not part of the enum
            }),
        });

        const response = await patchCampaign(req, {params: {id: campaignId}});
        const json = await response.json();

        expect(response.status).toBe(400);
        expect(json.success).toBe(false);
        expect(json.errors).toBeDefined();
    });

    it("should return 404 if vendor campaign not found", async () => {
        const prismaError = { code: "P2025" }; // Mock with only the needed property

        (prisma.vendorCampaigns.update as jest.Mock).mockRejectedValue(prismaError);

        const req = new Request(`http://localhost/api/backend/vendor-campaigns/${campaignId}`, {
            method: "PATCH",
            body: JSON.stringify({ name: "Updated Campaign" }),
        });

        const response = await patchCampaign(req, { params: { id: campaignId } });
        const json = await response.json();

        expect(response.status).toBe(404);
        expect(json.success).toBe(false);
        expect(json.message).toBe("Vendor Campaign not found");
    });


    it("should return 500 on internal server error", async () => {
        (prisma.vendorCampaigns.update as jest.Mock).mockRejectedValue(new Error("DB crashed"));

        const req = new Request(`http://localhost/api/backend/vendor-campaigns/${campaignId}`, {
            method: "PATCH",
            body: JSON.stringify({name: "Update Fail"}),
        });

        const response = await patchCampaign(req, {params: {id: campaignId}});
        const json = await response.json();

        expect(response.status).toBe(500);
        expect(json.success).toBe(false);
        expect(json.message).toBe("Internal Server Error");
    });
});
