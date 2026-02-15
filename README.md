# CoreWell Ecommerce Website

This repository contains a minimal, mobile‑friendly HTML/CSS/JS implementation of the **CoreWell** wellness shots concept described in the provided briefing document.  The goal is to demonstrate how the brand story can be translated into a simple ecommerce storefront while leaving room for future enhancement.

## 📄 Structure and Branding

The design follows the narrative outlined in the PDF:

- **Homepage:** A hero headline (“Drink Your Skin Supplements”) introduces the product and calls to action (`Shop Wellness Shots` and `Start Your Glow Routine`).  The page highlights why CoreWell exists, presents three best‑selling products with *Add to Cart* buttons, explains how the shots work, introduces subscription options, celebrates African plant power and shares testimonials.  A final call to action invites visitors to shop, subscribe or join the community.
- **Shop:** Lists the three products with quick `Add to Cart` buttons and links to product detail pages.  It also summarises subscription plans.
- **Product pages:** Provide product‑specific information—benefits, ingredients, who it’s for and when to drink—along with an `Add to Cart` button.
- **Education (blog):** Lists educational articles (e.g. skin & gut connection, turmeric, ginger, bloating and African plant healing) that position the brand as an authority.
- **Stockist:** Invites retailers, gyms and spas to become stockists and includes a simple contact form.
- **Authentication:** A minimal login/register flow that stores a user record in `localStorage` (demo only) and toggles the Login/Logout link in the navigation.
- **Cart and Checkout:** A cart page displays selected items, allows quantity adjustments and removal, and links to a checkout form.  Checkout collects shipping details, summarises the order and simulates payment redirection.

Colours, typography and imagery follow the brief: deep green, turmeric yellow, beige and white with `Playfair Display` for headings and `Montserrat` for body text.  All pages respond to different screen sizes using CSS Flexbox/Grid and a mobile navigation toggle.

## 🔐 Login/Logout Approach

In this version the login and registration flows are wired up to **Firebase Authentication** using the modular v9 SDK.  This allows you to test a real authentication service without running your own backend.  The implementation is split into three parts:

1. **Configuration:** The file `js/firebase.js` initialises Firebase with a placeholder configuration.  Replace the `apiKey`, `authDomain`, `projectId` and related values with your own credentials from the Firebase console.  The module exports the `auth` and `db` instances along with helper functions like `signInWithEmailAndPassword` and `createUserWithEmailAndPassword`.
2. **Forms:** `login.html` and `register.html` contain simple forms.  The `js/auth.js` module attaches `submit` handlers to these forms.  On submission it calls the appropriate Firebase auth function and either redirects back to the homepage or to the login page.  Error messages from Firebase are surfaced via `alert()`.
3. **Navigation state:** The global script (`js/app.js`) listens to Firebase’s `onAuthStateChanged` event.  It updates the “Login” link in the header to read “Logout” when a user is signed in and attaches a delegated click handler to sign the user out.  If no user is signed in, the link defaults to “Login”.

 Cart data is stored in `localStorage` by default but is **synchronised to Firestore** whenever a user is logged in.  When the auth state changes, the site loads the user’s cart document from the `carts` collection and replaces the local cart.  After each add‑to‑cart action, the cart is written back to Firestore.  This allows users to preserve their cart across devices.  The checkout process also records orders in a `orders` collection and clears the cart document.  Subscriptions and stockist enquiries create documents in `subscriptions` and `stockistRequests` collections respectively.

> **Security note:** Never commit your Firebase secret keys to a public repository.  Create a `.env` file or use your deployment platform’s environment variable settings to store sensitive credentials.  The placeholder keys in this project will not work until you replace them with your own.

## 💳 Handling Card Information & Payments

To accept payments securely in South Africa you should **never process or store card details on your own server**.  Instead, integrate with a reputable payment gateway that offers a hosted checkout or client‑side SDK.  According to recent guidance on payment gateways in South Africa:

- **PayFast** is considered the gold standard for startups.  It supports card payments, Instant EFT (including Ozow), QR codes (SnapScan/Zapper) and buy‑now‑pay‑later options, with no monthly fee for basic use【12672365050464†L53-L62】.  PayFast’s hosted payment page means card details never touch your site; you redirect the customer to PayFast and receive an instant payment notification (IPN) on success.
- **Yoco** offers a clean, mobile‑friendly checkout and integrates easily if you already use their physical card machines【12672365050464†L57-L61】.  Its limitation is that it only supports cards【291355795303180†L142-L167】, so pairing it with an EFT provider may be necessary.
- **Peach Payments** and **Paystack** target high‑volume businesses with recurring billing and advanced reporting【12672365050464†L61-L69】, but they often charge a monthly fee.  Peach provides extremely high success rates; Paystack’s dashboard offers deep customer insights【12672365050464†L61-L69】.
- **Ozow** specialises in Instant EFT for customers who prefer bank transfers【291355795303180†L175-L198】.

