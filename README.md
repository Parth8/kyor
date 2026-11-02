# KYOR: prebiotic soda from India

Website build for Kyor. It's a static site with no build step. `index.html` is the home page and shop, and `checkout.html` is the payment page.

```bash
python3 -m http.server 8080   # then open http://localhost:8080
```

## The idea

The two flavours are rituals most Indians already know: a glass of kokum after a heavy coastal lunch, and guava from the school cart rubbed with chilli and salt. **The page is coloured by what is in the can.** Each chapter is one flat field taken from the product: kokum rind (oxblood), guava flesh (pink), Guntur chilli (red), the can's sage, and matte aluminium. Midway through, the can holds still while those colours wipe up behind it, one ingredient at a time.

How the direction was chosen:
- **Awwwards Food & Drink sites:** Morpho, Vibe, Yaas, Agrumea, Lajoya and Delta Cafés. The common thread is a large real product, real photography and flat colour fields.
- **The `taste-skill` study of 247 award sites:** I used its "colour chapters" direction with the "object, large" hero.
- **Its house rules:** no eyebrow labels, no monospace, no 01/02 numbering, no hairlines, gradients or shadows, and two typefaces at most.
- **The type:** Besley, a fat Clarendon like the can's wordmark (the old-school face), with Switzer, a modern grotesk.
- **Language:** everything is in English. Indian context comes from places, ingredients and photographs, not from script.

## What's on the page

| Section | What it does |
| --- | --- |
| Hero | The can, large, on its fruit's colour. Switching between Kokum Cola and Chili Guava recolours the hero and swaps the can. |
| Flavours you grew up with | The two rituals, told with real photographs. |
| What goes in the can | A held scroll scene: the can stays put and five colour fields wipe through, each with one ingredient fact. |
| Per 350 ml can | Nutrition, as a plain table. |
| From the farm to your fridge | A drag row of places: Sindhudurg, Guntur, Prayagraj, Pune, your city. |
| Where it fits in your day | Six moments from 6:40 am to 10:15 pm. Hovering or tapping a row shows its photograph. |
| Build a crate | **The interactive part.** Pick 6, 12 or 24 cans, slide the Kokum/Guava mix, choose one-off or a subscription, and watch the crate and price update. |
| Come to a Kyor session | The offline community: terrace events with RSVP links. |
| Checkout | Contact, delivery (the pincode fills in the city and the delivery date), payment by UPI, card, netbanking or cash on delivery, promo code, GST, and a confirmation screen. |

Accessibility:
- Native scrolling everywhere: no scroll hijacking and no custom cursor.
- With reduced motion or without JavaScript, the held scene becomes five stacked chapters and nothing stays hidden.
- Every control works from the keyboard.

## Files

- `index.html`, `checkout.html`: the two pages
- `css/site.css`: design tokens (colour fields, type scale, spacing) and every section, with tablet and phone layouts
- `css/checkout.css`: the checkout
- `js/data.js`: **prices, products and the flavour copy**
- `js/store.js`: the bag, kept in the browser's localStorage and shared by both pages
- `js/site.js`: flavour switch, held scene, origins row, day index, crate builder, bag
- `js/checkout.js`: validation, totals and a test-mode payment
- `assets/cans/`: the cans, cut out of the tested renders in `assets/renders/`
- `assets/photos/`: photographs (credits below)

## Before launch

1. **Payments.** `takePayment()` in `js/checkout.js` simulates a successful payment, and the page says it's in test mode. To go live, create the order on a server and open Razorpay, Cashfree or Stripe from there. Card details should only ever be entered on the provider's page.
2. **Product photography.** The cans are cut from the 1024 px renders, so they look soft at hero size. A 3000 px or larger render or photograph of each can, on a transparent background, will fix that.
3. **Sample content to confirm or replace:**
   - Prices: ₹540 for a 6-pack, ₹1,020 for 12, ₹1,920 for 24, and 15% off subscriptions.
   - Nutrition figures and the ingredient lists.
   - Sourcing facts: 140 farming families, the women-led chilli collective, 24-hour pressing, a Pune brewery making 4,000 cans a day.
   - Delivery promises and the ₹3,000 cash-on-delivery limit.
   - Session dates and neighbourhoods.
   - The `hello@` and `sessions@kyor.in` addresses.
   - The `FIRSTSIP` promo code.
   - The merch items.
4. **Health copy** is kept to traditional use and plain nutrition. Check it against FSSAI advertising rules.

## Photo credits

Every photo is downloaded into `assets/photos/` and credited in the site footer. None of them shows KYOR's own farms or staff. They show the world the drink comes from.

| File | Photograph | Licence | Source |
| --- | --- | --- | --- |
| kokum-steel-plate.jpg | *Garcinia indica fruit*, Phadke09 | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Garcinia_indica_fruit.jpg |
| kokum-rinds-drying.jpg | *Garcinia indica rinds being dried*, Subray Hegde | CC BY 1.0 | https://commons.wikimedia.org/wiki/File:Garcinia_indica_rinds_being_dried.jpg |
| kokum-sugar-jar.jpg | *Kokam fruit recipe with sugar*, Phadke09 | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Kokam_Fruit_Recipe_with_Sugar_Garcinia_indica_fruit.jpg |
| guava-hand.jpg | Samee Anderson | Unsplash Licence | https://unsplash.com/photos/eiCzR_AVHJQ |
| chilli-newspaper.jpg | Shubha Gambhir | Unsplash Licence | https://unsplash.com/photos/47gzK__lX30 |
| chilli-farmer.jpg | surya kumar chintapula | Unsplash Licence | https://unsplash.com/photos/ztxMS2tLorw |
| chilli-tarps.jpg | Anudeep | Unsplash Licence | https://unsplash.com/photos/ey1mpf2Teh0 |
| konkan-fort-window.jpg | Atharva Whaval | Unsplash Licence | https://unsplash.com/photos/LWkkbHH_sP8 |
| sherbet-stall.jpg | atelierbyvineeth | Unsplash Licence | https://unsplash.com/photos/9ykib1OvFfE |
| chai-stall.jpg | Rudra Gupta | Unsplash Licence | https://unsplash.com/photos/03p5R9-lXEs |
| friends-beach.jpg | Debabrata Patra | Unsplash Licence | https://unsplash.com/photos/s_Z3ePnd0dU |
| friends-phone.jpg | Karthik Balakrishnan | Unsplash Licence | https://unsplash.com/photos/Y4zNMW3pQAs |
| run-monsoon.jpg | Zoshua Colah | Unsplash Licence | https://images.unsplash.com/photo-1753443278948-60d73706417c |
| marine-drive.jpg | Zoshua Colah | Unsplash Licence | https://images.unsplash.com/photo-1753806389212-d017f9170074 |
| station-cst.jpg | Anirudh | Unsplash Licence | https://images.unsplash.com/photo-1665206221704-624dd27939ad |
| terrace-sunset.jpg | Saravanan Murugan | Unsplash Licence | https://images.unsplash.com/photo-1761465863322-bbe8a90ce03e |
| guava-market.jpg | Sagar Pujari | Pexels Licence | https://www.pexels.com/photo/36478363/ |
