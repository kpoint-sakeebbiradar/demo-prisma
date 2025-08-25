import { NextResponse } from "next/server";
import * as fs from "fs";
import * as yaml from "js-yaml";
import path from "path";

type PropertyConfig = {
    property_key: string;
    property_values: string[];
};

export async function GET() {
    try {
        // Path to YAML file
        const filePath = path.join(process.cwd(), "src/app/api/config/tableData.yaml");

        // Read YAML
        const fileContent = fs.readFileSync(filePath, "utf8");
        const data = yaml.load(fileContent) as { properties: PropertyConfig[] };

        return NextResponse.json({ success: true, data });
    } catch (error: unknown) {
        console.error("Error reading config:", error);
        return NextResponse.json(
            { success: false, message: "Failed to load config" },
            { status: 500 }
        );
    }
}
