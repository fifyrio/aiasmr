# AIASMR Video - Create Page Requirements

## 🎯 Objective

Design and build the **"Create ASMR Video"** page for the AIASMR platform, allowing users to describe scenes, select ASMR triggers, and generate AI-powered 4K looped ASMR videos with audio sync and HD download support.

---

## 1. UI / Frontend Requirements

### 1.1 Prompt Input
- Text area with max 500 characters.
- Placeholder example: *"Include textures, sounds, and visuals for better results."*
- Live character counter (e.g. `202/500`).

### 1.2 Trigger Selection
- Triggers include:
  - Soap (default selected)
  - Sponge, Ice, Water, Honey, Cubes, Petals, Pages
- Each trigger is a clickable icon or button.
- Selected triggers are highlighted.

### 1.3 Generate Button
- "Generate Video" button
- Display remaining credits beside it (e.g., “20 credits”).
- Disabled if:
  - Prompt is empty
  - User has no credits

---

## 2. Progress & Feedback

- Show progress status: "Generating..." with a spinner or progress bar.
- On failure:
  - Show error message
  - Credits are **not** deducted
- Allow canceling generation while pending.

---

## 3. Result Display

- Show preview video (loop enabled).
- Provide **Download HD** button.
- Display metadata: timestamp, selected trigger(s), prompt (optional).

---

## 4. FAQ Section (Inline or Modal)

**Include answers to:**
1. Failed generations don’t cost credits.
2. Video generation usually takes 1–2 minutes.
3. Only paid plans can generate.
4. Use clear, rich prompts for better output.
5. Prompt content controls visual style.
6. Commercial use permitted for original uploads.
7. Download via HD button on result.

---

## 5. Logic & Workflow

### 5.1 Input Validation
- Require prompt
- Enforce max length
- Require at least one trigger selected (if mandatory)

### 5.2 Credit Check
- Block generation if credit ≤ 0

### 5.3 API Flow

**Submit Generation:**
```http
POST /api/generate
{
  "prompt": "Cutting frozen orange honey with steam",
  "triggers": ["ice", "honey"],
  "userId": "..."
}
