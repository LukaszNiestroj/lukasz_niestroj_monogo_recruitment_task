# lukasz_niestroj_monogo_recruitment_task

Repository for Monogo recruitment task

## Project Overview

This project contains Playwright end-to-end and UI tests for the Ploom shop website. It demonstrates robust test automation, including:

- Handling UI animations and overlays
- Using the Page Object Model (POM) for maintainability
- End-to-end user journey validation

## Test Files

- **shop.spec.ts**: Contains UI tests for shop functionality. The tests use `setTimeout(120_000)` to handle long-running animations and transitions in the cart and checkout pages. This ensures the tests wait for UI elements to become visible after cart actions.

- **shop.pom.spec.ts**: Uses the Page Object Model (POM) via `ShopPage` for maintainable and DRY test code. All shop interactions are encapsulated in the POM, making tests easier to read and update.

- **e2e_shopping.spec.ts**: Validates the complete user journey, from landing on the shop page to adding and removing products from the cart. This test simulates a real user's flow through the application.

## Key Concepts

- **Timeouts for Animations**: The cart and checkout pages have UI animations that may delay element visibility. Tests use extended timeouts to ensure reliability.
- **POM (Page Object Model)**: The `ShopPage` class abstracts shop page actions, improving test maintainability and reducing code duplication. See `shop.pom.spec.ts` for usage.
- **End-to-End Testing**: The e2e test covers the entire shopping workflow, ensuring all integrated features work as expected for a real user.

## Running Tests

To run all tests:

```sh
npx playwright test
```

To run a specific test file:

```sh
npx playwright test tests/shop.pom.spec.ts
```

## Notes

- If tests fail due to timeouts, check for UI overlays or banners that may block interactions. The tests are designed to handle these, but site changes may require selector updates.

---

For questions or improvements, please contact the repository owner.
