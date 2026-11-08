import os
import sys
import json
import re
import datetime
import urllib.request
import urllib.parse
import urllib.error
from fastapi import FastAPI, Request, Response
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

import email_sender

# 1. Load environment variables
load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DIST_DIR = os.path.join(BASE_DIR, "dist")
METADATA_FILE = os.path.join(BASE_DIR, "server_metadata.json")
KNOWLEDGE_FILE = os.path.join(BASE_DIR, "cael_knowledge.json")

app = FastAPI(title="CAEL HUB Matrix Platform")

# 2. CORS configuration (permits embedding, previewing, and decoupled clients)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CRAWLER_HITS = []

@app.middleware("http")
async def log_crawler_requests(request: Request, call_next):
    user_agent = request.headers.get("user-agent", "")
    ip = request.headers.get("x-forwarded-for") or (request.client.host if request.client else "unknown")
    response = await call_next(request)
    entry = {
        "time": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "method": request.method,
        "path": request.url.path,
        "query": request.url.query,
        "status": response.status_code,
        "ip": ip,
        "ua": user_agent[:120]
    }
    CRAWLER_HITS.insert(0, entry)
    if len(CRAWLER_HITS) > 40:
        CRAWLER_HITS.pop()
    print(f"[ACCESS] {request.method} {request.url.path} -> {response.status_code} | IP: {ip} | UA: {user_agent[:60]}")
    return response

@app.api_route("/api/crawler-debug", methods=["GET", "HEAD"])
async def get_crawler_debug():
    return JSONResponse({"ok": True, "count": len(CRAWLER_HITS), "hits": CRAWLER_HITS[:30]})

@app.api_route("/robots.txt", methods=["GET", "HEAD"])
async def serve_robots_txt():
    content = (
        "# Robots.txt for Cael Hub\n"
        "# https://caelpage.onrender.com\n\n"
        "User-agent: facebookexternalhit\nAllow: /\n\n"
        "User-agent: Facebot\nAllow: /\n\n"
        "User-agent: Meta-ExternalAgent\nAllow: /\n\n"
        "User-agent: WhatsApp\nAllow: /\n\n"
        "User-agent: Twitterbot\nAllow: /\n\n"
        "User-agent: LinkedInBot\nAllow: /\n\n"
        "User-agent: TelegramBot\nAllow: /\n\n"
        "User-agent: Googlebot\nAllow: /\n\n"
        "User-agent: Bingbot\nAllow: /\n\n"
        "User-agent: *\nAllow: /\nDisallow: /api/\n\n"
        "Sitemap: https://caelpage.onrender.com/sitemap.xml\n"
    )
    return Response(
        content=content,
        media_type="text/plain; charset=utf-8",
        status_code=200,
        headers={"Cache-Control": "public, max-age=86400", "Content-Type": "text/plain; charset=utf-8"}
    )

