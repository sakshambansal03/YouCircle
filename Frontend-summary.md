## Frontend Summary

The frontend of YouCircle is built using **React**, following a modular and component-based architecture that supports reusability, scalability, and clean separation of concerns. The application relies on **Supabase client APIs** for handling authentication, fetching listings, uploading images, and sending real-time messages, allowing the frontend to stay lightweight while communicating securely with the backend. All state management, routing, and data flows are handled directly within React, ensuring that pages render dynamically in response to Supabase updates.

All source code is organized under the `src/` directory, split into two main sections:  
- **components/** — Contains reusable interface elements such as `Header`, `SideDrawer`, `ListingCard`, `ProfileDropdown`, modal dialogs, and shared UI utilities. These components form the visual building blocks of the application.  
- **components/screens/** — Contains full-page views including `HomeScreen`, `LoginScreen`, `YourListings`, `MessagesScreen`, `ChatWindow`, `AddListingDialog`, `EditListing`, and `OpenListing`. Each screen includes its own React logic file and CSS styling file, allowing the layout and behavior to remain organized and easy to maintain.

This structure ensures that screens focus on routing and higher-level state transitions, while smaller components manage UI elements such as cards, forms, and buttons. Shared styling helps maintain visual consistency across pages, and React’s component-driven design makes it straightforward to extend the interface as new features are added. Combined with GitHub for version control and collaborative development, this architecture provides a robust foundation for building and iterating on YouCircle’s user-facing experience.
