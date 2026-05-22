# Instagram Feed Setup

These steps need to be done by the person who manages the Binge Thinkers Instagram account (`@binge.thinkers`).

---

## What you need to do

### 1. Make sure the Instagram account is the right type

- Open Instagram on your phone
- Go to **Settings → Account**
- If you see **"Switch to Professional Account"**, tap it and choose **Business**
- If it already says "Business" or "Creator" — you're good

### 2. Connect Instagram to a Facebook Page

- Go to your Instagram profile
- Tap **Edit Profile**
- Under **Public Business Information**, tap **Page**
- Connect to a Facebook Page you manage (create one if needed — it can be empty)

### 3. Give the developer access to your Facebook Business account

- Go to [business.facebook.com](https://business.facebook.com)
- Click the gear icon ⚙ (Settings)
- Go to **People**
- Click **Add** and enter the developer's email
- Turn on **Manage Page** access for the page connected to Instagram

**That's it on your end.** The developer will handle the rest (creating the app, generating tokens, wiring up the feed).

---

## What the developer does next

After getting access:

1. Go to [developers.facebook.com](https://developers.facebook.com) → **Create App** → type **Business**
2. Add the **Instagram Graph API** product to the app
3. In the **Graph API Explorer**, generate a token with `instagram_basic` and `pages_show_list` permissions
4. Exchange the short-lived token for a long-lived one (valid for 60 days)
5. Find the Instagram Business Account ID and add both values to `.env`
