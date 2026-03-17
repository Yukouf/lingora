import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

const APP_NAME = "Lingora";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

export async function sendWelcomeEmail(to: string, name: string) {
  if (!resend) {
    console.warn("[Email] RESEND_API_KEY not set — skipping welcome email");
    return null;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `${APP_NAME} <${FROM_EMAIL}>`,
      to,
      subject: `Bienvenue sur ${APP_NAME} ! 🌍`,
      html: getWelcomeEmailHtml(name),
    });

    if (error) {
      console.error("[Email] Failed to send welcome email:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("[Email] Error sending welcome email:", err);
    return null;
  }
}

function getWelcomeEmailHtml(name: string): string {
  const firstName = name.split(" ")[0] || name;

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0f;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#12121a;border-radius:16px;border:1px solid rgba(255,255,255,0.06);overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 0;text-align:center;">
              <div style="display:inline-block;padding:12px 20px;background:linear-gradient(135deg,#5353ff,#a78bfa);border-radius:12px;margin-bottom:24px;">
                <span style="font-size:24px;font-weight:800;color:#fff;letter-spacing:-0.5px;">${APP_NAME}</span>
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:24px 32px 32px;">
              <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#f0f0f5;">
                Bienvenue ${firstName} !
              </h1>

              <p style="margin:0 0 20px;font-size:15px;color:#9ca3af;line-height:1.6;">
                Ton compte est pret. Tu peux maintenant commencer a apprendre une nouvelle langue avec une methode qui fonctionne vraiment.
              </p>

              <!-- Features -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="padding:12px 16px;background-color:rgba(255,255,255,0.03);border-radius:10px;border:1px solid rgba(255,255,255,0.05);margin-bottom:8px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-right:12px;font-size:20px;vertical-align:top;">📚</td>
                        <td>
                          <p style="margin:0;font-size:14px;font-weight:600;color:#e0e0e5;">Lecons immersives</p>
                          <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">Des situations reelles, pas des phrases robotiques</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr><td style="height:8px;"></td></tr>
                <tr>
                  <td style="padding:12px 16px;background-color:rgba(255,255,255,0.03);border-radius:10px;border:1px solid rgba(255,255,255,0.05);">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-right:12px;font-size:20px;vertical-align:top;">🤖</td>
                        <td>
                          <p style="margin:0;font-size:14px;font-weight:600;color:#e0e0e5;">Conversations IA</p>
                          <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">Pratique avec une IA dans des mises en situation</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr><td style="height:8px;"></td></tr>
                <tr>
                  <td style="padding:12px 16px;background-color:rgba(255,255,255,0.03);border-radius:10px;border:1px solid rgba(255,255,255,0.05);">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-right:12px;font-size:20px;vertical-align:top;">🧠</td>
                        <td>
                          <p style="margin:0;font-size:14px;font-weight:600;color:#e0e0e5;">Flashcards intelligentes</p>
                          <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">Repetition espacee basee sur la science cognitive</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://lingora.app"}/learn"
                 style="display:block;text-align:center;padding:14px 24px;background:linear-gradient(135deg,#5353ff,#6b6bff);color:#fff;font-size:15px;font-weight:600;text-decoration:none;border-radius:12px;margin-bottom:24px;">
                Commencer a apprendre
              </a>

              <p style="margin:0;font-size:13px;color:#4b5563;text-align:center;">
                Niveaux A1 et A2 gratuits — aucune carte bancaire requise
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.05);text-align:center;">
              <p style="margin:0;font-size:12px;color:#374151;">
                ${APP_NAME} — Apprends les langues autrement
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
