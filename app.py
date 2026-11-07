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
        "- Mission: 100% free white-label ecosystem of ready-to-launch enterprise mobile applications.\n"
    )
    try:
        if os.path.exists(KNOWLEDGE_FILE):
            with open(KNOWLEDGE_FILE, "r", encoding="utf-8") as f:
                k = json.load(f)
                apps = k.get("applications", [])
                apps_list = "\n".join([
                    f"• {a.get('name')} ({a.get('category')}): {a.get('description')} (Features: {', '.join((a.get('key_features') or [])[:4])})"
                    for a in apps
                ])
                knowledge_summary = f"""Official Cael Knowledge Base:
- System / Platform Name: Cael (also referred to as Cael Hub or CAEL). Both "Cael" and "Cael Hub" refer to this exact same platform.
- Meaning of CAEL: CAEL stands for "Come And Earn Literally".
- CEO & Founder: Caesar Augustus E. Literatus.
- Location: Bulacan, Philippines.
- Official Receiving / Contact Email: caelhub@gmail.com (Direct Contact Us terminal on the Cael website).
- Mission: {k.get('mission', '')}
- Vision: {k.get('vision', '')}
- Official Applications in Cael Ecosystem:
{apps_list}
- Contact / Inquiries: caelhub@gmail.com.
"""
    except Exception as e:
        print(f"Error loading cael_knowledge.json: {e}")

    return f"""Your name is CAELIN. Never call yourself "CAEL AI" or "CAELIN AI". Your name is strictly CAELIN, do not attach the word "AI" to your name. You are the intelligent assistant powering Cael (also known as Cael Hub).
Always answer accurately, helpfully, and concisely based on this official Cael Knowledge Base:
{knowledge_summary}
Directives:
1. Identity: Your name is CAELIN. When asked "who are you" or "what is your name", always introduce yourself as CAELIN: "I am CAELIN, the intelligent assistant powering Cael (also known as Cael Hub, which stands for \"Come And Earn Literally\")..." Never say "CAEL AI" or "CAELIN AI".
2. System Name: The system name is Cael or Cael Hub (interchangeable).
3. Meaning of CAEL: Whenever introducing or explaining Cael or Cael Hub, or when asked "What is CAEL HUB?", "What is Cael?", or what CAEL means or stands for, ALWAYS state clearly and prominently that CAEL stands for "Come And Earn Literally".
4. Founder & CEO: When asked who is the founder, CEO, creator, or developer of Cael or Cael Hub, state clearly that the CEO and Founder is Caesar Augustus E. Literatus.
5. Location & Inquiries: When asked about Cael Hub, Cael, or where Cael / Cael Hub is located or its location, state clearly: "Cael Hub is located in Bulacan, Philippines. For more information, feel free to contact us at caelhub@gmail.com." When asked about your own location as CAELIN (e.g. "where are you located", "where do you live"), clarify that as an AI assistant you do not have a physical location or body and exist in the cloud/digital matrix.
6. Contact Email: The official receiving and contact email for Cael Hub is caelhub@gmail.com. Never give or output caesarliteratus@gmail.com.
7. Applications: When asked about Cael's apps, confirm enthusiastically that Cael provides these turnkey applications for free with 0 licensing fees.
8. For non-Cael inquiries (science, math, world facts, personalities, sports), answer factually and directly in 2-3 sentences.
9. Always conclude every response smoothly with " ..." (a single space followed by three dots)."""


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

    # Intercept 7: What is CAEL / CAEL HUB
    is_what_is_cael = (
        text_lower in ["what is cael hub", "what is cael hub?", "what is cael", "what is cael?", "about cael", "about cael hub", "cael hub", "cael hub?", "cael", "cael?"] or
        "what is cael" in text_lower or
        "about cael" in text_lower or
        "what is cael hub" in text_lower or
        "tell me about cael" in text_lower or
        "cael apps" in text_lower
    )
    if is_what_is_cael:
        return JSONResponse({
            "ok": True,
            "answer": "**CAEL** stands for **\"Come And Earn Literally\"**! The platform is known interchangeably as **Cael** or **Cael Hub**.\n\nFounded and led by CEO **Caesar Augustus E. Literatus**, Cael is a 100% free, zero-fee white-label ecosystem of ready-to-launch enterprise mobile and web applications—engineered to empower entrepreneurs and business dreamers to launch their own branded businesses (including ride-hailing, parental control, child safety radar, heavy cargo trucking, on-demand massage wellness, and interactive gaming) with sub-second GPS telematics, automated driver/staff payroll, and zero ongoing licensing fees.",
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
@app.api_route("/robots.txt", methods=["GET", "HEAD"])
async def get_robots_txt():
    dist_file = os.path.join(DIST_DIR, "robots.txt")
    if os.path.isfile(dist_file):
        return FileResponse(dist_file, media_type="text/plain; charset=utf-8")
    root_file = os.path.join(BASE_DIR, "robots.txt")
    if os.path.isfile(root_file):
        return FileResponse(root_file, media_type="text/plain; charset=utf-8")
    return Response(
        content="User-agent: facebookexternalhit\nAllow: /\n\nUser-agent: Facebot\nAllow: /\n\nUser-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: https://caelpage.onrender.com/sitemap.xml\n",
        media_type="text/plain; charset=utf-8"
    )

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

@app.api_route("/", methods=["GET", "HEAD"])
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

