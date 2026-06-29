# Admin CRUD Design

## Scope

This design covers the `/admin` area and the protected `/api/admin/*` APIs.

The implementation strategy is:

1. Preserve the current auth/session model.
2. Replace the generic read-only admin tables with module-specific CRUD pages.
3. Reuse shared UI primitives across admin modules.
4. Keep backend APIs thin, explicit, and aligned to the current Mongo models.

## Current Technical Baseline

### Frontend

- Admin shell: `components/admin/AdminLayout.js`
- Generic read-only list page: `components/admin/AdminListPage.js`
- Admin routes: `pages/admin/*`
- Admin HTTP client: `lib/api.js -> adminAPI()`
- Admin auth session: `lib/auth.js`
- Admin styling primitives already exist in `public/css/admin.css`
  - table
  - form
  - modal
  - pagination
  - badge
  - toast

### Backend

- Admin route registration: `src/routes/index.js`
- Admin auth guard: `src/middleware/auth.js`
- Admin role gate: `ADMIN_ROLES = ['admin', 'staff']`
- Domain models: `src/models/index.js`
- API response mapping: `src/db/mapper.js`

### Important Current Gaps

1. `Tour` admin create/update does not persist `categoryIds` or `destinationIds`.
2. Itinerary only supports create/delete, not update.
3. Departure only supports create/update, not delete.
4. Admin frontend pages are list-only and do not use existing pagination/filter structure.
5. No admin lookup endpoint exists for tour form dependencies such as categories/destinations.
6. Some admin routes return `500` for business errors that should be `400/404/409`.

## Design Principles

### Product principles

- CRUD must be explicit and predictable.
- Destructive actions should default to soft-delete where supported by the current model.
- Secondary entities should be managed close to their parent entity.

### Engineering principles

- Keep server logic in services, not route files.
- Keep React pages orchestration-focused and push form/detail logic into focused components.
- Avoid a single mega admin component.
- Reuse shared admin UI building blocks.
- Optimize for low query count on list views and predictable backend contracts.

## Target Admin Architecture

### Shared frontend structure

Add module-specific components and shared admin primitives:

- `components/admin/common/AdminDataTable.js`
- `components/admin/common/AdminFilters.js`
- `components/admin/common/AdminModal.js`
- `components/admin/common/AdminPagination.js`
- `components/admin/common/AdminStatusBadge.js`
- `components/admin/common/AdminEmptyState.js`
- `components/admin/common/AdminConfirmDialog.js`

Module folders:

- `components/admin/tours/*`
- `components/admin/transport/*`
- `components/admin/business/*`

### Shared backend structure

Keep existing route groups, but extend service methods and add missing endpoints where CRUD is incomplete.

## Full CRUD Plan By Module

### A. Tour Management

#### A1. Tours

Goal:

- Full CRUD for `Tour`
- Embedded management of `TourItinerary`
- Embedded management of `TourDeparture`

Files to update:

- `pages/admin/tours.js`
- `components/admin/tours/TourManagementPage.js`
- `components/admin/tours/TourFormModal.js`
- `components/admin/tours/TourDetailModal.js`
- `components/admin/common/*`
- `src/routes/admin/tours.routes.js`
- `src/services/admin/tour.service.js`
- `src/db/mapper.js`

Backend additions/changes:

- `GET /api/admin/tours`
  - keep pagination/filter/search
- `GET /api/admin/tours/lookups`
  - return active categories and destinations
- `GET /api/admin/tours/:id`
  - keep detail and normalize related data
- `POST /api/admin/tours`
  - persist `categoryIds`, `destinationIds`
  - validate required fields
  - guard duplicate `code`
- `PUT /api/admin/tours/:id`
  - persist `categoryIds`, `destinationIds`
  - preserve slug when appropriate
- `DELETE /api/admin/tours/:id`
  - archive via `status = archived`
- `POST /api/admin/tours/:id/itineraries`
  - keep
- `PUT /api/admin/tours/itineraries/:id`
  - add
- `DELETE /api/admin/tours/itineraries/:id`
  - keep
- `POST /api/admin/tours/:id/departures`
  - keep
- `PUT /api/admin/tours/departures/:id`
  - keep
- `DELETE /api/admin/tours/departures/:id`
  - add
  - reject deletion when booked/held seats exist

Frontend behavior:

- Tours page becomes a dedicated CRUD screen
- Search by `code/title`
- Filter by `status`
- Pagination UI based on backend pagination
- Create/edit modal for base tour information
- Detail modal for:
  - itinerary list/create/update/delete
  - departure list/create/update/delete

Notes:

- Category CRUD is out of current menu scope, so tour form consumes category data as lookup only.
- Destination CRUD remains its own page, but the tour form can link destinations immediately.

#### A2. Destinations

Goal:

- CRUD for `Destination`

Files to update:

- `pages/admin/destinations.js`
- `components/admin/tours/DestinationManagementPage.js`
- `src/routes/admin/destinations.routes.js`
- `src/services/admin/destination.service.js`

Behavior:

- search
- pagination
- create/edit modal
- delete with dependency protection

#### A3. Categories

Current state:

- Public lookup exists
- No admin menu and no admin CRUD route

Decision:

- Do not implement in first delivery unless business confirms category management is required.
- If later needed:
  - add `/api/admin/categories`
  - add admin page and menu entry

### B. Transport Management

#### B1. Providers

Files:

- `pages/admin/providers.js`
- `components/admin/transport/ProviderManagementPage.js`
- `src/services/admin/transport.service.js`

CRUD:

- list/search/status
- create/edit/delete-soft

#### B2. Vehicles

Files:

