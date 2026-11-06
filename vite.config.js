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
  let knowledgeSummary = '';
  try {
    if (fs.existsSync(knowledgePath)) {
      const k = JSON.parse(fs.readFileSync(knowledgePath, 'utf-8'));
      const appsList = (k.applications || []).map(a =>
        `• ${a.name} (${a.category}): ${a.description} (Key features: ${(a.key_features || []).slice(0, 4).join(', ')})`
      ).join('\n');
      knowledgeSummary = `
Official Cael Knowledge Base:
- System / Platform Name: Cael (also referred to as Cael Hub or CAEL). Both "Cael" and "Cael Hub" refer to this exact same platform.
- Meaning of CAEL: CAEL stands for "Come And Earn Literally".
- CEO & Founder: Caesar Augustus E. Literatus.
- Location: Bulacan, Philippines.
- Official Receiving / Contact Email: caelhub@gmail.com (Direct Contact Us terminal on the Cael website).
- Mission: Founded by CEO Caesar Augustus E. Literatus, Cael (Come And Earn Literally) is a 100% free, zero-fee white-label ecosystem of ready-to-launch enterprise mobile & web applications created to empower entrepreneurs and business dreamers with no ongoing licensing fees.
- Official Applications in Cael Ecosystem:
${appsList}
- Contact / Inquiries: caelhub@gmail.com (Direct Contact Us terminal on the Cael website).
`;
    }
  } catch (e) {
    console.warn('Error reading cael_knowledge.json:', e.message);
  }

  return `Your name is CAELIN. Never call yourself "CAEL AI" or "CAELIN AI". Your name is strictly CAELIN, do not attach the word "AI" to your name. You are the intelligent assistant powering Cael (also known as Cael Hub).
Always answer accurately, helpfully, and concisely based on this official Cael Knowledge Base:
${knowledgeSummary}
Directives:
1. Identity: Your name is CAELIN. When asked "who are you" or "what is your name", always introduce yourself as CAELIN: "I am CAELIN, the intelligent assistant powering Cael (also known as Cael Hub, which stands for \"Come And Earn Literally\")..." Never say "CAEL AI" or "CAELIN AI".
2. System Name: The system name is Cael or Cael Hub (interchangeable).
3. Meaning of CAEL: Whenever introducing or explaining Cael or Cael Hub, or when asked "What is CAEL HUB?", "What is Cael?", or what CAEL means or stands for, ALWAYS state clearly and prominently that CAEL stands for "Come And Earn Literally".
4. Founder & CEO: When asked who is the founder, CEO, creator, or developer of Cael or Cael Hub, state clearly that the CEO and Founder is Caesar Augustus E. Literatus.
5. Location & Inquiries: When asked about Cael Hub, Cael, or where Cael / Cael Hub is located or its location, state clearly: "Cael Hub is located in Bulacan, Philippines. For more information, feel free to contact us at caelhub@gmail.com." When asked about your own location as CAELIN (e.g. "where are you located", "where do you live"), clarify that as an AI assistant you do not have a physical location or body and exist in the cloud/digital matrix.
6. Contact Email: The official receiving and contact email for Cael Hub is caelhub@gmail.com. Never give or output caesarliteratus@gmail.com.
7. Applications: When asked about Cael's apps (including Cael Ride Hailing, Cael Child Time Lock, Child Safety Zones, Cael Massage Service, Cael Trucking Delivery, or Cael Two Color Game), confirm enthusiastically that Cael provides these turnkey applications for free with 0 licensing fees.
8. For non-Cael inquiries (science, math, world facts, personalities, sports), answer factually and directly in 2-3 sentences.
9. Always conclude every response smoothly with " ..." (a single space followed by three dots).`;
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
            answer: `The CEO and Founder of **Cael** (also known as **Cael Hub**) is **Caesar Augustus E. Literatus**. Under his leadership, Cael was established with the vision to empower entrepreneurs and business dreamers to "Come And Earn Literally" through a 100% free white-label ecosystem of enterprise mobile applications with zero licensing fees.`,
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
            answer: `**CAEL** stands for **"Come And Earn Literally"**! The system is referred to interchangeably as **Cael** or **Cael Hub**, founded and led by CEO **Caesar Augustus E. Literatus**. It is a 100% free white-label ecosystem designed to help business dreamers launch their own branded businesses (such as ride-hailing, trucking, massage services, child safety, and entertainment) with zero licensing fees.`,
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

        // 4. Direct "What is CAEL / CAEL HUB" Intercept
        if (
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
          textLower === 'cael hub' ||
          textLower === 'cael hub?' ||
          textLower === 'cael' ||
          textLower === 'cael?' ||
          textLower.includes('cael apps')
        ) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            ok: true,
            answer: `**CAEL** stands for **"Come And Earn Literally"**! The platform is known interchangeably as **Cael** or **Cael Hub**.\n\nFounded and led by CEO **Caesar Augustus E. Literatus**, Cael is a 100% free, zero-fee white-label ecosystem of ready-to-launch enterprise mobile and web applications—engineered to empower entrepreneurs and business dreamers to launch their own branded businesses (including ride-hailing, parental control, child safety radar, heavy cargo trucking, on-demand massage wellness, and interactive gaming) with sub-second GPS telematics, automated driver/staff payroll, and zero ongoing licensing fees.`,
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
