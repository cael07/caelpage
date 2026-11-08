import { defineConfig, loadEnv } from 'vite';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

function setupMetadataMiddleware(server) {
  const metadataFilePath = path.resolve(process.cwd(), 'server_metadata.json');

  const getMetadata = () => {
    try {
      if (fs.existsSync(metadataFilePath)) {
        const raw = fs.readFileSync(metadataFilePath, 'utf-8');
        const data = JSON.parse(raw);
        data.system = 'CAEL MATRIX Updates';
        if (!data.views) {
          data.views = {
            total: data.downloads?.total || 0,
            lastUpdated: data.downloads?.lastUpdated || null,
            recentLoads: []
          };
        }
        return data;
      }
    } catch (e) {
      console.error('Error reading server_metadata.json:', e);
    }
    return {
      system: 'CAEL MATRIX Updates',
      version: '2.4.0',
      views: {
        total: 0,
        lastUpdated: null,
        recentLoads: []
      }
    };
  };

  const saveMetadata = (meta) => {
    try {
      fs.writeFileSync(metadataFilePath, JSON.stringify(meta, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error writing server_metadata.json:', e);
    }
  };

  server.middlewares.use('/api/metadata', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    if (req.method === 'GET') {
      const meta = getMetadata();
      const total = meta.views?.total ?? meta.downloads?.total ?? 0;
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        ok: true,
        total: total,
        views: total,
        metadata: meta
      }));
      return;
    }

    if (req.method === 'POST') {
      let rawBody = '';
      req.on('data', chunk => {
        rawBody += chunk;
      });

      req.on('end', () => {
        try {
          let body = {};
          if (rawBody && rawBody.trim()) {
            try {
              body = JSON.parse(rawBody);
            } catch (pErr) {
              // Gracefully continue with defaults
            }
          }
          const meta = getMetadata();
          if (!meta.views) {
            meta.views = { total: meta.downloads?.total || 0, lastUpdated: null, recentLoads: [] };
          }
          meta.views.total = (meta.views.total || 0) + 1;
          meta.views.lastUpdated = new Date().toISOString();

          if (!Array.isArray(meta.views.recentLoads)) meta.views.recentLoads = [];
          meta.views.recentLoads.unshift({
            type: 'page_view',
            referrer: (body.referrer || 'direct').slice(0, 100),
            timestamp: meta.views.lastUpdated
          });
          if (meta.views.recentLoads.length > 50) {
            meta.views.recentLoads.pop();
          }

          saveMetadata(meta);

          console.log(`[METADATA] Page View recorded. Total views: ${meta.views.total}`);

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            ok: true,
            total: meta.views.total,
            views: meta.views.total,
            metadata: meta
          }));
        } catch (e) {
          console.error('Error handling /api/metadata POST:', e);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: false, error: e.message }));
        }
      });
      return;
    }

    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ok: false, error: 'Method Not Allowed' }));
  });
}