- `pages/admin/vehicles.js`
- `components/admin/transport/VehicleManagementPage.js`
- `src/services/admin/transport.service.js`

CRUD:

- list/filter by provider/type/status
- create/edit/delete-soft

#### B3. Drivers

Files:

- `pages/admin/drivers.js`
- `components/admin/transport/DriverManagementPage.js`
- `src/services/admin/transport.service.js`

CRUD:

- list/filter
- create/edit/delete-soft

#### B4. Routes and Pickup Points

Files:

- `pages/admin/routes.js`
- `components/admin/transport/RouteManagementPage.js`
- `src/routes/admin/transport.routes.js`
- `src/services/admin/transport.service.js`

CRUD:

- route create/edit/delete-soft
- pickup point list/create/update/delete

Missing backend additions:

- `PUT /api/admin/transport/routes/pickups/:id`
- `DELETE /api/admin/transport/routes/pickups/:id`

#### B5. Transport Services

Current state:

- backend exists
- no admin page/menu

Decision:

- Add in phase 2 after core transport entities are stable.

### C. Business Management

#### C1. Bookings

Files:

- `pages/admin/bookings.js`
- `components/admin/business/BookingManagementPage.js`
- `src/routes/admin/bookings.routes.js`
- `src/services/admin/booking.service.js`

Behavior:

- list/search/filter
- detail modal
- confirm/cancel/update status

Note:

- This is operational management, not traditional create/delete CRUD.

#### C2. Promotions

Files:

- `pages/admin/promotions.js`
- `components/admin/business/PromotionManagementPage.js`
- `src/routes/admin/promotions.routes.js`
- `src/services/admin/promotion.service.js`

Behavior:

- create/edit/delete-soft
- assign tours
- remove tours from promotion

Missing backend addition:

- `DELETE /api/admin/promotions/:id/tours/:tourId`

## API Contract Guidelines

### List endpoints

All admin list endpoints should return:

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "total": 0,
    "page": 1,
    "limit": 15,
    "totalPages": 1
  }
}
```

### Mutation endpoints

All create/update/delete actions should return:

```json
{
  "success": true,
  "message": "..."
}
```

Optionally include `data` when the client needs immediate identity info.

### Error handling

Route layer should map expected failures to:

- `400` invalid input or business rule violation
- `401` unauthenticated
- `403` forbidden
- `404` record not found
- `409` duplicate/conflict
- `500` unexpected failure only

## Tour Module Detailed Design

### Frontend screen structure

`pages/admin/tours.js`

- thin page wrapper only

`components/admin/tours/TourManagementPage.js`

- owns list state
- owns lookup state
- opens create/edit/detail dialogs
- orchestrates mutations and optimistic refresh rules

`components/admin/tours/TourFormModal.js`

- create/edit base tour fields
- validates required fields before submit
- supports category and destination multi-select

`components/admin/tours/TourDetailModal.js`

- fetches or receives full tour detail
- renders two sections:
  - itineraries
  - departures
- supports local add/edit/delete on each section

### Backend query design for Tours

List:

- avoid N+1 where possible
- current list counts bookings per tour with repeated queries
- acceptable for small admin data, but should be improved when scaling

Recommended medium-term optimization:

- replace per-tour `Booking.countDocuments` with an aggregate grouped by `tourId`

For the first implementation:

- keep current behavior if needed for delivery speed
- do not introduce premature complexity into the route layer

Detail:

- fetch base tour + related itineraries + departures + categories + destinations using `Promise.all`
- good enough for current scale

### Validation rules for Tours

- `code` required, unique
- `title` required
- `basePrice >= 0`
- `durationDays >= 1`
- `durationNights >= 0`
- `status` in allowed tour statuses
- `categoryIds` and `destinationIds` must be arrays of ids

Departure:

- `departureCode` required, unique
- `startDate <= endDate`
- `capacity >= 1`
- prices `>= 0`

Itinerary:

- `dayNumber >= 1`
- `title` required

## Performance and Scale Review

### What is correct for the current codebase

- Dedicated module pages are better than extending `AdminListPage`
- Modal-based CRUD is sufficient for current admin density
- Shared components reduce repeated admin logic
- Backend remains simple and understandable

### Current scale limits

- some admin lists still rely on small-volume assumptions
- no server-side caching
- no typed contract layer
- no transaction boundaries across parent-child mutations

### Why this design still fits now

- repo is small-to-medium sized
- team velocity matters more than introducing heavy abstraction
- module folders plus shared primitives give a clean upgrade path

### Expansion path

- move shared admin fetch logic into reusable hooks
- add stronger validation layer
- introduce aggregate-heavy list queries for large datasets
- split route/service files further when modules grow

## Design Self-Review

### Is the design aligned with the current technical base?

Yes.

- It preserves the current auth/session scheme.
- It keeps Express + service-layer organization.
- It reuses CSS and data contracts already present in the repo.
- It fixes domain gaps rather than replacing the architecture.

### Is the update path logically correct?

Yes.

- foundation fixes first
- shared CRUD primitives second
- Tour module first
- remaining modules after shared patterns stabilize

### Is it performant enough?

Yes for current scale, with clear notes on where list aggregation should later improve.

### Is it easy to extend?

Yes.

- module-specific components
- shared admin primitives
- explicit API contracts
- minimal coupling between modules

## Delivery Sequence

### Phase 1

- shared admin CRUD primitives
- Tour backend gaps
- Tour frontend CRUD

### Phase 2

- Destinations
- Providers
- Vehicles
- Drivers
- Routes and pickup points

### Phase 3

- Bookings operational UX
- Promotions CRUD and tour assignment cleanup
- optional Transport Services page
