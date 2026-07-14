import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  BlockStack,
  InlineGrid,
  Button,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const shop = session.shop;

  const settings = await prisma.whatsAppSettings.findUnique({
    where: { shop },
  });

  const analytics = await prisma.analytics.findMany({
    where: { shop },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const totalClicks = analytics.length;
  // In a real app we'd aggregate today, week, month, etc.
  
  return { settings, totalClicks, recentActivity: analytics.slice(0, 5) };
};

export default function Index() {
  const { settings, totalClicks, recentActivity } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <Page title="WhatsApp Chat Dashboard">
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Welcome to WhatsApp Chat Button!
                </Text>
                <Text as="p" variant="bodyMd">
                  Your floating WhatsApp button is currently {settings?.isActive ? "Active" : "Inactive"}.
                </Text>
                <div>
                  <Button variant="primary" onClick={() => navigate("/app/settings")}>
                    Configure Settings
                  </Button>
                </div>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section>
            <InlineGrid gap="400" columns={3}>
              <Card>
                <BlockStack gap="200">
                  <Text as="h3" variant="headingSm">Total Clicks</Text>
                  <Text as="p" variant="headingLg">{totalClicks}</Text>
                </BlockStack>
              </Card>
              <Card>
                <BlockStack gap="200">
                  <Text as="h3" variant="headingSm">Today's Clicks</Text>
                  <Text as="p" variant="headingLg">0</Text>
                </BlockStack>
              </Card>
              <Card>
                <BlockStack gap="200">
                  <Text as="h3" variant="headingSm">Conversion Rate</Text>
                  <Text as="p" variant="headingLg">-</Text>
                </BlockStack>
              </Card>
            </InlineGrid>
          </Layout.Section>
          
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h3" variant="headingMd">Recent Activity</Text>
                {recentActivity.length > 0 ? (
                  recentActivity.map((a) => (
                    <Text key={a.id} as="p" variant="bodyMd">
                      Click from {a.page || "Unknown"} on {new Date(a.createdAt).toLocaleString()}
                    </Text>
                  ))
                ) : (
                  <Text as="p" variant="bodyMd" tone="subdued">
                    No clicks recorded yet.
                  </Text>
                )}
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