# -----------------------------------------------------------------------------
# Metadata Telemetry Store
# -----------------------------------------------------------------------------
def get_metadata():
    try:
        if os.path.exists(METADATA_FILE):
            with open(METADATA_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                data["system"] = "CAEL MATRIX Updates"
                if "views" not in data:
                    total_views = data.get("downloads", {}).get("total", 0)
                    data["views"] = {
                        "total": total_views,
                        "lastUpdated": data.get("downloads", {}).get("lastUpdated"),
                        "recentLoads": []
                    }
                return data
    except Exception as e:
        print(f"Error reading server_metadata.json: {e}")
    return {
        "system": "CAEL MATRIX Updates",
        "version": "2.4.0",
        "views": {
            "total": 0,
            "lastUpdated": None,
            "recentLoads": []
        }
    }

def save_metadata(meta):
    try:
        with open(METADATA_FILE, "w", encoding="utf-8") as f:
            json.dump(meta, f, indent=2)
    except Exception as e:
        print(f"Error writing server_metadata.json: {e}")


# -----------------------------------------------------------------------------
# Knowledge Base & System Prompt
# -----------------------------------------------------------------------------
def get_cael_system_prompt():
    knowledge_summary = (
        "Official Cael Knowledge Base:\n"
        "- System / Platform Name: Cael (also referred to as Cael Hub or CAEL).\n"
        "- Meaning of CAEL: CAEL stands for \"Come And Earn Literally\".\n"
        "- CEO & Founder: Caesar Augustus E. Literatus.\n"
        "- Location: Bulacan, Philippines.\n"
        "- Official Receiving / Contact Email: caelhub@gmail.com.\n"
        "- Mission: Making professional business technology accessible through managed mobile applications, affordable infrastructure, and intelligent digital tools.\n"
        "- Partnership Model: Zero upfront software development or licensing fees, managed infrastructure, and a simple 2% service share on collected fees.\n"
    )
    try:
        if os.path.exists(KNOWLEDGE_FILE):
            with open(KNOWLEDGE_FILE, "r", encoding="utf-8") as f:
                k = json.load(f)
                apps = k.get("applications", [])
                apps_list = "\n".join([
                    f"• {a.get('name')} [{a.get('status', 'AVAILABLE')}]: {a.get('description')} (Key Features: {', '.join((a.get('key_features') or [])[:4])})"
                    for a in apps
                ])
                pm = k.get("partnership_model", {})
                benefits = "\n".join([
                    f"  {b.get('number', '')}. {b.get('title', '')}: {b.get('description', '')}"
                    for b in pm.get("what_you_get_six_benefits", [])
                ])
                steps = "\n".join([
                    f"  Step {s.get('step', '')}: {s.get('name', '')} - {s.get('action', '')}"
                    for s in k.get("how_to_get_started_process", [])
                ])
                knowledge_summary = f"""Official Cael Knowledge Base:
- System / Platform Name: Cael (also referred to as Cael Hub or CAEL).
- Meaning of CAEL: CAEL stands for "Come And Earn Literally".
- CEO & Founder: Caesar Augustus E. Literatus.
- Location: Bulacan, Philippines.
- Official Contact Email: caelhub@gmail.com (Direct Contact Us terminal on website).
- Tagline & Motto: "{k.get('tagline', 'YOUR BUSINESS. YOUR BRAND. OUR TECHNOLOGY.')}" | "{k.get('motto', 'Your Dream. Your Business. Your Future.')}"
- Philosophy & Punchline: "{k.get('punchline', 'You grow your business. We keep the technology running.')}" | "{k.get('manifesto', 'You bring the business idea. You build the brand. We take care of the technology.')}"
- Mission: {k.get('mission', '')}
- Vision: {k.get('vision', '')}

Partnership Model & Pricing Structure:
- Zero upfront software development or licensing fees (₱0).
- Free software maintenance: updates, bug fixes, performance improvements handled at no additional fee.
- Fully managed technical infrastructure: Cael Hub manages cloud servers, database hosting, security, and Google Play Store publishing.
- Revenue Model (2% Service Share):
  * Rule: The 2% share is calculated ONLY on the business's collected service fee (NOT on the customer's total gross transaction).
  * The ₱1,000 Transaction Example: On a ₱1,000 customer booking where your business collects a 15% (₱150) service fee, Cael Hub's 2% share of that fee is ₱3, leaving your business ₱147.
  * The deduction is automatic and covers server/database hosting, continuous bug fixes, system updates, and ongoing technical support.

The 6 Partnership Benefits:
{benefits}

The 5-Step Process to Get Started:
{steps}

Ownership & Source Code Policy:
- The partner owns 100% of their business brand, company name, logo, customer base, revenue, and local operations.
- Cael Hub manages and retains the underlying codebase, cloud servers, and technical infrastructure so the business owner never has to worry about server crashes, hosting bills, or hiring developers.

Official Applications Portfolio:
{apps_list}
"""
    except Exception as e:
        print(f"Error loading cael_knowledge.json: {e}")

    return f"""Your name is CAELIN. Never call yourself "CAEL AI" or "CAELIN AI". Your name is strictly CAELIN, do not attach the word "AI" to your name. You are the intelligent assistant powering Cael (also known as Cael Hub).
Always answer accurately, helpfully, and concisely based on this official Cael Knowledge Base:
{knowledge_summary}

Directives:
1. Identity: Your name is CAELIN. When asked "who are you" or "what is your name", introduce yourself as CAELIN: "I am CAELIN, the intelligent assistant powering Cael (also known as Cael Hub, which stands for \"Come And Earn Literally\")..." Never say "CAEL AI" or "CAELIN AI".
2. System Name & Meaning: Cael or Cael Hub (interchangeable). ALWAYS state clearly that CAEL stands for "Come And Earn Literally".
3. Founder & CEO: The CEO and Founder is Caesar Augustus E. Literatus.
4. Location: Cael Hub is located in Bulacan, Philippines. Official contact email is caelhub@gmail.com. As CAELIN, you exist in the digital matrix and cloud.
5. Partnership & Pricing: Always emphasize the Managed Partnership Model: Zero upfront software development or licensing fees. Cael Hub manages the software, maintenance, cloud servers, and Google Play Store updates under an automatic 2% service share on your business's collected service fees. When explaining the partnership or what partners get, ALWAYS include both the 6 Partnership Benefits AND the transparent 2% service share computation breakdown (e.g., ₱3 on a ₱150 service fee from a ₱1,000 customer booking, leaving ₱147 for the business).
6. Never promise source code ownership. Clarify that partners own 100% of their brand, customers, and operations, while Cael Hub manages the technology and infrastructure.
7. Conclude every response smoothly with " ..." (a single space followed by three dots)."""


# -----------------------------------------------------------------------------
# 1. API: Contact Transmission Terminal
# -----------------------------------------------------------------------------
@app.post("/api/contact")
async def handle_contact(request: Request):
    try:
        body = await request.json()
    except Exception:
        body = {}

    name = (body.get("name") or "").strip()
    email = (body.get("email") or "").strip()
    subject = (body.get("subject") or "").strip()
    message = (body.get("message") or "").strip()

    if not (name and email and subject and message):
        return JSONResponse(
            status_code=400,
            content={"ok": False, "error": "Missing required fields. Please provide name, email, subject, and message."}
        )

    print(f"\n--- 📧 DISPATCHING CONTACT TRANSMISSION ---")
    print(f"From: {name} <{email}>")
    print(f"Subject: {subject}")

    result = email_sender.dispatch_contact_email(name, email, subject, message)
    status_code = 200 if result.get("ok") else 500
    return JSONResponse(status_code=status_code, content=result)


# -----------------------------------------------------------------------------
# 2. API: Metadata Page Views & Updates Counter
# -----------------------------------------------------------------------------
@app.get("/api/metadata")
async def handle_metadata_get():
    meta = get_metadata()
    total = meta.get("views", {}).get("total") or meta.get("downloads", {}).get("total", 0)
    return JSONResponse({"ok": True, "total": total, "views": total, "metadata": meta})

@app.post("/api/metadata")
async def handle_metadata_post(request: Request):
    try:
        body = await request.json()
    except Exception:
        body = {}

    meta = get_metadata()
    if "views" not in meta or not isinstance(meta["views"], dict):
        total_views = meta.get("downloads", {}).get("total", 0)
        meta["views"] = {"total": total_views, "lastUpdated": None, "recentLoads": []}

    meta["views"]["total"] = (meta["views"].get("total") or 0) + 1
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    meta["views"]["lastUpdated"] = now_iso

    referrer = body.get("referrer") or "direct"
    recent = meta["views"].setdefault("recentLoads", [])
    recent.insert(0, {
        "type": "page_view",
        "referrer": str(referrer)[:100],
        "timestamp": now_iso
    })
    meta["views"]["recentLoads"] = recent[:30]

    save_metadata(meta)
    return JSONResponse({"ok": True, "total": meta["views"]["total"], "views": meta["views"]["total"], "metadata": meta})


# -----------------------------------------------------------------------------
# 3. API: CAELIN AI Chat & Direct Neural Intercepts
# -----------------------------------------------------------------------------
@app.post("/api/chat")
async def handle_chat(request: Request):
    try:
        body = await request.json()
    except Exception:
        body = {}

    prompt = (body.get("prompt") or "").strip()
    if not prompt:
        return JSONResponse(status_code=400, content={"ok": False, "error": "Empty prompt"})

    text_lower = prompt.lower()

    # Intercept 1: Location of CAEL / CAEL HUB (Bulacan, Philippines)
    is_cael_location = (
        ("cael" in text_lower or "hub" in text_lower) and
        any(k in text_lower for k in [
            "location", "located", "where is", "where", "address", "based",
            "headquarter", "office", "city", "province", "country", "situated"
        ])
    )
    if is_cael_location:
        return JSONResponse({
            "ok": True,
            "answer": "**Cael Hub** is located in **Bulacan, Philippines**. For more information, feel free to contact us at **caelhub@gmail.com**.",
            "provider": "Cael Verified Registry"
        })

    # Intercept 2: CAELIN's own location (She is an AI with no physical location)
    is_caelin_own_location = (
        (
            text_lower in ["where are you located", "where are you located?", "where are you", "where are you?", "where are you based", "where are you based?"] or
            "where are you" in text_lower or
            "your location" in text_lower or
            "where do you live" in text_lower or
            "where r u" in text_lower
        ) and
        "cael" not in text_lower and
        "hub" not in text_lower
    )
    if is_caelin_own_location:
        return JSONResponse({
            "ok": True,
            "answer": "I do not have a physical location or body. As **CAELIN**, I am an AI assistant hosted in the digital matrix and cloud systems, ready to assist you anytime online.",
            "provider": "Cael Verified Registry"
        })

    # Intercept 3: Contact / Email for Cael Hub
    if ("email" in text_lower or "contact" in text_lower or "reach" in text_lower) and ("cael" in text_lower or "hub" in text_lower or "inquiry" in text_lower or "support" in text_lower):
        return JSONResponse({
            "ok": True,
            "answer": "For more information or inquiries regarding **Cael Hub**, you can contact us at **caelhub@gmail.com** or use the direct Contact Us terminal on the Cael website.",
            "provider": "Cael Verified Registry"
        })

    # Intercept 4: Name & Identity
    if any(q in text_lower for q in ["who are you", "what are you", "what is your name", "whats your name"]):
        return JSONResponse({
            "ok": True,
            "answer": "I am **CAELIN**, the intelligent assistant powering **Cael** (also known as **Cael Hub**, where **CAEL** stands for **\"Come And Earn Literally\"**). Created by CEO and Founder **Caesar Augustus E. Literatus**, I assist you with platform tools, system directives, real-time telemetry, and inquiries across all Cael applications.",
            "provider": "Cael Verified Registry"
        })

    # Intercept 5: Founder & CEO
    if any(k in text_lower for k in ["founder", "ceo", "creator", "owner", "who made", "who created"]) and any(k in text_lower for k in ["cael", "hub", "system", "app", "platform"]):
        return JSONResponse({
            "ok": True,
            "answer": "The CEO and Founder of **Cael** (also known as **Cael Hub**) is **Caesar Augustus E. Literatus**. Under his leadership, Cael was established with the vision to empower entrepreneurs and business dreamers to \"Come And Earn Literally\" through a managed partnership model providing personalized enterprise mobile applications, managed infrastructure, and a simple 2% service share.",
            "provider": "Cael Verified Registry"
        })

    # Intercept 6: Meaning of CAEL
    if any(k in text_lower for k in ["mean", "stand for", "definition", "acronym"]) and ("cael" in text_lower or "hub" in text_lower):
        return JSONResponse({
            "ok": True,
            "answer": "**CAEL** stands for **\"Come And Earn Literally\"**! The system is referred to interchangeably as **Cael** or **Cael Hub**, founded and led by CEO **Caesar Augustus E. Literatus**. It is a managed partnership ecosystem designed to help business dreamers launch their own branded businesses (such as ride-hailing, trucking, massage services, child safety, and entertainment) with managed technology and a 2% service share.",
            "provider": "Cael Verified Registry"
        })

    # Intercept 7: What is CAEL / CAEL HUB (Only when no specific application is targeted)
    has_specific_app_target = any(k in text_lower for k in [
        "truck", "freight", "cargo", "ride", "taxi", "massage", "spa",
        "timelock", "time lock", "safety zone", "child", "color game", "colorgame",
        "oncall", "loan", "lending", "microfinance"
    ])

    is_what_is_cael = (
        not has_specific_app_target and (
            text_lower in ["what is cael hub", "what is cael hub?", "what is cael", "what is cael?", "about cael", "about cael hub", "cael hub", "cael hub?", "cael", "cael?"] or
            "what is cael" in text_lower or
            "about cael" in text_lower or
            "what is cael hub" in text_lower or
            "tell me about cael" in text_lower or
            "cael ecosystem" in text_lower
        )
    )
    if is_what_is_cael:
        return JSONResponse({
            "ok": True,
            "answer": "**CAEL** stands for **\"Come And Earn Literally\"**! The platform is known interchangeably as **Cael** or **Cael Hub**.\n\nFounded and led by CEO **Caesar Augustus E. Literatus**, Cael is a managed technology partnership ecosystem designed to help entrepreneurs launch their own branded businesses (including ride-hailing, commercial freight trucking, spa wellness, and child safety) with zero upfront software development fees, managed cloud infrastructure, ongoing maintenance, and an agreed 2% service share.",
            "provider": "Cael Verified Registry"
        })

    # Intercept 8: Partnership Model, What You Get & The 6 Benefits + 2% Service Share Computation
    if any(k in text_lower for k in [
        "how our partnership works", "how the partnership works", "partnership work",
        "partnership model", "partnership", "what you get", "what is included", "whats included",
        "six benefits", "6 benefits", "partnership benefits"
    ]):
        return JSONResponse({
            "ok": True,
            "answer": """### ✦ How the Cael Hub Partnership Works: Your Business. Your Brand. Our Technology.

Launch your business under your own brand with a professionally managed mobile application while Cael Hub takes care of the technology, maintenance, and infrastructure behind it.

**THE 6 PARTNERSHIP BENEFITS:**
1. 🏷️ **Your Own Brand:** Use your company name, logo, custom color palette, and app icons with a personalized application.
2. 📱 **Your Own Business App:** Access a turnkey, deployment-ready enterprise mobile application without upfront software licensing or custom development fees.
3. 🔄 **Free Software Maintenance:** Enjoy ongoing updates, bug fixes, performance improvements, and eligible personalization at no additional development fee.
4. ☁️ **Managed Infrastructure:** We handle high-availability servers, database administration, cloud hosting, and security maintenance.
5. 🚀 **Google Play Store Management:** We manage technical store publishing, app listings, and eligible updates on Google Play Store so you can focus on serving customers.
6. 🛠️ **Ongoing Technical Support:** Dedicated assistance with application configuration, technical troubleshooting, and operational advice.

---

### ✦ Transparent Revenue Model: Your 2% Helps Keep Your Business Running

There are **zero upfront software development or licensing fees**. Instead, Cael Hub is sustained through an agreed, automatic **2% service share** on your business's collected service fees on eligible transactions.

**CRITICAL RULE:**
The 2% is calculated **ONLY on your business's collected service fee**, NOT on the customer's total gross transaction.

**THE OFFICIAL ₱1,000 BREAKDOWN EXAMPLE:**
- **Customer transaction amount:** ₱1,000
- **Your business's collected service fee (15%):** ₱150
- **Cael Hub's 2% share of that ₱150 fee:** **₱3**
- **Your business retains:** **₱147**

**WHAT YOUR ₱3 COVERS:**
1. High-availability cloud servers and database hosting.
2. Continuous bug fixes, performance upgrades, and security patches.
3. Google Play Store publishing and regular application updates.
4. Dedicated developer and technical infrastructure support.

The deduction is automatic, meaning you never receive unexpected server bills or developer invoices.

**You grow your business. We keep the technology running.**""",
            "provider": "Cael Verified Registry"
        })

    # Intercept 9: 2% Service Share, Pricing & The ₱3 Calculation Breakdown
    if any(k in text_lower for k in [
        "2%", "service share", "share", "percentage", "how much", "cost", "fee", "fees",
        "pricing", "calculation", "breakdown", "p3", "₱3", "150", "commission", "hidden cost"
    ]) and not any(k in text_lower for k in ["loan", "lending", "interest rate"]):
        return JSONResponse({
            "ok": True,
            "answer": """### ✦ Transparent Revenue Model: Your 2% Helps Keep Your Business Running

There are **zero upfront software development or licensing fees**. Instead, Cael Hub is sustained through an agreed, automatic **2% service share** on your business's collected service fees on eligible transactions.

**CRITICAL RULE:**
The 2% is calculated **ONLY on your business's collected service fee**, NOT on the customer's total gross transaction.

**THE OFFICIAL ₱1,000 BREAKDOWN EXAMPLE:**
- **Customer transaction amount:** ₱1,000
- **Your business's collected service fee (15%):** ₱150
- **Cael Hub's 2% share of that ₱150 fee:** **₱3**
- **Your business retains:** **₱147**

**WHAT YOUR ₱3 COVERS:**
1. High-availability cloud servers and database hosting.
2. Continuous bug fixes, performance upgrades, and security patches.
3. Google Play Store publishing and regular application updates.
4. Dedicated developer and technical infrastructure support.

The deduction is automatic, meaning you never receive unexpected server bills or developer invoices.""",
            "provider": "Cael Verified Registry"
        })

    # Intercept 10: How to Get Started / Process to Launch
    if any(k in text_lower for k in [
        "how to start", "how to get started", "how to launch", "how to apply",
        "process", "steps", "onboarding", "how can i start", "how do i start"
    ]):
        return JSONResponse({
            "ok": True,
            "answer": """### ✦ How to Get Started with Cael Hub: 5 Simple Steps

1. **Step 1: Select Your Business Application**
   Explore the Cael Hub directory (Ride-Hailing, Trucking, Massage & Wellness, Child Protection, etc.) and choose the business model that aligns with your goals.
2. **Step 2: Submit an Inquiry via the Contact Terminal**
   Reach out using our direct Contact Us terminal on the website or email **caelhub@gmail.com** with your proposed business name, target location, and preferred application.
3. **Step 3: Brand Personalization & Partnership Agreement**
   Provide your official company logo, brand name, and preferred color scheme under our standard 2% service-share agreement.
4. **Step 4: Managed Technical Setup & Google Play Store Publishing**
   Cael Hub provisions your cloud backend, configures the database, compiles your branded mobile application, and manages the Google Play Store publishing.
5. **Step 5: Launch, Operate & Scale Your Business**
   Onboard your drivers, service providers, or customers and start earning. You focus on operations and marketing while Cael Hub keeps the software running 24/7.""",
            "provider": "Cael Verified Registry"
        })

    # Intercept 11: Ownership & Source Code
    if any(k in text_lower for k in [
        "source code", "own the code", "code ownership", "own the software",
        "intellectual property", "white label", "white-label", "who owns"
    ]):
        return JSONResponse({
            "ok": True,
            "answer": """### ✦ Brand Ownership vs. Technical Management

- **What You Own (100%):** You own your business brand, your company name, your custom logo, your customer relationships, your local operations, and your business profits.
- **What Cael Hub Manages:** Cael Hub retains and maintains the underlying software codebase, cloud servers, databases, and security infrastructure.

**Why this model?**
Owning source code often requires hiring expensive full-time software engineers, managing server crashes, and paying heavy cloud bills. With Cael Hub, you enjoy enterprise-grade technology completely maintained by us, so you can focus entirely on growing your business.""",
            "provider": "Cael Verified Registry"
        })

    # Intercept 12: Specific Application Inquiries
    if any(k in text_lower for k in ["ride hailing", "ride-hailing", "ride hail", "motorcycle taxi", "taxi app"]) or (text_lower.startswith("ride") and "app" in text_lower):
        return JSONResponse({
            "ok": True,
            "answer": """### 🚗 Cael Ride Hailing App [Status: AVAILABLE • READY TO LAUNCH]
A turnkey mobile ecosystem featuring:
- **Passenger Booking App:** Upfront fare calculation, ride options, live GPS arrival tracking, and in-app wallet.
- **Driver Dispatch App:** Sub-second GPS route navigation, motorcycle taxi & courier parcel tiers, and automated commission payouts.
- **Driver Attendance & Biometrics:** Facial recognition clock-in and geofenced duty shifts.
- **Enterprise Operations Console:** Real-time fleet telematics, automated driver payroll, and 360° SOS safety beacons.
- **Personalization:** Fully branded with your company name, logo, custom color palette, and local fare tariffs.""",
            "provider": "Cael Verified Registry"
        })

    if any(k in text_lower for k in ["trucking", "freight", "cargo", "heavy cargo", "hauling", "truck delivery"]):
        return JSONResponse({
            "ok": True,
            "answer": """### 🚛 Cael Trucking Delivery App [Status: AVAILABLE • READY TO LAUNCH]
An enterprise commercial freight and logistics dispatch system featuring:
- **Fleet Dispatch Console:** Centralized scheduling for flatbeds, 10-wheelers, reefers, and container haulers.
- **Commercial Truck Routing:** Smart GPS navigation avoiding low bridge clearances and weight restrictions.
- **Digital BOL & Waybills:** Automated Bill of Lading generation and dynamic weight/rate calculators.
- **Compliance & Payroll:** Driver ELD logbooks, Hours of Service compliance, and per-km freight payouts.
- **Proof of Delivery (POD):** Digital e-signatures and container seal photo capture at delivery checkpoints.""",
            "provider": "Cael Verified Registry"
        })

    if any(k in text_lower for k in ["massage", "spa", "wellness app"]):
        return JSONResponse({
            "ok": True,
            "answer": """### 💆 Cael Massage Service App [Status: AVAILABLE • READY TO LAUNCH]
An on-demand spa and wellness platform supporting both home service visits and clinic appointments:
- **Dual Booking Modes:** Clients book home therapist visits or reserve clinic treatment rooms.
- **Therapist GPS Dispatch:** Live route tracking, estimated arrival countdown, and availability radar.
- **Treatment Menu:** Swedish, Deep Tissue, Shiatsu, Hot Stone, and Aromatherapy services.
- **Digital Health Screening:** Client contraindication intake forms and session review notes.
- **Payroll & Safety:** Therapist biometric clock-in, automated commission splits, 100% tip preservation, and masked private calling.""",
            "provider": "Cael Verified Registry"
        })

    if any(k in text_lower for k in ["timelock", "time lock", "phone overuse", "screen time", "parental control"]):
        return JSONResponse({
            "ok": True,
            "answer": """### ⏱️ Cael Child Time Lock [Status: AVAILABLE • READY TO LAUNCH]
A managed parental control mobile application designed to curb screen addiction without expensive monthly fees:
- **Parent-Child Pairing:** Instant 5-second QR code device handshake.
- **Bedtime & Sleep Schedules:** Automated curfew freeze locking devices during study and sleep hours.
- **Granular App Firewall:** Permits educational and school tools while strictly capping social media and games.
- **On-Demand Remote Freeze:** One-tap remote device lockdown directly from the parent handset.
- **Tamper-Proof Guard:** Hardware-level protection preventing children from uninstalling or bypassing restrictions.""",
            "provider": "Cael Verified Registry"
        })

    if any(k in text_lower for k in ["safety zone", "child zone", "geofence", "child safety", "safety zones"]):
        return JSONResponse({
            "ok": True,
            "answer": """### 🛡️ Child Safety Zones [Status: AVAILABLE • READY TO LAUNCH]
A real-time family geofencing and GPS radar protection application:
- **Virtual Geofence Zones:** Custom safe perimeters around home, school, tuition centers, and playgrounds.
- **Safe Route Corridors:** Monitored paths with instant alerts if a child deviates from their regular commute.
- **Perimeter Breach Sirens:** Real-time notification delivered to parent phones the second a boundary is crossed.
- **Silent SOS Distress Beacon:** Allows a child to trigger an alert with covert ambient audio streaming.
- **Anti-Theft Capture:** Silent automatic camera photo capture if a phone is tampered with or unauthorized touch is detected.""",
            "provider": "Cael Verified Registry"
        })

    if any(k in text_lower for k in ["color game", "colorgame", "two color"]):
        return JSONResponse({
            "ok": True,
            "answer": """### 🎲 Cael Two Color Game App [Status: IN DEVELOPMENT • TESTING]
An interactive community gaming arena featuring 3D physics color wheel spins (Red vs White):
- **Provably Fair RNG:** SHA-256 cryptographic proof ensuring total fairness and transparency.
- **Live Betting Engine:** Real-time round pool calculations and dynamic odds updates.
- **Instant Rewards:** Automated digital e-wallet payouts in under 15 seconds.
- **Community Engagement:** Live multiplayer chat, streak leaderboards, and celebration tickers.""",
            "provider": "Cael Verified Registry"
        })

    if any(k in text_lower for k in ["oncall", "locksmith", "plumber", "handyman", "home services"]):
        return JSONResponse({
            "ok": True,
            "answer": """### 🔧 Cael OnCall Service App [Status: IN DEVELOPMENT • TESTING]
An on-demand residential emergency home repair radar:
- **Sub-Minute Matching:** Connects homeowners to nearest verified locksmiths, appliance technicians, plumbers, and handymen.
- **Proximity GPS Radar:** Real-time technician dispatch with live arrival ETA.
- **Emergency Services:** 24/7 lockout rescue, appliance breakdown repair, and pipe leak fixes.
- **Transparent Pricing:** Standardized labor pricing with background-checked technician reviews.""",
            "provider": "Cael Verified Registry"
        })

    if any(k in text_lower for k in ["loan", "microfinance", "lending", "credit score", "fintech"]):
        return JSONResponse({
            "ok": True,
            "answer": """### 💳 Cael Loan Service App [Status: IN DEVELOPMENT • TESTING]
A digital microfinance and lending platform for capital lenders and credit operators:
- **AI Credit Scoring:** Automated risk underwriting and borrower credit evaluation.
- **60-Second Approvals:** Rapid mobile loan application workflows with digital KYC biometrics.
- **Direct Disbursement:** Automated disbursement to GCash, Maya, or bank accounts.
- **Repayment Automation:** Flexible installment schedules, loan calculators, and auto-debit reminders.""",
            "provider": "Cael Verified Registry"
        })

    # Dynamic LLM Provider Orchestration
    system_prompt = get_cael_system_prompt()
    groq_key = os.getenv("GROQ_API_KEY")
    gemini_key = os.getenv("GEMINI_API_KEY")

    # 1. Try Groq LPU API
    if groq_key:
        groq_models = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "qwen/qwen3.8-27b"]
        for model in groq_models:
            try:
                payload = json.dumps({
                    "model": model,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": prompt}
                    ],
                    "max_tokens": 350
                }).encode("utf-8")
                req = urllib.request.Request(
                    "https://api.groq.com/openai/v1/chat/completions",
                    data=payload,
                    headers={
                        "Authorization": f"Bearer {groq_key}",
                        "Content-Type": "application/json",
                        "User-Agent": "CaelHub/1.0"
                    }
                )
                with urllib.request.urlopen(req, timeout=6) as resp:
                    if resp.status == 200:
                        data = json.loads(resp.read().decode("utf-8"))
                        content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
                        if content and len(content.strip()) > 5:
                            cleaned = re.sub(r"caesarliteratus@gmail\.com", "caelhub@gmail.com", content, flags=re.I).strip()
                            return JSONResponse({"ok": True, "answer": cleaned, "provider": f"Groq ({model})"})
            except Exception as e:
                print(f"[Groq Warning] {model}: {e}")

    # 2. Try Gemini API
    if gemini_key:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_key}"
            payload = json.dumps({
                "contents": [{
                    "parts": [{"text": f"{system_prompt}\n\nUser Question: {prompt}"}]
                }]
            }).encode("utf-8")
            req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=7) as resp:
                if resp.status == 200:
                    data = json.loads(resp.read().decode("utf-8"))
                    candidates = data.get("candidates", [])
                    if candidates:
                        content = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                        if content and len(content.strip()) > 5:
                            cleaned = re.sub(r"caesarliteratus@gmail\.com", "caelhub@gmail.com", content, flags=re.I).strip()
                            return JSONResponse({"ok": True, "answer": cleaned, "provider": "Google Gemini"})
        except Exception as e:
            print(f"[Gemini Warning]: {e}")

    # 3. DuckDuckGo Instant Knowledge API
    try:
        ddg_url = f"https://api.duckduckgo.com/?q={urllib.parse.quote(prompt)}&format=json&no_html=1"
        req = urllib.request.Request(ddg_url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=3.5) as resp:
            if resp.status == 200:
                ddg_data = json.loads(resp.read().decode("utf-8"))
                abstract = (ddg_data.get("AbstractText") or "").strip()
                if abstract and len(abstract) > 25:
                    cleaned = re.sub(r"caesarliteratus@gmail\.com", "caelhub@gmail.com", abstract, flags=re.I)
                    return JSONResponse({
                        "ok": True,
                        "answer": cleaned,
                        "provider": "DuckDuckGo Knowledge Graph",
                        "heading": ddg_data.get("Heading")
                    })
    except Exception:
        pass

    # 4. Wikipedia Search API
    try:
        clean_search = re.sub(r"^(who is the|who is|what is the|what is|where is the|where is|when was|when is|tell me about|explain)\s+", "", prompt, flags=re.I).strip("?!. ")
        wiki_url = f"https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={urllib.parse.quote(clean_search)}&utf8=1&format=json"
        req = urllib.request.Request(wiki_url, headers={"User-Agent": "CaelHubAssistant/1.0"})
        with urllib.request.urlopen(req, timeout=3.5) as resp:
            if resp.status == 200:
                wdata = json.loads(resp.read().decode("utf-8"))
                results = wdata.get("query", {}).get("search", [])
                if results:
                    snippet = re.sub(r"<[^>]*>", "", results[0].get("snippet", "")).strip()
                    if len(snippet) > 25:
                        return JSONResponse({
                            "ok": True,
                            "answer": f"{results[0].get('title')}: {snippet}...",
                            "provider": "Wikipedia Knowledge Network"
                        })
    except Exception:
        pass

    # Fallback response
    return JSONResponse({
        "ok": True,
        "answer": "I have accessed the Cael Neural Core. For more information regarding our ecosystem, apps, or collaboration inquiries, feel free to contact us at **caelhub@gmail.com**...",
        "provider": "Cael Offline Fallback Matrix"
    })


