# iLost

### A Web-Based Lost and Found Reporting, Matching, and Claim Verification System for Bulacan State University – Meneses Campus

> **Lost it? Find it back.**

iLost is a web-based Lost and Found Management System designed for Bulacan State University – Meneses Campus. It provides a centralized platform where users can report lost and found items, review their submitted reports, and identify possible matches between lost and found records.

The system uses structured item classification and attribute-based matching to help users find possible matches based on the details they provide.

---

## Project Overview

Lost and found items are often reported through different channels, making it difficult for students and campus personnel to keep track of reported items and identify possible matches.

iLost addresses this by providing a centralized system for:

- Reporting lost items
- Reporting found items
- Organizing item information through structured categories
- Reviewing personal lost-item reports
- Identifying possible matches with reported found items
- Viewing match levels based on available item attributes
- Supporting the claim verification process

The system is designed specifically for the campus lost and found process of Bulacan State University – Meneses Campus.

---

## Key Features

### User Authentication

Users can create an account and Sign in using their registered email and password.

### Report Lost Item

Users can submit a lost-item report containing structured information such as:

- Item name
- Category
- Subcategory
- Brand
- Model
- Color
- Size
- Description
- Distinctive details
- Location
- Date
- Time

### Report Found Item

Users can report items they have found on campus using the same structured classification system.

### Find My Missing Items

Users can view their submitted lost-item reports and check them against reported found items.

### Item Matching

iLost compares structured item attributes to identify possible matches.

The current matching system uses:

**Primary matching fields**

- Category
- Subcategory

**Supporting matching fields**

- Brand
- Model
- Color
- Size

The system does not treat a missing attribute as a mismatch. Matching results are intended to assist users and do not determine ownership.

### Match Levels

Possible matches are classified into the following levels:

| Match Level | Description |
|---|---|
| Strong Match | Core classification matches with multiple supporting attributes matching and no supporting conflicts |
| Likely Match | Core classification matches with substantial supporting information |
| Possible Match | Core classification matches but has limited additional supporting information |
| Less Possible Match | Only one of the core classification fields matches |
| No Match | Neither core classification field matches |

Items classified as **No Match** are excluded from the possible-match results.

### Report History

Users can review their previously submitted lost and found reports through the History section. Found items from approved claims also appear in the claimant's History.

### Claim lifecycle

- Each account can submit one claim per found item. Rejected claims cannot be resubmitted by the same account.
- Rejected claims do not change the found item's availability, so other users can still see and claim it.
- Approving a claim marks the found item as claimed, removes it from match results, and adds it to the claimant's History.
- Confirming physical handover marks the item as returned.
- Apply `supabase/migrations/20261002_one_claim_per_item_per_account.sql` to the Supabase database to enforce the one-claim-per-item rule and allow claimants to read their own claim statuses and approved claim items.

### Browse Items

The system provides a limited view of reported lost and found items without exposing sensitive identifying information.

---

## Matching Approach

The iLost matching system follows a structured classification approach:

```text
Category
   ↓
Subcategory
   ↓
Supporting Attributes
   ├── Brand
   ├── Model
   ├── Color
   └── Size
```

The system first compares the core classification of an item before considering available supporting attributes.

Descriptions and distinctive details are not currently used as automatic matching inputs. These details are intended to support later human verification.

> Matching results are suggestions only. Final ownership verification is handled through the claim and verification process.

---

## Technology Stack

### Frontend

- React
- Vite
- JavaScript
- CSS

### Backend and Database

- Supabase
- PostgreSQL
- Supabase Authentication

### Development Tools

- Visual Studio Code
- Git
- GitHub

### Deployment

- Vercel
- Supabase

---

## Database

The current system uses the following main tables:

### `profiles`

Stores user profile information.

Main fields include:

- `id`
- `full_name`
- `email`
- `role`
- `created_at`

### `items`

Stores reported lost and found items.

Main fields include:

- `id`
- `user_id`
- `type`
- `item_name`
- `category`
- `subcategory`
- `brand`
- `model`
- `color`
- `size`
- `description`
- `distinctive_details`
- `location`
- `date`
- `time`
- `photo_url`
- `status`
- `created_at`

### `claims`

Stores claim requests associated with reported items.

Main fields include:

- `id`
- `item_id`
- `claimant_id`
- `message`
- `status`
- `created_at`
- `verified_at`

---

## Security

Supabase Row Level Security (RLS) is enabled for the main database tables.

The system uses authenticated access to control actions such as:

- Viewing user information
- Creating item reports
- Updating owned reports
- Deleting owned reports
- Creating claims
- Administrative actions

Administrative access is handled through the user's assigned role.

Sensitive item information is not intended to be exposed through the public browsing interface.

---

## Project Structure

```text
iLost-LFMS/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── lib/
│   │   ├── matching.js
│   │   └── supabaseClient.js
│   ├── pages/
│   │   ├── BrowseItems.jsx
│   │   ├── Dashboard.jsx
│   │   ├── FindMyMissingItems.jsx
│   │   ├── History.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── ReportItem.jsx
│   ├── App.css
│   ├── App.jsx
│   └── main.jsx
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```

---

## Getting Started

### Prerequisites

Make sure the following are installed:

- Node.js
- npm
- Git

### Installation

Clone the repository:

```bash
git clone https://github.com/Thesis-Repository/iLost-LFMS.git
```

Navigate to the project directory:

```bash
cd iLost-LFMS
```

Install the dependencies:

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Do not commit `.env.local` or expose private Supabase credentials.

### Run the Development Server

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:5173/
```

---

## Development Status

iLost is currently under active development.

### Implemented

- React + Vite project setup
- Supabase integration
- User registration
- User authentication
- User profiles
- Lost-item reporting
- Found-item reporting
- Structured item classification
- Item history
- Dashboard statistics
- Find My Missing Items
- Attribute-based item matching
- Match-level classification
- Basic item browsing
- Supabase Row Level Security

### In Development

- Claim submission
- Claim verification workflow
- Administrative management
- Handover verification
- Photo upload and item evidence
- Additional interface improvements
- Final deployment

---

## Project Identity

**Project Name:** iLost

**Tagline:** Lost it? Find it back.

**Formal Title:**

> iLost: A Web-Based Lost and Found Reporting, Matching, and Claim Verification System for Bulacan State University – Meneses Campus

The system is designed with a clean and professional interface appropriate for a university environment. Its main purpose is to centralize lost and found reporting while providing a structured way to identify possible item matches.

---

## Team Repository

This project is maintained in the following GitHub repository:

**Thesis-Repository / iLost-LFMS**

The repository is used for version control, collaboration, and tracking individual development contributions through Git commits.

---

## License

This project was developed as an academic Web Development project for Bulacan State University – Meneses Campus.