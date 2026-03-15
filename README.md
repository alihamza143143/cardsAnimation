# Card Fan Animation — Shopify Setup Guide

## What You Get

An animated fan of 13 playing cards (King → Ace) with:

- Smooth open/close cycle animation
- Mouse-follow tilt effect
- Hover glow + shine sweep on individual cards
- Optional grid gradient glow in the top-right corner
- Fully responsive (desktop, tablet, mobile)
- Touch support on mobile devices

---

## Setup Instructions

### Step 1 — Upload Card Images

1. Go to **Shopify Admin → Settings → Files**
2. Upload all 13 card images (King, Queen, Jack, Ten, Nine, Eight, Seven, Six, Five, Four, Three, Two, Ace)
3. Upload the **gradient grid image** (`gradient (1).png`) if you want the background glow effect

### Step 2 — Add Theme Files

Upload these files to your Shopify theme:

| File | Destination in Theme |
|------|---------------------|
| `sections/card-fan-animation.liquid` | `sections/card-fan-animation.liquid` |
| `assets/card-fan.css` | `assets/card-fan.css` |
| `assets/card-fan.js` | `assets/card-fan.js` |

**How to upload:**

1. Go to **Shopify Admin → Online Store → Themes**
2. Click **"..." → Edit code** on your active theme
3. Under **Sections**, click **Add a new section** → name it `card-fan-animation` → paste the contents of `card-fan-animation.liquid`
4. Under **Assets**, click **Add a new asset** → upload `card-fan.css` and `card-fan.js`

### Step 3 — Add Section to a Page

**Option A — Theme Editor (recommended):**

1. Go to **Online Store → Themes → Customize**
2. Navigate to the page where you want the animation
3. Click **Add section** → search for **"Card Fan Animation"**
4. The section will appear — now configure the card images (see Step 4)

**Option B — Template code:**

Add this line in any template file where you want the section:

```liquid
{% section 'card-fan-animation' %}
```

### Step 4 — Configure Card Images

1. In the **Theme Editor**, click on the **Card Fan Animation** section
2. Under **Background**, upload the grid gradient image for the top-right glow (optional)
3. Under **Card Images**, assign each card image in order:
   - Card 1 = King (leftmost)
   - Card 2 = Queen
   - Card 3 = Jack
   - Card 4–12 = Ten through Two
   - Card 13 = Ace (rightmost)
4. Click **Save**

---

## Responsive Behavior

The animation automatically adapts to all screen sizes:

| Screen | Card Size | Fan Spread |
|--------|-----------|------------|
| Desktop (1024px+) | 90–160px | 160° |
| Tablet (640–1023px) | 65–110px | 140° |
| Mobile (<640px) | 48–78px | 110° |

Touch support is built in — tap a card to highlight it, tap again or elsewhere to dismiss.

---

## Standalone Preview

Open `index.html` directly in a browser to preview the animation without Shopify. Card images must be in the same folder.
