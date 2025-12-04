## Backend Summary

The backend of YouCircle is built entirely on **Supabase**, which provides authentication, database management, storage, and real-time communication without requiring a custom server. All application data flows through Supabase’s automatically generated **API endpoints**, allowing the frontend to securely perform CRUD operations such as creating listings, fetching messages, updating profiles, and inserting conversation records. These endpoints are accessed through the Supabase client library, which handles authorization, session management, and row-level security enforcement. This architecture enables our React frontend to communicate seamlessly with the database while ensuring that only authenticated **.umass.edu** users can read or write data.

Real-time communication—particularly the one-to-one messaging system—is powered by **Supabase Realtime**, which listens for database updates and instantly pushes new messages to both sender and receiver. Whenever a message is inserted into the `messages` table, Supabase automatically broadcasts the event to subscribed clients, allowing the chat interface to update live without manual refreshes. This approach eliminates the need for custom socket servers and greatly simplifies real-time updates.

---

## Database Schema Summary

The YouCircle database schema is organized into five main tables: **users**, **listings**, **listing_images**, **conversations**, and **messages**—each playing a specific role in supporting authentication, listings, and real-time chat functionality.

- The **users** table (managed through Supabase Auth) stores verified student accounts, including fields such as UID, display name, email, and provider information.

- The **listings** table stores all marketplace posts, with each listing linked to a seller through `seller_id`, which references `users.id`. Listings include attributes such as title, category, description, price, address, seller name, and timestamps.

- The **listing_images** table associates multiple image URLs with a single listing through `listing_id`, allowing each listing to store several photos.

- Communication between buyers and sellers is handled through the **conversations** and **messages** tables. Each conversation record links a buyer and seller to a specific listing, storing their IDs and names along with timestamps.

- The **messages** table stores all individual chat messages, including sender ID, content, read status, and the associated `conversation_id`.

These relationships ensure that all user activity—posting items, starting conversations, and exchanging messages—remains securely tied to authenticated student accounts.
