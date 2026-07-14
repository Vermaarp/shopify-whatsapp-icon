import { json, type LoaderFunctionArgs } from "@remix-run/node";
import prisma from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  if (!shop) {
    return json({ error: "Shop parameter is required" }, { status: 400 });
  }

  try {
    const settings = await prisma.whatsAppSettings.findUnique({
      where: { shop },
    });

    if (!settings) {
      return json({ error: "Settings not found for this shop" }, { status: 404 });
    }

    return json(
      { settings },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching settings:", error);
    return json({ error: "Internal Server Error" }, { status: 500 });
  }
};
