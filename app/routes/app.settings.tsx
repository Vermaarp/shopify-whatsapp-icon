import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSubmit, useNavigation, useActionData } from "@remix-run/react";
import { useEffect, useState } from "react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  TextField,
  Button,
  Select,
  Checkbox,
  Text,
  RangeSlider,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  let settings = await prisma.whatsAppSettings.findUnique({
    where: { shop },
  });

  if (!settings) {
    settings = await prisma.whatsAppSettings.create({
      data: { shop },
    });
  }

  return json({ settings });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const formData = await request.formData();

  const updates = {
    phoneNumber: formData.get("phoneNumber")?.toString(),
    welcomeMessage: formData.get("welcomeMessage")?.toString(),
    buttonColor: formData.get("buttonColor")?.toString() || "#25D366",
    position: formData.get("position")?.toString() || "bottom-right",
    icon: formData.get("icon")?.toString() || "whatsapp",
    isActive: formData.get("isActive") === "true",
    animation: formData.get("animation")?.toString() || "pulse",
    buttonSize: formData.get("buttonSize")?.toString() || "medium",
    tooltipEnabled: formData.get("tooltipEnabled") === "true",
    shadow: formData.get("shadow")?.toString() || "medium",
    borderRadius: parseInt(formData.get("borderRadius")?.toString() || "50", 10),
    delaySeconds: parseInt(formData.get("delaySeconds")?.toString() || "0", 10),
    customCss: formData.get("customCss")?.toString() || "",
  };

  await prisma.whatsAppSettings.update({
    where: { shop },
    data: updates,
  });

  return json({ success: true });
};

export default function Settings() {
  const { settings } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();
  const navigation = useNavigation();
  const isLoading = navigation.state === "submitting";

  useEffect(() => {
    if (actionData?.success) {
      shopify.toast.show("Settings saved successfully!");
    }
  }, [actionData]);

  const [formState, setFormState] = useState({
    phoneNumber: settings.phoneNumber || "",
    welcomeMessage: settings.welcomeMessage || "Hi, I'm interested in [product_title] - [product_url]",
    buttonColor: settings.buttonColor || "#25D366",
    position: settings.position || "bottom-right",
    icon: settings.icon || "whatsapp",
    isActive: settings.isActive,
    animation: settings.animation || "pulse",
    buttonSize: settings.buttonSize || "medium",
    tooltipEnabled: settings.tooltipEnabled,
    shadow: settings.shadow || "medium",
    borderRadius: settings.borderRadius ?? 50,
    delaySeconds: settings.delaySeconds ?? 0,
    customCss: settings.customCss || "",
  });

  const handleSave = () => {
    submit(
      {
        ...formState,
        isActive: formState.isActive.toString(),
        tooltipEnabled: formState.tooltipEnabled.toString(),
        borderRadius: formState.borderRadius.toString(),
        delaySeconds: formState.delaySeconds.toString(),
      },
      { method: "post" }
    );
  };

  return (
    <Page title="WhatsApp Button Settings" backAction={{ content: 'Dashboard', url: '/app' }}>
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">General Configuration</Text>
                
                <Checkbox
                  label="Enable WhatsApp Chat Button"
                  checked={formState.isActive}
                  onChange={(v) => setFormState({ ...formState, isActive: v })}
                />

                <TextField
                  label="WhatsApp Phone Number"
                  value={formState.phoneNumber}
                  onChange={(v) => setFormState({ ...formState, phoneNumber: v })}
                  helpText="Include country code (e.g., +1234567890)"
                  autoComplete="off"
                />

                <TextField
                  label="Welcome Message"
                  value={formState.welcomeMessage}
                  onChange={(v) => setFormState({ ...formState, welcomeMessage: v })}
                  multiline={3}
                  helpText="Supports variables like [product_title], [product_url], [shop_name]"
                  autoComplete="off"
                />
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">Appearance & Design</Text>

                <Select
                  label="Position"
                  options={[
                    { label: "Bottom Right", value: "bottom-right" },
                    { label: "Bottom Left", value: "bottom-left" },
                  ]}
                  value={formState.position}
                  onChange={(v) => setFormState({ ...formState, position: v })}
                />

                <Select
                  label="Icon Style"
                  options={[
                    { label: "Default WhatsApp SVG", value: "whatsapp" },
                    { label: "Custom PNG Image", value: "custom" },
                  ]}
                  value={formState.icon}
                  onChange={(v) => setFormState({ ...formState, icon: v })}
                  helpText="Custom PNG uses the whatsapp.png uploaded to your public assets."
                />

                <Select
                  label="Button Size"
                  options={[
                    { label: "Small", value: "small" },
                    { label: "Medium", value: "medium" },
                    { label: "Large", value: "large" },
                  ]}
                  value={formState.buttonSize}
                  onChange={(v) => setFormState({ ...formState, buttonSize: v })}
                />

                <Select
                  label="Animation"
                  options={[
                    { label: "None", value: "none" },
                    { label: "Pulse", value: "pulse" },
                    { label: "Bounce", value: "bounce" },
                  ]}
                  value={formState.animation}
                  onChange={(v) => setFormState({ ...formState, animation: v })}
                />

                <Select
                  label="Shadow"
                  options={[
                    { label: "None", value: "none" },
                    { label: "Small", value: "small" },
                    { label: "Medium", value: "medium" },
                    { label: "Large", value: "large" },
                  ]}
                  value={formState.shadow}
                  onChange={(v) => setFormState({ ...formState, shadow: v })}
                />

                <TextField
                  label="Button Color"
                  value={formState.buttonColor}
                  onChange={(v) => setFormState({ ...formState, buttonColor: v })}
                  autoComplete="off"
                />

                <RangeSlider
                  label="Border Radius"
                  value={formState.borderRadius}
                  onChange={(v) => setFormState({ ...formState, borderRadius: v })}
                  min={0}
                  max={50}
                  output
                />

                <Checkbox
                  label="Enable Tooltip ('Need Help?')"
                  checked={formState.tooltipEnabled}
                  onChange={(v) => setFormState({ ...formState, tooltipEnabled: v })}
                />
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">Advanced Settings</Text>
                <TextField
                  label="Display Delay (seconds)"
                  type="number"
                  value={formState.delaySeconds.toString()}
                  onChange={(v) => setFormState({ ...formState, delaySeconds: parseInt(v, 10) || 0 })}
                  autoComplete="off"
                  helpText="Number of seconds to wait before showing the button"
                />

                <TextField
                  label="Custom CSS"
                  value={formState.customCss}
                  onChange={(v) => setFormState({ ...formState, customCss: v })}
                  multiline={4}
                  autoComplete="off"
                  helpText="Add any custom CSS to override default styles."
                />

                <div style={{ marginTop: '1rem' }}>
                  <Button variant="primary" loading={isLoading} onClick={handleSave}>
                    Save Settings
                  </Button>
                </div>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