**Implementation steps:**

1. **Sign up** with your chosen gateway (e.g. PayFast).
2. **Configure** your merchant account to obtain public and private keys.
3. **Generate the payment form** on your checkout page.  Most gateways provide an API or hosted form that accepts parameters such as amount, item description, order ID, return URL and merchant signature.
4. **Redirect customers** to the payment page.  After payment, the gateway redirects them to the `return_url` with payment status.
5. **Handle the notification** on your server.  For subscription products, choose a gateway that supports recurring payments (Peach or PayFast with tokenization)【12672365050464†L61-L69】.

The provided `checkout.html` simply simulates a payment flow.  Replace the `handleCheckout()` function with a call to your gateway’s API once you have your merchant details.

## 📱 Mobile Friendliness & Performance

Mobile commerce is crucial in South Africa—over 70 % of transactions happen on mobile devices【12672365050464†L98-L100】.  This site uses:

- A responsive CSS layout based on Flexbox and CSS Grid.
- The `<meta name="viewport" content="width=device-width, initial-scale=1.0">` tag to ensure proper scaling.
- A collapsible hamburger menu on small screens.
- Scalable images with `max-width` and object‑fit to maintain aspect ratio.
- Minimal JavaScript; the site runs without frameworks.

For performance optimisation, compress images, minify CSS/JS and enable caching on your server.  Use `alt` attributes and semantic HTML to improve accessibility and search engine optimisation (SEO).  Consider generating sitemap and Open Graph meta tags for improved sharing and AI summarisation.

## 🤖 AI Optimisation

“AI optimisation” usually refers to making your content accessible and understandable by search engines and generative models.  To support this:

- **Semantic HTML:** Use meaningful headings (`<h1>`–`<h3>`), lists (`<ul>`, `<ol>`) and descriptive labels.
- **Alt text:** Provide alt attributes on images so models understand the context.
- **Metadata:** Include `<title>`, `<meta name="description">` and Open Graph/Twitter meta tags for each page.
- **Structured data:** Consider adding JSON‑LD schema markup (e.g. `Product` and `Organization`) to help search engines index your products.
- **Fast load times:** AI models penalise slow pages; using a lightweight stack without heavy frameworks helps.

## 🌐 Hosting on domain.co.za

To put the site live on `yourdomain.co.za` you’ll need a hosting provider.  Many South African hosts offer domain registration and cPanel hosting (Hetzner, Afrihost, xneelo).  The process typically looks like this:

1. **Register your domain** through a registrar or the hosting company.
2. **Choose a hosting package.** For static sites, a basic shared‑hosting plan is sufficient.  Alternatively, use a static site host like **Netlify**, **Vercel** or **GitHub Pages** and point your domain there via DNS `A` or `CNAME` records.
3. **Upload your files.** If using cPanel, upload the contents of the `ecommerce-site` folder (everything inside, not the folder itself) to the `public_html` directory.  For Netlify/Vercel, push the site to a Git repository and connect the service.
4. **Configure HTTPS.** Ensure your site uses SSL.  Many hosts offer free **Let’s Encrypt** certificates.  Netlify and Vercel automatically provide HTTPS.
5. **Test and go live.** After DNS records propagate, access your domain to verify the site.  Keep your payment gateway credentials in environment variables or server‑side code rather than in the client.

## 🚧 Next Steps & Considerations

- **Backend:** Implement server‑side logic to manage users, orders, inventory and payment confirmations.  Use frameworks like Node.js/Express, Django or Laravel.
- **Database:** Store products, user profiles, orders and subscriptions in a database (e.g. MySQL, PostgreSQL or Firebase Firestore).
- **Security:** Hash and salt passwords, enforce HTTPS, validate inputs and comply with the **Protection of Personal Information Act (POPIA)** in South Africa.
- **Subscriptions:** For recurring orders, choose a gateway that supports tokenisation or recurring billing (Peach Payments or Paystack)【12672365050464†L61-L69】.
- **Scaling:** As traffic grows, consider a CDN and serverless functions to handle dynamic tasks (e.g. Netlify Functions).

This sample project demonstrates how you can translate a design brief into a functioning site with core ecommerce features.  Feel free to extend it further to meet your business needs.