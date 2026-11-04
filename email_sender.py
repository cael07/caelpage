import os
import sys
import json
import urllib.request
import urllib.error
import smtplib
from email.message import EmailMessage

# Load .env manually
def load_env_file():
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    key = key.strip()
                    val = val.strip().strip('"').strip("'")
                    if key not in os.environ or not os.environ[key]:
                        os.environ[key] = val

load_env_file()

def send_verification_email(to_email: str, code: str):
    """
    Sends verification email via Brevo API as requested.
    """
    api_key = os.getenv("BREVO_API_KEY")
    sender_email = os.getenv("BREVO_SENDER_EMAIL") or "caesarliteratus@gmail.com"
    sender_name = os.getenv("BREVO_SENDER_NAME") or "Verification"

    url = "https://api.brevo.com/v3/smtp/email"
    payload = {
        "sender": {
            "email": sender_email,
            "name": sender_name
        },
        "to": [{"email": to_email}],
        "subject": "Verify your account",
        "htmlContent": f"""
            <h2>Verify your account</h2>
            <p>Your verification code is:</p>
            <h1>{code}</h1>
            <p>This code expires in 10 minutes.</p>
        """
    }

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "accept": "application/json",
            "api-key": api_key or "",
            "content-type": "application/json"
        },
        method="POST"
    )

    with urllib.request.urlopen(req, timeout=12) as response:
        return response.read().decode("utf-8")


def send_via_brevo(name: str, email: str, subject: str, message: str, to_email: str):
    api_key = os.getenv("BREVO_API_KEY")
    if not api_key:
        raise Exception("BREVO_API_KEY is not set in environment or .env")

    sender_email = os.getenv("BREVO_SENDER_EMAIL") or "caesarliteratus@gmail.com"
    sender_name = os.getenv("BREVO_SENDER_NAME") or "Cael Hub"

    url = "https://api.brevo.com/v3/smtp/email"
    payload = {
        "sender": {
            "email": sender_email,
            "name": f"{name} ({sender_name})"
        },
        "to": [
            {
                "email": to_email,
                "name": "Caesar Literatus"
            }
        ],
        "replyTo": {
            "email": email,
            "name": name
        },
        "subject": f"[Cael Hub Contact] {subject}",
        "htmlContent": f"""
            <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 24px; border-radius: 8px;">
              <h2 style="color: #00f3ff; margin-top: 0; border-bottom: 1px solid #334155; padding-bottom: 12px;">
                ✉️ New Contact Dispatch from Cael Hub
              </h2>
              <p><strong>Sender Name:</strong> {name}</p>
              <p><strong>Sender Email:</strong> <a href="mailto:{email}" style="color: #38bdf8;">{email}</a></p>
              <p><strong>Subject:</strong> {subject}</p>
              <hr style="border: none; border-top: 1px solid #334155; margin: 16px 0;" />
              <p><strong>Message:</strong></p>
              <div style="background-color: #1e293b; color: #e2e8f0; padding: 16px; border-radius: 6px; white-space: pre-wrap; line-height: 1.6; border: 1px solid #475569;">{message}</div>
              <br/>
              <p style="font-size: 11px; color: #94a3b8; margin-bottom: 0;">Dispatched securely via Brevo API from Cael Hub Interface.</p>
            </div>
        """
    }

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "accept": "application/json",
            "api-key": api_key,
            "content-type": "application/json"
        },
        method="POST"
    )

    with urllib.request.urlopen(req, timeout=12) as response:
        return json.loads(response.read().decode("utf-8"))


def send_via_smtp(name: str, email: str, subject: str, message: str, to_email: str):
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "465"))
    smtp_user = os.getenv("SMTP_USER", "caesarliteratus@gmail.com")
    smtp_pass = os.getenv("SMTP_PASS", "tfxd ifpc zwco lmyf")

    msg = EmailMessage()
    msg["Subject"] = f"[Cael Hub Contact] {subject}"
    msg["From"] = f"{name} via Cael Hub <{smtp_user}>"
    msg["To"] = to_email
    msg["Reply-To"] = f"{name} <{email}>"

    plain_content = f"""New Contact Transmission from Cael Hub:
------------------------------------------
Sender Name:  {name}
Sender Email: {email}
Subject:      {subject}

Message:
{message}

------------------------------------------
Sent from Cael Hub Interface.
"""
    msg.set_content(plain_content)

    html_content = f"""
    <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 24px; border-radius: 8px;">
      <h2 style="color: #00f3ff; margin-top: 0; border-bottom: 1px solid #334155; padding-bottom: 12px;">
        ✉️ New Contact Dispatch from Cael Hub
      </h2>
      <p style="font-size: 14px;"><strong>Sender Name:</strong> {name}</p>
      <p style="font-size: 14px;"><strong>Sender Email:</strong> <a href="mailto:{email}" style="color: #38bdf8;">{email}</a></p>
      <p style="font-size: 14px;"><strong>Subject:</strong> {subject}</p>
      <hr style="border: none; border-top: 1px solid #334155; margin: 16px 0;" />
      <p style="font-size: 14px;"><strong>Message:</strong></p>
      <div style="background-color: #1e293b; color: #e2e8f0; padding: 16px; border-radius: 6px; white-space: pre-wrap; line-height: 1.6; border: 1px solid #475569; font-size: 14px;">{message}</div>
      <br/>
      <p style="font-size: 11px; color: #94a3b8; margin-bottom: 0;">Dispatched securely via SMTP_SSL (port {smtp_port}) to {to_email} from Cael Hub Interface.</p>
    </div>
    """
    msg.add_alternative(html_content, subtype="html")

    if smtp_port == 465:
        with smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=15) as server:
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)
    else:
        with smtplib.SMTP(smtp_host, smtp_port, timeout=15) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)
    return True


def dispatch_contact_email(name: str, email: str, subject: str, message: str):
    to_email = os.getenv("CONTACT_DESTINATION_EMAIL") or "caelhub@gmail.com"

    # Direct verified Gmail SMTP delivery using port 465 SSL
    try:
        send_via_smtp(name, email, subject, message, to_email)
        return {
            "ok": True,
            "method": "Gmail SMTP_SSL (Port 465)",
            "message": f"Successfully delivered email to {to_email}!"
        }
    except Exception as e:
        # Fallback to Brevo API if key is present
        if os.getenv("BREVO_API_KEY"):
            try:
                send_via_brevo(name, email, subject, message, to_email)
                return {"ok": True, "method": "Brevo API", "message": f"Delivered via Brevo to {to_email}"}
            except Exception as be:
                print(f"[Brevo Fallback Error]: {be}", file=sys.stderr)
        return {"ok": False, "error": str(e)}


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--dispatch":
        input_data = json.loads(sys.stdin.read())
        result = dispatch_contact_email(
            input_data.get("name", ""),
            input_data.get("email", ""),
            input_data.get("subject", ""),
            input_data.get("message", "")
        )
        print(json.dumps(result))
    else:
        # Self-test
        print("Testing email dispatch to caelhub@gmail.com...")
        test_res = dispatch_contact_email(
            "Cael Hub Matrix",
            "support@caelhub.ai",
            "Live Delivery Verification",
            "This confirms live email delivery directly to your inbox."
        )
        print(json.dumps(test_res, indent=2))
