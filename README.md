# MoriPal

### Smarter Capital. Better Healthcare Businesses.

MoriPal is an AI-powered financial intelligence platform designed for healthcare business owners, founders, and finance managers. It helps businesses understand expenses, evaluate capital allocation decisions, monitor financial performance, and manage supplier payments through an integrated workspace.

Built for the **PayPal AI Hackathon 2026**, MoriPal combines AI-assisted financial analysis with PayPal-powered payment workflows to help healthcare businesses make more informed financial decisions.

> **Demo data notice:** MoriPal currently uses fictional NovaCare Clinics financial data in USD. All business figures and scenarios are illustrative and do not represent a real healthcare business.

## The Problem

Healthcare businesses must manage operating expenses, maintain healthy cash flow, and make important capital allocation decisions. Financial information can be spread across different systems, making it difficult for business owners to understand spending patterns and evaluate investment opportunities.

MoriPal addresses this challenge by bringing financial visibility, AI-assisted analysis, and business payment workflows into one platform.

## The Solution

MoriPal provides six main modules:

- **Dashboard:** Monitor revenue, expenses, cash flow, available capital, and financial performance indicators.
- **Expense Management:** Explore and manage expense records using AG Grid's interactive data grid, including sorting and filtering.
- **Capital Decisions:** Evaluate investment scenarios, compare potential returns, and understand their impact on available capital.
- **AI Advisor:** Ask business-finance questions and receive AI-assisted analysis based on available financial records.
- **Transactions:** View business transactions and manage eligible supplier payments through PayPal Sandbox checkout.
- **Business Profile:** Maintain business information used throughout the financial workspace.

## PayPal Integration

MoriPal integrates the **PayPal Developer Platform Sandbox** to demonstrate a business supplier-payment workflow.

The integration supports:

- PayPal Sandbox checkout for eligible supplier invoices.
- Buyer approval through PayPal.
- Payment capture and verification.
- Transaction status updates after successful payment.
- Payment amount and currency validation.
- Fresh PayPal orders for new payment attempts.

Payment status is updated only after successful capture verification. The demonstration uses Sandbox accounts and does not process real payments.

## AI Integration

MoriPal uses AI to help business owners interpret available financial information and explore potential business decisions.

The AI Advisor can:

- Analyse available revenue and expense information.
- Interpret cash flow and capital availability.
- Identify financial patterns and potential risks.
- Compare business investment scenarios.
- Provide contextual recommendations based on saved business records.

AI-generated insights are decision-support information, not audited financial statements or professional financial advice.

## Technology Stack

- **Frontend:** React 19, TypeScript
- **Application Framework:** TanStack Start
- **Styling:** Tailwind CSS
- **Database and Backend:** Supabase, PostgreSQL and Drizzle ORM
- **AI:** AI SDK with the configured model provider
- **Data Grid:** AG Grid
- **Payment Integration:** PayPal Developer Platform Sandbox
- **Testing:** Vitest and Testing Library
- **Build Tool:** Vite

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed
- Git installed
- Access to the required backend and AI service credentials

### Installation

Clone the repository:

```bash
git clone https://github.com/bhadmasreea20/MoriPal-Hackathon.git
cd MoriPal-Hackathon
```

Install dependencies:

```bash
bun install
```

### Environment Configuration

Create a local `.env` file using `.env.example` as a reference.

Configure the required environment variables for the Supabase backend and any additional services used by the application.

Keep private credentials in local environment files or secure secret management systems. Never commit `.env` or private API keys.

### Run the Application

Start the development server:

```bash
bun run dev
```

### Run Tests

Execute the automated test suite:

```bash
bun run test
```

## Demo

**Live Application:**  
https://moripal.lovable.app

**Video Demonstration:**  
(https://youtu.be/itsFSVlXYJE?si=a5UCxFkdCmyYgNt4)

## Security

- Private API credentials and secrets must remain server-side.
- Environment files containing secrets must not be committed.
- Database access should be protected through appropriate access controls and Row Level Security policies.
- PayPal Sandbox credentials are used for demonstration and testing.
- Payment capture and transaction updates must be verified before marking a payment as paid.

## Project Status

MoriPal includes a working financial dashboard, expense management, capital decision workflows, AI Advisor, and PayPal Sandbox payment integration.

The application is published for demonstration, with a successful Sandbox payment flow tested.

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

Built with Lovable and developed for the **PayPal AI Hackathon 2026**.

Thanks to the open-source tools and developer platforms that made MoriPal possible.