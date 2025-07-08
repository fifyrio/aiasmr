# AIASMR Video – My Videos Page Requirements

## 🎯 Purpose
Enable users to manage, preview, download, and track their own ASMR video creations. Provide a clear interface to monitor usage, credit costs, and status.

---

## 1. Page Layout & Modules

### 1.1 Page Header
- Title: “My Videos”
- Subtitle or breadcrumb navigation: e.g. “Home / My Videos”
- Sort & filter controls (see section 1.3)

### 1.2 Video List/Grid View
- Display user-owned videos in a responsive grid or list
- Each video card shows:
  - 4K thumbnail (autoplay loop muted on hover)
  - Title or custom label
  - Status badge: _Processing_, _Ready_, or _Failed_
  - Generation timestamp (e.g., “Jun 25, 2025, 14:02”)
  - Credit cost to generate
  - Action buttons: 
    - **Preview**
    - **Download** (HD/4K for paid users)
    - **Regenerate** (use original prompt)
    - **Delete**

### 1.3 Sorting & Filtering
- Sort options:
  - By date (newest → oldest)
  - By cost (most → least credits)
  - Alphabetically (A → Z)
- Filters:
  - By status: Processing / Ready / Failed
  - By trigger or category tag (e.g., Water, Whisper, Cutting)

### 1.4 Bulk Actions
- Multi-select checkboxes per card
- Bulk operations:
  - Delete multiple videos
  - Regenerate selected items

### 1.5 Credit & Usage Summary
- Display top bar or sidebar summary:
  - Total videos generated
  - Total credits spent this month
  - Remaining credits (Free or Paid plan)
  - Button: “Buy More Credits” or “Upgrade Plan”

### 1.6 Pagination or Infinite Scroll
- Option to switch between numbered pages or continuous scrolling
- “Load More” button if paginated

### 1.7 Help & Support Access
- FAQ link relevant to errors (e.g., why generation failed)
- Contact support: “Need help? Email support@aiasmr.so”

---

## 2. Functional Requirements

| Component          | Behavior |
|--------------------|----------|
| Video Card Actions | Preview opens video player overlay; Download triggers file download or quality-select modal |
| Regeneration       | Re-queues the request using existing prompt and settings |
| Delete             | Removes video from list and backend storage |
| Bulk Operations    | Perform actions on selected videos simultaneously |
| Status Updates     | Polling or websockets to update Processing → Ready or Failed |
| Warning Prompts    | Confirm delete and regeneration actions, display credit costs |

---

## 3. Data & Backend Models

- **Video Model** fields:
  - id, user_id, title, prompt, triggers
  - status, credit_cost, created_at, updated_at
  - thumbnail_url, preview_url, download_url
- **User Model** needs:
  - credits_balance, plan_type (Free/Basic/Pro)
- CRUD and action logs for regenerate/delete

---

## 4. API Endpoints

- `GET /api/user/videos?sort=&filter_status=&filter_tag=&offset=&limit=`
- `GET /api/videos/:id/status`
- `POST /api/videos/:id/regenerate`
- `DELETE /api/videos/:id`
- `POST /api/videos/bulk` (with action, ids)
- `GET /api/user/credits` (returns balance and usage stats)

---

## 5. UI/UX Design

- **Responsive layout**: Switch grid/list based on screen size
- **Accessibility**: ARIA labels on buttons, keyboard-friendly focus states
- **Feedback**: Toast notifications for success/failure of actions
- **Confirmation modals**: For delete and regenerate, highlight credit impact

---

## 6. Non‑Functional Requirements

- **Performance**: Handle pagination across hundreds of videos
- **Reliability**: Regenerate jobs should preserve original configurations
- **Scalability**: Support future filtering by model version, tags, etc.
- **Security**: Only allow access to videos belonging to authenticated user
- **Logging**: Track user video actions for audit and support

---

## 7. Metrics to Track

- Total videos per user
- Regeneration frequency
- Delete rate
- Processing success/failure ratio
- Average credits per video

---

## 8. MVP vs Future Enhancements

### MVP
- Single-video view mode, basic sorting/filtering, preview/download/regeneration

### Phase 2
- Bulk edit, bulk deletion, regeneration queue management

### Phase 3
- Tag editing, custom titles, video sharing to public or social platforms

### Phase 4
- Analytics dashboard: per-video stats like view count, shares, average watch time

---

## ✅ Summary
The **My Videos** page forms the backbone of the user’s journey, giving them clarity and control over their creations, usage, and credits—while laying a solid foundation for future enhancements.