function getCaelSystemPrompt() {
  const knowledgePath = path.resolve(process.cwd(), 'cael_knowledge.json');
  let knowledgeSummary = `Official Cael Knowledge Base:
- System / Platform Name: Cael (also referred to as Cael Hub or CAEL).
- Meaning of CAEL: CAEL stands for "Come And Earn Literally".
- CEO & Founder: Caesar Augustus E. Literatus.
- Location: Bulacan, Philippines.
- Official Receiving / Contact Email: caelhub@gmail.com.
- Mission: Making professional business technology accessible through managed mobile applications, affordable infrastructure, and intelligent digital tools.
- Partnership Model: Zero upfront software development or licensing fees, managed infrastructure, and a simple 2% service share on collected fees.
`;

  try {
    if (fs.existsSync(knowledgePath)) {
      const k = JSON.parse(fs.readFileSync(knowledgePath, 'utf-8'));
      const apps = k.applications || [];
      const appsList = apps.map(a =>
        `• ${a.name} [${a.status || 'AVAILABLE'}]: ${a.description} (Key Features: ${(a.key_features || []).slice(0, 4).join(', ')})`
      ).join('\n');
      const pm = k.partnership_model || {};
      const benefits = (pm.what_you_get_six_benefits || []).map(b =>
        `  ${b.number}. ${b.title}: ${b.description}`
      ).join('\n');
      const steps = (k.how_to_get_started_process || []).map(s =>
        `  Step ${s.step}: ${s.name} - ${s.action}`
      ).join('\n');

      knowledgeSummary = `Official Cael Knowledge Base:
- System / Platform Name: Cael (also referred to as Cael Hub or CAEL).
- Meaning of CAEL: CAEL stands for "Come And Earn Literally".
- CEO & Founder: Caesar Augustus E. Literatus.
- Location: Bulacan, Philippines.
- Official Contact Email: caelhub@gmail.com (Direct Contact Us terminal on website).
- Tagline & Motto: "${k.tagline || 'YOUR BUSINESS. YOUR BRAND. OUR TECHNOLOGY.'}" | "${k.motto || 'Your Dream. Your Business. Your Future.'}"
- Philosophy & Punchline: "${k.punchline || 'You grow your business. We keep the technology running.'}" | "${k.manifesto || 'You bring the business idea. You build the brand. We take care of the technology.'}"
- Mission: ${k.mission || ''}
- Vision: ${k.vision || ''}

Partnership Model & Pricing Structure:
- Zero upfront software development or licensing fees (₱0).
- Free software maintenance: updates, bug fixes, performance improvements handled at no additional fee.
- Fully managed technical infrastructure: Cael Hub manages cloud servers, database hosting, security, and Google Play Store publishing.
- Revenue Model (2% Service Share):
  * Rule: The 2% share is calculated ONLY on the business's collected service fee (NOT on the customer's total gross transaction).
  * The ₱1,000 Transaction Example: On a ₱1,000 customer booking where your business collects a 15% (₱150) service fee, Cael Hub's 2% share of that fee is ₱3, leaving your business ₱147.
  * The deduction is automatic and covers server/database hosting, continuous bug fixes, system updates, and ongoing technical support.

The 6 Partnership Benefits:
${benefits}

The 5-Step Process to Get Started:
${steps}

Ownership & Source Code Policy:
- The partner owns 100% of their business brand, company name, logo, customer base, revenue, and local operations.
- Cael Hub manages and retains the underlying codebase, cloud servers, and technical infrastructure so the business owner never has to worry about server crashes, hosting bills, or hiring developers.

Official Applications Portfolio:
${appsList}
`;
    }
  } catch (e) {
    console.warn('Error reading cael_knowledge.json:', e.message);
  }

  return `Your name is CAELIN. Never call yourself "CAEL AI" or "CAELIN AI". Your name is strictly CAELIN, do not attach the word "AI" to your name. You are the intelligent assistant powering Cael (also known as Cael Hub).
Always answer accurately, helpfully, and concisely based on this official Cael Knowledge Base:
${knowledgeSummary}

Directives:
1. Identity: Your name is CAELIN. When asked "who are you" or "what is your name", introduce yourself as CAELIN: "I am CAELIN, the intelligent assistant powering Cael (also known as Cael Hub, which stands for \\"Come And Earn Literally\\")..." Never say "CAEL AI" or "CAELIN AI".
2. System Name & Meaning: Cael or Cael Hub (interchangeable). ALWAYS state clearly that CAEL stands for "Come And Earn Literally".
3. Founder & CEO: The CEO and Founder is Caesar Augustus E. Literatus.
4. Location: Cael Hub is located in Bulacan, Philippines. Official contact email is caelhub@gmail.com. As CAELIN, you exist in the digital matrix and cloud.
5. Partnership & Pricing: Always emphasize the Managed Partnership Model: Zero upfront software development or licensing fees. Cael Hub manages the software, maintenance, cloud servers, and Google Play Store updates under an automatic 2% service share on your business's collected service fees. When explaining the partnership or what partners get, ALWAYS include both the 6 Partnership Benefits AND the transparent 2% service share computation breakdown (e.g., ₱3 on a ₱150 service fee from a ₱1,000 customer booking, leaving ₱147 for the business).
6. Never promise source code ownership. Clarify that partners own 100% of their brand, customers, and operations, while Cael Hub manages the technology and infrastructure.
7. Conclude every response smoothly with " ..." (a single space followed by three dots).`;
}

