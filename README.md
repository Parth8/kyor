# KYOR: peel the can

Website build for Kyor, a prebiotic soda from India (Kokum Cola and Chili Guava). It's a static site with no build step. Three.js loads from a CDN.

```bash
python3 -m http.server 8080   # then open http://localhost:8080
```

## The experience

There's no long scrolling page. The site is one object:

1. **The can.** A matte aluminium can rendered live in WebGL. Its label isn't a picture: it's composed in the browser from the brand's Photoshop live-type kits, using the kits' own positions, colours, layers and fonts (Montserrat, Barlow, Roboto). Drag it to spin it; the back carries nutrition, ingredients and a barcode. Behind it, two rows of giant type run the flavour name in opposite directions.
2. **Peel the label.** Hold the button, scroll down or swipe up. Every tile on the label lifts off the curved can, flattens, and deals itself out into an arc of cards around the can, while the decorative tiles drift far behind. Bubbles fizz out of the top.
3. **The label is the menu.** Each card opens a room, and the giant type shouts its name while you hover it:

| Tile on Kokum Cola | Tile on Chili Guava | Room |
| --- | --- | --- |
| Kokum fruit | Guava and chillies | **Origins**: a drag strip of real photographs, from Sindhudurg and Guntur to Prayagraj and your city |
| Runner | Runner | **Your day**: drag the runner along the day. The clock, the room's colour, the photo and the suggested flavour all change |
| Meditating figure | Mandala eye | **Inside**: counters that roll up, plus every ingredient and where it comes from |
| Archway | Ornate arch | **Sessions**: terrace events with RSVP links |
| KYOR band | KYOR wordmark | **Shop**: the crate builder (6, 12 or 24 cans, a Kokum/Guava mix slider, subscribe for 15% off) and the shelf |

4. **Flavour switch.** The can spins twice and swaps its label at the halfway point. The stage moves from maroon to forest green and every room follows.

The header also links straight to each room, and every room has its own URL (`#origins`, `#day`, `#inside`, `#sessions`, `#shop`). Esc or the browser's Back button closes a room. Without WebGL, the site shows the still can with plain room links. With reduced motion on, the peel is instant and nothing loops.

**Checkout** (`checkout.html`) takes contact details and a delivery address (the pincode fills in the city and the delivery date). Payment can be UPI, card, netbanking or cash on delivery, with promo codes and GST shown, and the page ends on an order confirmation.

## Files

- `index.html`: the stage, the rooms and the bag
- `css/kyor.css`: the palette from the label kits, the type, every room, plus tablet and phone layouts
- `js/scene.js`: the 3D can, the label composer, the peel morph (curved to flat), the card layouts, hover, drag and the bubbles
- `js/label-data.js`: both label layouts, translated from the kits' Photoshop build scripts
- `js/app.js`: hold-to-peel, the marquee, the rooms, the day slider, the crate builder and the bag
- `js/data.js`: **prices, products, the six moments of the day, counters and ingredients**
- `js/store.js`: the bag (localStorage), shared with the checkout
- `js/checkout.js`, `css/checkout.css`, `checkout.html`: the checkout
- `assets/kit/`: the label layers from the Photoshop kits, converted to WebP
- `assets/cans/`: still cans, used before WebGL loads and in the shop
- `assets/photos/`: photographs (credits below)

## Before launch

1. **Payments.** `takePayment()` in `js/checkout.js` simulates a payment, and the page says it's in test mode. To go live, create the order on a server and open Razorpay, Cashfree or Stripe from there.
2. **Sample content to confirm:**
   - Prices and the subscription discount.
   - Nutrition figures (note the label says 355 ml).
   - Sourcing facts: 140 families, the women-led collective, the Pune brewery.
   - Session dates and the `kyor.in` email addresses.
   - The `FIRSTSIP` promo code and the merch items.
3. **Health copy** stays with traditional use and plain nutrition. Check it against FSSAI advertising rules.

## Photo credits

| File | Photograph | Licence | Source |
| --- | --- | --- | --- |
| kokum-steel-plate.jpg | *Garcinia indica fruit*, Phadke09 | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Garcinia_indica_fruit.jpg |
| kokum-rinds-drying.jpg | *Garcinia indica rinds being dried*, Subray Hegde | CC BY 1.0 | https://commons.wikimedia.org/wiki/File:Garcinia_indica_rinds_being_dried.jpg |
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