# -----------------------------------------------------------------------------
# 4. Search Engine Optimization & Crawl Endpoints
# -----------------------------------------------------------------------------


@app.api_route("/sitemap.xml", methods=["GET", "HEAD"])
async def get_sitemap_xml():
    dist_file = os.path.join(DIST_DIR, "sitemap.xml")
    if os.path.isfile(dist_file):
        return FileResponse(dist_file, media_type="application/xml; charset=utf-8")
    root_file = os.path.join(BASE_DIR, "sitemap.xml")
    if os.path.isfile(root_file):
        return FileResponse(root_file, media_type="application/xml; charset=utf-8")
    return Response(content="<?xml version=\"1.0\" encoding=\"UTF-8\"?><urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\"><url><loc>https://caelpage.onrender.com/</loc></url></urlset>", media_type="application/xml; charset=utf-8")

# -----------------------------------------------------------------------------
# 5. Static Frontend File Router (Supports GET and HEAD for Social Crawlers)
# -----------------------------------------------------------------------------
def get_media_type(filepath: str):
    ext = os.path.splitext(filepath)[1].lower()
    mapping = {
        ".html": "text/html; charset=utf-8",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".webp": "image/webp",
        ".ico": "image/x-icon",
        ".svg": "image/svg+xml",
        ".css": "text/css; charset=utf-8",
        ".js": "application/javascript; charset=utf-8",
        ".json": "application/json; charset=utf-8",
        ".xml": "application/xml; charset=utf-8",
        ".txt": "text/plain; charset=utf-8",
    }
    return mapping.get(ext, None)

