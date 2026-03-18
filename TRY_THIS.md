# Try Sentinel in ~2 minutes

1. **Sign up** at your app URL and open **Dashboard** - you’ll see demo pipeline data (or your own if you already have deals).

2. **Connect CRM**  
   Go to **Settings** → **Integrations** (or use **Getting started** on the dashboard).  
   Connect **HubSpot** (private app token) or **Salesforce** (instance URL + access token), then click **Sync**.

3. **Slack (optional)**  
   On the same **Integrations** tab, scroll to **Slack**, add an Incoming Webhook.  
   Enable **CRM sync summary** to get a Slack message after each HubSpot/Salesforce sync (deals updated + high-risk count).

4. **AI**  
   Open **AI** in the sidebar → ask e.g. _“Which deals need attention?”_ or _“Why is my pipeline at risk?”_

5. **Webhooks & team**  
   **Settings → Webhooks** for outbound events; **Settings → Team** for invites.

**Deep links**

- Integrations: `/settings?tab=integrations`
- Slack-focused: `/settings?tab=integrations&panel=slack` (same tab; scrolls to Slack)

**Billing note**  
The Billing tab supports paid plans, and upgrades are handled through PayPal checkout.
