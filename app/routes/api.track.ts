import { json, type ActionFunctionArgs } from "@remix-run/node";
import prisma from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await request.json();
    const { url, productTitle, shop } = body;

    if (!shop) {
      return json({ error: "Shop is required" }, { status: 400 });
    }

    await prisma.analytics.create({
      data: {
        shop,
        page: url,
        product: productTitle,
        // device, country, referrer could be added here parsing request headers
      },
    });

    return json(
      { success: true },
      {
        headers: {
          "Access-Control-Allow-Origin": "*", // Allow storefront to hit this API
        },
      }
    );
  } catch (error) {
    console.error("Error tracking analytics:", error);
    return json({ error: "Internal Server Error" }, { status: 500 });
  }
};

// Handle OPTIONS for CORS
export const loader = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
};
