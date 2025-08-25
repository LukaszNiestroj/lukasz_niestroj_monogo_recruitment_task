# lukasz_niestroj_monogo_recruitment_task

Repository for Monogo recruitment task: https://github.com/LukaszNiestroj/lukasz_niestroj_monogo_recruitment_task#

## Prepare

### Local recommended tools:

- VS Code
- Git
- Node.js (version >16)

### Installation and setup

- git clone repo
- (optional) install VSC recommended plugins
- install dependencies: `npm install`
- setup Playwright with: `npx playwright install --with-deps chromium`

## Use

Run test:

```
- project_EN: npm run test:ploom_en
```

```
- project_PL: npm run test:ploom_pl
```

## Project Overview

This project contains a suite of end-to-end (E2E) and UI tests for the Ploom website, written using the Playwright framework. The goal of this project is to demonstrate skills in test automation, including handling complex UI interactions and applying common design patterns.

### Technical challenges and applied solutions

During the project's implementation, I encountered and addressed several challenges typical of modern web applications.

## Handling a dynamic animation and race conditions

- **Challenge**: The key challenge in this project was handling a loading animation that appears after cart interactions. This animation caused test flakiness due to dynamically generated CSS class names and its blocking nature on the UI.

- **Analysis:**: I conducted an in-depth analysis of this issue. I discovered that simple CSS injection methods were ineffective because the main application script (des-op-cart-checkout.js) dynamically added inline styles to the animation element, which have higher CSS specificity. Further network request analysis revealed that this same script was responsible for both the animation and the core logic of fetching and rendering the cart's content. This meant that blocking the script was not a viable option, as it would break the functionality under test. I identified the root cause as a classic race condition, where my test script's style injection was competing with the application script's inline styling.

- **Implemented solution**: I ultimately implemented a solution that proactively injects global styles using Playwright's page.addStyleTag function. I used a stable attribute selector ([class*="Loading-module-active"]) to hide the animation. This method significantly improved the stability and speed of the tests.

- **Awareness of Limitations**: I am aware that due to the aforementioned race condition, this solution may still, in rare cases, lead to test instability. This occurs if the application script wins the race and applies its styles after my stylesheet has been injected. This can result in occasional flakiness.

Contains UI tests for shop functionality. The timeout in `playwright.config.ts` is set to `120_000` to handle long-running animations and transitions in the cart and checkout pages. This ensures the tests wait for UI elements to become visible after cart actions. I've try use some function to block route of animation to make test more stability and faster but blocking animation also blocking visibility of cart list. That's why I've removed only animation to make test quicker but there is still chance to make some test Flaky.

- **shop.pom.spec.ts**: Uses the Page Object Model (POM) via `ShopPage` for maintainable and DRY test code. All shop interactions are encapsulated in the POM, making tests easier to read and update.

- **e2e_shopping.spec.ts**: Validates the complete user journey, from landing on the shop page to adding and removing products from the cart. This test simulates a real user's flow through the application.

### Page Object Model (POM) Pattern

- **Goal**: Ensure code reusability and ease of test maintenance.
- **Implementation**: I created a ShopPage class that encapsulates all locators and interaction methods for the shop page. The tests (shop.pom.spec.ts) operate on high-level methods, making them readable and resilient to changes in the HTML structure.

### End-to-End (E2E) Testing

- **Goal**: Verify the complete user journey.
- **Implementation**: The e2e_ploomEnShop.spec.ts and e2e_ploomPlShop.spec.ts test simulates a realistic scenario—from entering the site and navigating, to adding a product to the cart and subsequently removing it. This ensures the integrity of the shop's key functionalities.
