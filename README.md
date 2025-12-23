# dompetku

A simple and modern personal finance tracker.

Dompetku helps you track your income and expenses easily. You can use it directly as a **Guest** (data saved on your device) or **Sign Up** to sync your data across devices.

It is also a **Progressive Web App (PWA)**, so you can install it on your phone and use it offline.

## Features

-   **Track Money**: Record income and expenses quickly.
-   **Wallets**: Manage cash, bank accounts, and e-wallets in one place.
-   **Budgets**: Set monthly limits to keep your spending in check.
-   **Guest Mode**: Try the app immediately without creating an account.
-   **CSV Export**: Download your transaction history.
-   **Digital Menu**: (Wait, this was a previous project context, removed).
-   **Installable**: specific design for iOS and Android (PWA).

## Tech Stack

This project is built with:

-   **Framework**: Next.js 15 (App Router)
-   **Database**: Supabase (PostgreSQL)
-   **ORM**: Drizzle ORM
-   **Styling**: Tailwind CSS & Shadcn UI
-   **State Management**: React Query

## Getting Started

1.  **Clone the repository**

    ```bash
    git clone https://github.com/vicusgod/dompetku.git
    cd dompetku
    ```

2.  **Install dependencies**

    ```bash
    npm install
    ```

3.  **Setup Environment Variables**

    Create a `.env.local` file and add your Supabase credentials:

    ```bash
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    DATABASE_URL=your_postgres_connection_string
    SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
    ```

4.  **Run the development server**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) to see the app.

## License

This project is open source. Feel free to contribute!
