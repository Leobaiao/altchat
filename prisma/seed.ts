import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

const DEMO_API_KEY = "altchat_dev_key_12345";
const DEMO_TENANT_ID = "tenant_demo";
const DEMO_CLIENT_ID = "client_default";

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Upsert Tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: "demo" },
    update: {},
    create: {
      id: DEMO_TENANT_ID,
      name: "Demo Tenant",
      slug: "demo",
      status: "active"
    }
  });
  console.log(`  ✅ Tenant: ${tenant.name} (${tenant.id})`);

  // 2. Upsert Client
  const client = await prisma.client.upsert({
    where: { clientKey: "default" },
    update: {},
    create: {
      id: DEMO_CLIENT_ID,
      tenantId: tenant.id,
      name: "Default Client",
      clientKey: "default",
      status: "active"
    }
  });
  console.log(`  ✅ Client: ${client.name} (${client.id})`);

  // 3. Upsert ClientConfig (ACPP)
  const acppConfig = {
    protocol: "ACPP",
    version: "1.0",
    client: {
      title: "AltChat Demo",
      subtitle: "Server-driven conversation",
      avatarUrl: "",
      logoUrl: ""
    },
    window: {
      mode: "popup",
      width: 420,
      height: 680,
      minWidth: 320,
      minHeight: 500,
      resizable: true
    },
    theme: {
      mode: "light",
      primaryColor: "#2563EB",
      secondaryColor: "#111827",
      backgroundColor: "#FFFFFF",
      textColor: "#111827"
    },
    behavior: {
      autoOpen: true,
      showWelcome: true,
      typingIndicator: true,
      persistSession: true
    },
    capabilities: {
      text: true,
      file: true,
      image: true,
      audio: false,
      video: false
    },
    session: {
      timeoutSeconds: 1800,
      keepAlive: true
    }
  };

  // Delete existing configs for this client to avoid unique constraint issues
  await prisma.clientConfig.deleteMany({
    where: { clientId: client.id }
  });

  const config = await prisma.clientConfig.create({
    data: {
      tenantId: tenant.id,
      clientId: client.id,
      protocol: "ACPP",
      version: "1.0",
      configJson: acppConfig,
      isActive: true
    }
  });
  console.log(`  ✅ ClientConfig: ACPP v1.0 (${config.id})`);

  // 4. Upsert API Key
  const keyHash = hashApiKey(DEMO_API_KEY);

  // Delete existing key with same hash if exists
  await prisma.apiKey.deleteMany({
    where: { keyHash }
  });

  const apiKey = await prisma.apiKey.create({
    data: {
      tenantId: tenant.id,
      name: "Demo Development Key",
      keyHash,
      status: "active"
    }
  });
  console.log(`  ✅ API Key: ${apiKey.name} (plain: ${DEMO_API_KEY})`);

  console.log("\n🎉 Seed completed successfully!");
  console.log(`\n📋 Quick Reference:`);
  console.log(`   Tenant ID:  ${DEMO_TENANT_ID}`);
  console.log(`   Client ID:  ${DEMO_CLIENT_ID}`);
  console.log(`   API Key:    ${DEMO_API_KEY}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