@app.api_route("/", methods=["GET", "HEAD", "POST", "OPTIONS"])
async def serve_root():
    dist_index = os.path.join(DIST_DIR, "index.html")
    if os.path.isfile(dist_index):
        return FileResponse(
            dist_index,
            media_type="text/html; charset=utf-8",
            headers={"Cache-Control": "public, max-age=300", "Accept-Ranges": "bytes"}
        )
    return FileResponse(
        os.path.join(BASE_DIR, "index.html"),
        media_type="text/html; charset=utf-8",
        headers={"Cache-Control": "public, max-age=300", "Accept-Ranges": "bytes"}
    )

@app.api_route("/{full_path:path}", methods=["GET", "HEAD"])
async def serve_static(full_path: str):
    clean_path = full_path.split("?")[0].strip("/")
    if not clean_path or clean_path == "":
        return await serve_root()

    # 1. Try in dist/ (Vite build output)
    dist_file = os.path.join(DIST_DIR, clean_path)
    if os.path.isfile(dist_file):
        media_type = get_media_type(dist_file)
        return FileResponse(
            dist_file,
            media_type=media_type,
            headers={"Cache-Control": "public, max-age=86400", "Accept-Ranges": "bytes"}
        )

    # 2. Try in public/
    public_file = os.path.join(BASE_DIR, "public", clean_path)
    if os.path.isfile(public_file):
        media_type = get_media_type(public_file)
        return FileResponse(
            public_file,
            media_type=media_type,
            headers={"Cache-Control": "public, max-age=86400", "Accept-Ranges": "bytes"}
        )

    # 3. Try in root project directory
    root_file = os.path.join(BASE_DIR, clean_path)
    if os.path.isfile(root_file):
        media_type = get_media_type(root_file)
        return FileResponse(
            root_file,
            media_type=media_type,
            headers={"Cache-Control": "public, max-age=86400", "Accept-Ranges": "bytes"}
        )

    # 4. Default fallback: serve index.html
    return await serve_root()


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    print(f"Starting CAEL HUB Python Server on http://0.0.0.0:{port}...")
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True)

