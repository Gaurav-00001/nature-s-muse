## 📄 ARCHITECTURE.md
This document proves you have high-level engineering thinking.

### 🏗️ Scaling to 100k Users
To handle 100k users, we would move away from the current "monolithic" local setup:
1.  **Database Migration:** Move from SQLite (local file) to a managed distributed database like **PostgreSQL (AWS RDS)** or **MongoDB** to handle concurrent read/writes.
2.  **Load Balancing:** Deploy multiple instances of the Express server behind a **Load Balancer (Nginx/AWS ELB)** to distribute traffic.
3.  **Horizontal Scaling:** Use Docker and Kubernetes to spin up more server containers during peak usage times.

### 💰 Reducing LLM Costs
AI tokens are expensive. We would optimize costs by:
1.  **Prompt Engineering:** Shortening system prompts to reduce input tokens.
2.  **Model Selection:** Using **Gemini 1.5 Flash** (which we currently use) instead of "Pro" models, as it is significantly cheaper and faster for simple sentiment analysis.
3.  **Batching:** Encouraging users to save entries and running analysis once per day instead of per-click if real-time feedback isn't required.

### ⚡ Caching Repeated Analysis
If multiple users write similar short phrases (e.g., "The ocean was calm"), we shouldn't pay for the AI twice.
1.  **Redis Caching:** Implement a **Redis** layer. Before calling Gemini, the server checks if a hash of the text already exists in the cache.
2.  **Result Reuse:** If the text is a 95%+ match to a recent entry, return the cached `emotion` and `summary` instantly.

### 🔐 Protecting Sensitive Data
Journals are deeply personal. We would implement:
1.  **Encryption at Rest:** Use **AES-256 encryption** to encrypt the `text` field in the database, so even if the DB is leaked, the content is unreadable.
2.  **Authentication:** Implement **JWT (JSON Web Tokens)** or **NextAuth** to ensure only the owner of the `userId` can fetch their specific entries.
3.  **Data Masking:** Before sending text to the LLM, use a regex filter to strip out PII (Personally Identifiable Information) like phone numbers or addresses.

---