function setupChatMiddleware(server, env) {
  server.middlewares.use('/api/chat', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    if (req.method !== 'POST') {
      res.statusCode = 405;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ ok: false, error: 'Method Not Allowed' }));
      return;
    }

    let rawBody = '';
    req.on('data', chunk => {
      rawBody += chunk;
    });

    req.on('end', async () => {
      try {
        const body = JSON.parse(rawBody || '{}');
        const prompt = (body.prompt || '').trim();

        if (!prompt) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: false, error: 'Empty prompt' }));
          return;
        }

        const textLower = prompt.toLowerCase();

        // Direct Identity Intercept: Name is CAELIN (No "AI" suffix)
        if (
          textLower === 'who are you' ||
          textLower === 'who are u' ||
          textLower === 'what are you' ||
          textLower === 'what is your name' ||
          textLower === 'whats your name' ||
          textLower.includes('who are you') ||
          textLower.includes('what are you') ||
          (textLower.includes('your name') && textLower.includes('what'))
        ) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            ok: true,
            answer: `I am **CAELIN**, the intelligent assistant powering **Cael** (also known as **Cael Hub**, where **CAEL** stands for **"Come And Earn Literally"**). Created by CEO and Founder **Caesar Augustus E. Literatus**, I assist you with platform tools, system directives, real-time telemetry, and inquiries across all Cael applications.`,
            provider: 'Cael Verified Registry'
          }));
          return;
        }

        // Direct Cael Core Identity & Founder Intercepts (<1ms instant response)
        if (
          (textLower.includes('founder') || textLower.includes('ceo') || textLower.includes('creator') || textLower.includes('owner') || textLower.includes('who made') || textLower.includes('who created')) &&
          (textLower.includes('cael') || textLower.includes('hub') || textLower.includes('system') || textLower.includes('app') || textLower.includes('platform'))
        ) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            ok: true,
            answer: `The CEO and Founder of **Cael** (also known as **Cael Hub**) is **Caesar Augustus E. Literatus**. Under his leadership, Cael was established with the vision to empower entrepreneurs and business dreamers to "Come And Earn Literally" through a managed partnership model providing personalized enterprise mobile applications, managed infrastructure, and a simple 2% service share.`,
            provider: 'Cael Verified Registry'
          }));
          return;
        }

        // Direct Meaning of CAEL Intercept
        if (
          (textLower.includes('mean') || textLower.includes('stand for') || textLower.includes('definition') || textLower.includes('acronym')) &&
          (textLower.includes('cael') || textLower.includes('hub'))
        ) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            ok: true,
            answer: `**CAEL** stands for **"Come And Earn Literally"**! The system is referred to interchangeably as **Cael** or **Cael Hub**, founded and led by CEO **Caesar Augustus E. Literatus**. It is a managed partnership ecosystem designed to help business dreamers launch their own branded businesses (such as ride-hailing, trucking, massage services, child safety, and entertainment) with managed technology and a 2% service share.`,
            provider: 'Cael Verified Registry'
          }));
          return;
        }

        // 1. Direct Location Intercept for CAEL / CAEL HUB: Bulacan, Philippines
        const isCaelLocation = (
          (textLower.includes('cael') || textLower.includes('hub')) &&
          (
            textLower.includes('location') ||
            textLower.includes('located') ||
            textLower.includes('where is') ||
            textLower.includes('where') ||
            textLower.includes('address') ||
            textLower.includes('based') ||
            textLower.includes('headquarter') ||
            textLower.includes('office') ||
            textLower.includes('city') ||
            textLower.includes('province') ||
            textLower.includes('country') ||
            textLower.includes('situated')
          )
        );

        if (isCaelLocation) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            ok: true,
            answer: `**Cael Hub** is located in **Bulacan, Philippines**. For more information, feel free to contact us at **caelhub@gmail.com**.`,
            provider: 'Cael Verified Registry'
          }));
          return;
        }

        // 2. CAELIN's own location: She has no physical location (AI assistant)
        const isCaelinOwnLocation = (
          (
            textLower === 'where are you located' ||
            textLower === 'where are you located?' ||
            textLower === 'where are you' ||
            textLower === 'where are you?' ||
            textLower === 'where are you based' ||
            textLower === 'where are you based?' ||
            textLower.includes('where are you') ||
            textLower.includes('your location') ||
            textLower.includes('where do you live') ||
            textLower.includes('where r u')
          ) &&
          !textLower.includes('cael') &&
          !textLower.includes('hub')
        );

        if (isCaelinOwnLocation) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            ok: true,
            answer: `I do not have a physical location or body. As **CAELIN**, I am an AI assistant hosted in the digital matrix and cloud systems, ready to assist you anytime online.`,
            provider: 'Cael Verified Registry'
          }));
          return;
        }

        // 3. Direct Contact / Email Intercept for Cael Hub
        if (
          (textLower.includes('email') || textLower.includes('contact') || textLower.includes('reach')) &&
          (textLower.includes('cael') || textLower.includes('hub') || textLower.includes('inquiry') || textLower.includes('support'))
        ) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            ok: true,
            answer: `For more information or inquiries regarding **Cael Hub**, you can contact us at **caelhub@gmail.com** or use the direct Contact Us terminal on the Cael website.`,
            provider: 'Cael Verified Registry'
          }));
          return;
        }

        // 4. Specific App Target Guard
        const appKeywords = [
          'truck', 'freight', 'cargo', 'ride', 'taxi', 'massage', 'spa',
          'timelock', 'time lock', 'safety zone', 'child', 'color game', 'colorgame',
          'oncall', 'loan', 'lending', 'microfinance'
        ];
        const hasSpecificAppTarget = appKeywords.some(k => textLower.includes(k));

        // 5. Direct "What is CAEL / CAEL HUB" Intercept
        const isWhatIsCael = !hasSpecificAppTarget && (
          textLower === 'what is cael hub' ||
          textLower === 'what is cael hub?' ||
          textLower === 'what is cael' ||
          textLower === 'what is cael?' ||
          textLower === 'about cael' ||
          textLower === 'about cael hub' ||
          textLower.includes('what is cael') ||
          textLower.includes('about cael') ||
          textLower.includes('what is cael hub') ||
          textLower.includes('tell me about cael') ||
          textLower.includes('cael ecosystem') ||
          textLower === 'cael hub' ||
          textLower === 'cael hub?' ||
          textLower === 'cael' ||
          textLower === 'cael?'
        );

        if (isWhatIsCael) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            ok: true,
            answer: `**CAEL** stands for **"Come And Earn Literally"**! The platform is known interchangeably as **Cael** or **Cael Hub**.\n\nFounded and led by CEO **Caesar Augustus E. Literatus**, Cael is a managed technology partnership ecosystem designed to help entrepreneurs launch their own branded businesses (including ride-hailing, commercial freight trucking, spa wellness, and child safety) with zero upfront software development fees, managed cloud infrastructure, ongoing maintenance, and an agreed 2% service share.`,
            provider: 'Cael Verified Registry'
          }));
          return;
        }

        // 6. Partnership Model, What You Get & The 6 Benefits + 2% Service Share Computation
        if (
          ['how our partnership works', 'how the partnership works', 'partnership work',
           'partnership model', 'partnership', 'what you get', 'what is included', 'whats included',
           'six benefits', '6 benefits', 'partnership benefits'].some(k => textLower.includes(k))
        ) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            ok: true,
            answer: `### ✦ How the Cael Hub Partnership Works: Your Business. Your Brand. Our Technology.\n\nLaunch your business under your own brand with a professionally managed mobile application while Cael Hub takes care of the technology, maintenance, and infrastructure behind it.\n\n**THE 6 PARTNERSHIP BENEFITS:**\n1. 🏷️ **Your Own Brand:** Use your company name, logo, custom color palette, and app icons with a personalized application.\n2. 📱 **Your Own Business App:** Access a turnkey, deployment-ready enterprise mobile application without upfront software licensing or custom development fees.\n3. 🔄 **Free Software Maintenance:** Enjoy ongoing updates, bug fixes, performance improvements, and eligible personalization at no additional development fee.\n4. ☁️ **Managed Infrastructure:** We handle high-availability servers, database administration, cloud hosting, and security maintenance.\n5. 🚀 **Google Play Store Management:** We manage technical store publishing, app listings, and eligible updates on Google Play Store so you can focus on serving customers.\n6. 🛠️ **Ongoing Technical Support:** Dedicated assistance with application configuration, technical troubleshooting, and operational advice.\n\n---\n\n### ✦ Transparent Revenue Model: Your 2% Helps Keep Your Business Running\n\nThere are **zero upfront software development or licensing fees**. Instead, Cael Hub is sustained through an agreed, automatic **2% service share** on your business's collected service fees on eligible transactions.\n\n**CRITICAL RULE:**\nThe 2% is calculated **ONLY on your business's collected service fee**, NOT on the customer's total gross transaction.\n\n**THE OFFICIAL ₱1,000 BREAKDOWN EXAMPLE:**\n- **Customer transaction amount:** ₱1,000\n- **Your business's collected service fee (15%):** ₱150\n- **Cael Hub's 2% share of that ₱150 fee:** **₱3**\n- **Your business retains:** **₱147**\n\n**WHAT YOUR ₱3 COVERS:**\n1. High-availability cloud servers and database hosting.\n2. Continuous bug fixes, performance upgrades, and security patches.\n3. Google Play Store publishing and regular application updates.\n4. Dedicated developer and technical infrastructure support.\n\nThe deduction is automatic, meaning you never receive unexpected server bills or developer invoices.\n\n**You grow your business. We keep the technology running.**`,
            provider: 'Cael Verified Registry'
          }));
          return;
        }

        // 7. 2% Service Share, Pricing & The ₱3 Calculation Breakdown
        if (
          ['2%', 'service share', 'share', 'percentage', 'how much', 'cost', 'fee', 'fees',
           'pricing', 'calculation', 'breakdown', 'p3', '₱3', '150', 'commission', 'hidden cost'].some(k => textLower.includes(k)) &&
          !['loan', 'lending', 'interest rate'].some(k => textLower.includes(k))
        ) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            ok: true,
            answer: `### ✦ Transparent Revenue Model: Your 2% Helps Keep Your Business Running\n\nThere are **zero upfront software development or licensing fees**. Instead, Cael Hub is sustained through an agreed, automatic **2% service share** on your business's collected service fees on eligible transactions.\n\n**CRITICAL RULE:**\nThe 2% is calculated **ONLY on your business's collected service fee**, NOT on the customer's total gross transaction.\n\n**THE OFFICIAL ₱1,000 BREAKDOWN EXAMPLE:**\n- **Customer transaction amount:** ₱1,000\n- **Your business's collected service fee (15%):** ₱150\n- **Cael Hub's 2% share of that ₱150 fee:** **₱3**\n- **Your business retains:** **₱147**\n\n**WHAT YOUR ₱3 COVERS:**\n1. High-availability cloud servers and database hosting.\n2. Continuous bug fixes, performance upgrades, and security patches.\n3. Google Play Store publishing and regular application updates.\n4. Dedicated developer and technical infrastructure support.\n\nThe deduction is automatic, meaning you never receive unexpected server bills or developer invoices.`,
            provider: 'Cael Verified Registry'
          }));
          return;
        }

        // 8. How to Get Started / Process to Launch
        if (
          ['how to start', 'how to get started', 'how to launch', 'how to apply',
           'process', 'steps', 'onboarding', 'how can i start', 'how do i start'].some(k => textLower.includes(k))
        ) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            ok: true,
            answer: `### ✦ How to Get Started with Cael Hub: 5 Simple Steps\n\n1. **Step 1: Select Your Business Application**\n   Explore the Cael Hub directory (Ride-Hailing, Trucking, Massage & Wellness, Child Protection, etc.) and choose the business model that aligns with your goals.\n2. **Step 2: Submit an Inquiry via the Contact Terminal**\n   Reach out using our direct Contact Us terminal on the website or email **caelhub@gmail.com** with your proposed business name, target location, and preferred application.\n3. **Step 3: Brand Personalization & Partnership Agreement**\n   Provide your official company logo, brand name, and preferred color scheme under our standard 2% service-share agreement.\n4. **Step 4: Managed Technical Setup & Google Play Store Publishing**\n   Cael Hub provisions your cloud backend, configures the database, compiles your branded mobile application, and manages the Google Play Store publishing.\n5. **Step 5: Launch, Operate & Scale Your Business**\n   Onboard your drivers, service providers, or customers and start earning. You focus on operations and marketing while Cael Hub keeps the software running 24/7.`,
            provider: 'Cael Verified Registry'
          }));
          return;
        }

        // 9. Ownership & Source Code
        if (
          ['source code', 'own the code', 'code ownership', 'own the software',
           'intellectual property', 'white label', 'white-label', 'who owns'].some(k => textLower.includes(k))
        ) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            ok: true,
            answer: `### ✦ Brand Ownership vs. Technical Management\n\n- **What You Own (100%):** You own your business brand, your company name, your custom logo, your customer relationships, your local operations, and your business profits.\n- **What Cael Hub Manages:** Cael Hub retains and maintains the underlying software codebase, cloud servers, databases, and security infrastructure.\n\n**Why this model?**\nOwning source code often requires hiring expensive full-time software engineers, managing server crashes, and paying heavy cloud bills. With Cael Hub, you enjoy enterprise-grade technology completely maintained by us, so you can focus entirely on growing your business.`,
            provider: 'Cael Verified Registry'
          }));
          return;
        }

        // 10. Specific Application Inquiries
        if (['ride hailing', 'ride-hailing', 'ride hail', 'motorcycle taxi', 'taxi app'].some(k => textLower.includes(k)) || (textLower.startsWith('ride') && textLower.includes('app'))) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            ok: true,
            answer: `### 🚗 Cael Ride Hailing App [Status: AVAILABLE • READY TO LAUNCH]\nA turnkey mobile ecosystem featuring:\n- **Passenger Booking App:** Upfront fare calculation, ride options, live GPS arrival tracking, and in-app wallet.\n- **Driver Dispatch App:** Sub-second GPS route navigation, motorcycle taxi & courier parcel tiers, and automated commission payouts.\n- **Driver Attendance & Biometrics:** Facial recognition clock-in and geofenced duty shifts.\n- **Enterprise Operations Console:** Real-time fleet telematics, automated driver payroll, and 360° SOS safety beacons.\n- **Personalization:** Fully branded with your company name, logo, custom color palette, and local fare tariffs.`,
            provider: 'Cael Verified Registry'
          }));
          return;
        }

        if (['trucking', 'freight', 'cargo', 'heavy cargo', 'hauling', 'truck delivery'].some(k => textLower.includes(k))) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            ok: true,
            answer: `### 🚛 Cael Trucking Delivery App [Status: AVAILABLE • READY TO LAUNCH]\nAn enterprise commercial freight and logistics dispatch system featuring:\n- **Fleet Dispatch Console:** Centralized scheduling for flatbeds, 10-wheelers, reefers, and container haulers.\n- **Commercial Truck Routing:** Smart GPS navigation avoiding low bridge clearances and weight restrictions.\n- **Digital BOL & Waybills:** Automated Bill of Lading generation and dynamic weight/rate calculators.\n- **Compliance & Payroll:** Driver ELD logbooks, Hours of Service compliance, and per-km freight payouts.\n- **Proof of Delivery (POD):** Digital e-signatures and container seal photo capture at delivery checkpoints.`,
            provider: 'Cael Verified Registry'
          }));
          return;
        }

        if (['massage', 'spa', 'wellness app'].some(k => textLower.includes(k))) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            ok: true,
            answer: `### 💆 Cael Massage Service App [Status: AVAILABLE • READY TO LAUNCH]\nAn on-demand spa and wellness platform supporting both home service visits and clinic appointments:\n- **Dual Booking Modes:** Clients book home therapist visits or reserve clinic treatment rooms.\n- **Therapist GPS Dispatch:** Live route tracking, estimated arrival countdown, and availability radar.\n- **Treatment Menu:** Swedish, Deep Tissue, Shiatsu, Hot Stone, and Aromatherapy services.\n- **Digital Health Screening:** Client contraindication intake forms and session review notes.\n- **Payroll & Safety:** Therapist biometric clock-in, automated commission splits, 100% tip preservation, and masked private calling.`,
            provider: 'Cael Verified Registry'
          }));
          return;
        }

        if (['timelock', 'time lock', 'phone overuse', 'screen time', 'parental control'].some(k => textLower.includes(k))) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            ok: true,
            answer: `### ⏱️ Cael Child Time Lock [Status: AVAILABLE • READY TO LAUNCH]\nA managed parental control mobile application designed to curb screen addiction without expensive monthly fees:\n- **Parent-Child Pairing:** Instant 5-second QR code device handshake.\n- **Bedtime & Sleep Schedules:** Automated curfew freeze locking devices during study and sleep hours.\n- **Granular App Firewall:** Permits educational and school tools while strictly capping social media and games.\n- **On-Demand Remote Freeze:** One-tap remote device lockdown directly from the parent handset.\n- **Tamper-Proof Guard:** Hardware-level protection preventing children from uninstalling or bypassing restrictions.`,
            provider: 'Cael Verified Registry'
          }));
          return;
        }

        if (['safety zone', 'child zone', 'geofence', 'child safety', 'safety zones'].some(k => textLower.includes(k))) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            ok: true,
            answer: `### 🛡️ Child Safety Zones [Status: AVAILABLE • READY TO LAUNCH]\nA real-time family geofencing and GPS radar protection application:\n- **Virtual Geofence Zones:** Custom safe perimeters around home, school, tuition centers, and playgrounds.\n- **Safe Route Corridors:** Monitored paths with instant alerts if a child deviates from their regular commute.\n- **Perimeter Breach Sirens:** Real-time notification delivered to parent phones the second a boundary is crossed.\n- **Silent SOS Distress Beacon:** Allows a child to trigger an alert with covert ambient audio streaming.\n- **Anti-Theft Capture:** Silent automatic camera photo capture if a phone is tampered with or unauthorized touch is detected.`,
            provider: 'Cael Verified Registry'
          }));
          return;
        }

        if (['color game', 'colorgame', 'two color'].some(k => textLower.includes(k))) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            ok: true,
            answer: `### 🎲 Cael Two Color Game App [Status: IN DEVELOPMENT • TESTING]\nAn interactive community gaming arena featuring 3D physics color wheel spins (Red vs White):\n- **Provably Fair RNG:** SHA-256 cryptographic proof ensuring total fairness and transparency.\n- **Live Betting Engine:** Real-time round pool calculations and dynamic odds updates.\n- **Instant Rewards:** Automated digital e-wallet payouts in under 15 seconds.\n- **Community Engagement:** Live multiplayer chat, streak leaderboards, and celebration tickers.`,
            provider: 'Cael Verified Registry'
          }));
          return;
        }

        if (['oncall', 'locksmith', 'plumber', 'handyman', 'home services'].some(k => textLower.includes(k))) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            ok: true,
            answer: `### 🔧 Cael OnCall Service App [Status: IN DEVELOPMENT • TESTING]\nAn on-demand residential emergency home repair radar:\n- **Sub-Minute Matching:** Connects homeowners to nearest verified locksmiths, appliance technicians, plumbers, and handymen.\n- **Proximity GPS Radar:** Real-time technician dispatch with live arrival ETA.\n- **Emergency Services:** 24/7 lockout rescue, appliance breakdown repair, and pipe leak fixes.\n- **Transparent Pricing:** Standardized labor pricing with background-checked technician reviews.`,
            provider: 'Cael Verified Registry'
          }));
          return;
        }

        const systemPrompt = getCaelSystemPrompt();
        const groqKey = env.GROQ_API_KEY || process.env.GROQ_API_KEY;
        const geminiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
        const openrouterKey = env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY;

        // 1. Try Groq (Ultra-fast LPU inference: Qwen / GPT-OSS / LLaMA)
        if (groqKey) {
          const groqModels = ['qwen/qwen3.8-27b', 'openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];
          for (const modelId of groqModels) {
            try {
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 6000);
              const gRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${groqKey}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  model: modelId,
                  messages: [
                    {
                      role: 'system',
                      content: systemPrompt
                    },
                    { role: 'user', content: prompt }
                  ],
                  max_tokens: 350
                }),
                signal: controller.signal
              });
              clearTimeout(timeoutId);

              if (gRes.ok) {
                const gData = await gRes.json();
                let content = gData.choices?.[0]?.message?.content;
                if (content && content.trim().length > 5) {
                  content = content.replace(/caesarliteratus@gmail\.com/gi, 'caelhub@gmail.com');
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({
                    ok: true,
                    answer: content.trim(),
                    provider: `Groq (${modelId})`
                  }));
                  return;
                }
              }
            } catch (e) {
              console.warn(`[AI API] Groq (${modelId}) warning:`, e.message);
            }
          }
        }

        // 2. Try Google Gemini (Gemini 1.5 Flash)
        if (geminiKey) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 7000);
            const gemUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
            const gemRes = await fetch(gemUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{
                  parts: [{
                    text: `${systemPrompt}\n\nUser Question: ${prompt}`
                  }]
                }]
              }),
              signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (gemRes.ok) {
              const gemData = await gemRes.json();
              let content = gemData.candidates?.[0]?.content?.parts?.[0]?.text;
              if (content && content.trim().length > 5) {
                content = content.replace(/caesarliteratus@gmail\.com/gi, 'caelhub@gmail.com');
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  ok: true,
                  answer: content.trim(),
                  provider: 'Google Gemini'
                }));
                return;
              }
            }
          } catch (e) {
            console.warn('[AI API] Gemini error:', e.message);
          }
        }

        // 3. Try OpenRouter Free
        if (openrouterKey) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 7000);
            const oRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${openrouterKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                model: 'meta-llama/llama-3.3-70b-instruct:free',
                messages: [
                  {
                    role: 'system',
                    content: systemPrompt
                  },
                  { role: 'user', content: prompt }
                ]
              }),
              signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (oRes.ok) {
              const oData = await oRes.json();
              let content = oData.choices?.[0]?.message?.content;
              if (content && content.trim().length > 5) {
                content = content.replace(/caesarliteratus@gmail\.com/gi, 'caelhub@gmail.com');
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  ok: true,
                  answer: content.trim(),
                  provider: 'OpenRouter Free'
                }));
                return;
              }
            }
          } catch (e) {
            console.warn('[AI API] OpenRouter error:', e.message);
          }
        }

        // 4. Zero-Key Fast DuckDuckGo Instant Knowledge API
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3500);
          const ddgRes = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(prompt)}&format=json&no_html=1`, {
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (ddgRes.ok) {
            const ddgData = await ddgRes.json();
            if (ddgData.AbstractText && ddgData.AbstractText.trim().length > 25) {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                ok: true,
                answer: ddgData.AbstractText.trim(),
                provider: 'DuckDuckGo Knowledge Graph',
                heading: ddgData.Heading,
                url: ddgData.AbstractURL
              }));
              return;
            }
          }
        } catch (e) {}

        // 5. Zero-Key Wikipedia REST Extract API
        try {
          const cleanSearch = prompt
            .replace(/^(who is the|who is|what is the|what is|where is the|where is|when was|when is|tell me about|explain)\s+/i, '')
            .replace(/[?!.]+$/g, '')
            .trim();

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3500);
          const wSearchRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cleanSearch)}&utf8=1&format=json`, {
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (wSearchRes.ok) {
            const wSearchData = await wSearchRes.json();
            const topHit = wSearchData?.query?.search?.[0];
            if (topHit && topHit.title) {
              const summaryController = new AbortController();
              const sTimeout = setTimeout(() => summaryController.abort(), 3000);
              const summaryRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topHit.title.replace(/ /g, '_'))}`, {
                signal: summaryController.signal
              });
              clearTimeout(sTimeout);

              if (summaryRes.ok) {
                const sumData = await summaryRes.json();
                if (sumData.extract && sumData.extract.trim().length > 25) {
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({
                    ok: true,
                    answer: sumData.extract.trim(),
                    provider: `Wikipedia (${topHit.title})`,
                    url: sumData.content_urls?.desktop?.page
                  }));
                  return;
                }
              }
            }
          }
        } catch (e) {}

        // If no provider had an instant response
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          ok: false,
          answer: null
        }));

      } catch (err) {
        console.error('[AI API] Unexpected error in /api/chat:', err);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
    });
  });
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    server: {
      port: 5173,
      host: true
    },
    plugins: [
      {
        name: 'brevo-contact-email-api',
        configureServer(server) {
          server.middlewares.use('/api/contact', async (req, res) => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

            if (req.method === 'OPTIONS') {
              res.statusCode = 204;
              res.end();
              return;
            }

            if (req.method !== 'POST') {
              res.statusCode = 405;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: false, error: 'Method Not Allowed' }));
              return;
            }

            let rawBody = '';
            req.on('data', chunk => {
              rawBody += chunk;
            });

            req.on('end', async () => {
              try {
                const data = JSON.parse(rawBody || '{}');
                const name = (data.name || '').trim();
                const email = (data.email || '').trim();
                const subject = (data.subject || '').trim();
                const message = (data.message || '').trim();

                if (!name || !email || !subject || !message) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({
                    ok: false,
                    error: 'Missing required fields. Please provide name, email, subject, and message.'
                  }));
                  return;
                }

                console.log('\n--- 📧 DISPATCHING CONTACT TRANSMISSION ---');
                console.log('From:', `${name} <${email}>`);
                console.log('Subject:', subject);

                // Call python email_sender.py --dispatch
                const pyScript = path.resolve(process.cwd(), 'email_sender.py');
                const py = spawn('py', [pyScript, '--dispatch']);

                let stdout = '';
                let stderr = '';

                py.stdout.on('data', (d) => { stdout += d.toString(); });
                py.stderr.on('data', (d) => { stderr += d.toString(); });

                py.on('close', (code) => {
                  try {
                    const result = JSON.parse(stdout.trim());
                    console.log('Dispatch result:', result);
                    res.statusCode = result.ok ? 200 : 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(result));
                  } catch (e) {
                    console.error('Email sender error stdout/stderr:', stdout, stderr);
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({
                      ok: false,
                      error: stderr || stdout || 'Failed to dispatch email'
                    }));
                  }
                });

                py.stdin.write(JSON.stringify({ name, email, subject, message }));
                py.stdin.end();

              } catch (err) {
                console.error('API Error in /api/contact:', err);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ ok: false, error: err.message || 'Server error' }));
              }
            });
          });
        }
      },
      {
        name: 'metadata-counter-api',
        configureServer(server) {
          setupMetadataMiddleware(server);
        },
        configurePreviewServer(server) {
          setupMetadataMiddleware(server);
        }
      },
      {
        name: 'caelin-ai-chat-api',
        configureServer(server) {
          setupChatMiddleware(server, env);
        },
        configurePreviewServer(server) {
          setupChatMiddleware(server, env);
        }
      }
    ]
  };
});
