# Build PERCEPTION – Human Measurement & Perception Games

Act as a senior frontend engineer and UI/UX designer. Build a complete, functional, responsive web game platform called **PERCEPTION**.

The concept is a collection of mini-games that test how accurately humans can estimate, measure, count, perceive, remember, and predict things without using actual measuring tools.

This should feel like a polished competitive perception-testing arcade, not an educational website or a generic dashboard.

Do not just create static UI mockups. Implement the actual game interactions, calculations, game session management, scoring system, and results screens.

---

# 1. Project Discovery & Technical Requirements

Before implementation:

1. Inspect the existing repository structure.
2. Identify the current framework, dependencies, coding conventions, and existing components.
3. Reuse existing infrastructure where appropriate.
4. Do not unnecessarily replace existing configurations or dependencies.
5. If the project is empty, initialize it using the following preferred stack.

Preferred stack:
- React
- Vite
- TypeScript (strict mode)
- Tailwind CSS
- shadcn/ui where appropriate
- Lucide icons
- React Router
- Zustand or Context API for game session state
- Framer Motion or Motion for animations

Technical requirements:
- Strict TypeScript.
- Do not use `any`.
- Reusable components and hooks.
- Separate game logic from UI components.
- Each game must have its own implementation and answer calculation.
- Use clean, maintainable architecture.
- Avoid unnecessary dependencies.
- Ensure there are no TypeScript or ESLint errors.

---

# 2. Product Identity

Product name: PERCEPTION

Temporary tagline:

"How accurately does your brain measure the world?"

Alternative tagline:

"Trust your instincts. Test your perception."

Brand direction:
- Modern.
- Minimalist.
- Premium.
- Competitive.
- Scientific but approachable.
- Visually engaging without being childish.

The product logo will be provided later.

For now, create a temporary logo using a random abstract geometric image or generated geometric visual. Keep the logo implementation replaceable through a single reusable component.

Do not make the temporary logo a permanent part of the application architecture.

---

# 3. Design System

## Theme

Dark mode must be the default theme.

However, users must be able to switch between:
- Dark mode
- Light mode

Theme requirements:
- Theme toggle in the main navigation.
- Persist selected theme using localStorage.
- Apply theme consistently to every page and game.
- Use CSS variables or Tailwind theme tokens.
- Avoid hardcoded colors throughout individual components.

Suggested dark theme:
- Main background: #090B10
- Secondary background: #10141C
- Card background: #151B26
- Elevated background: #1B2330
- Primary text: #F5F7FA
- Secondary text: #929BAA
- Borders: #252E3C
- Accent: #7C8CFF

Suggested light theme:
- Main background: #F5F6FA
- Secondary background: #FFFFFF
- Card background: #FFFFFF
- Primary text: #151923
- Secondary text: #6B7280
- Borders: #E5E7EB

Use the accent color consistently for interactive elements, highlights, progress indicators, and selected states.

Do not use excessive gradients, glowing effects, or colorful backgrounds.

## Typography

Use a modern sans-serif typeface such as Inter, Geist, or Manrope.

Typography hierarchy:
- Large, bold headings.
- Medium-weight section titles.
- Small, subtle metadata.
- Monospaced numbers for scores, countdowns, and measurements.

## General UI

Use:
- Rounded cards.
- Subtle borders.
- Clean spacing.
- Smooth transitions.
- Consistent icon sizing.
- Clear interactive states.
- Subtle hover feedback.

Avoid:
- Excessive shadows.
- Oversized cards.
- Excessive empty space.
- Emoji-based navigation.
- Unnecessary decorative elements.

---

# 4. Responsive Layout & Viewport Requirements

This is a desktop-first web application, but it must remain usable on tablets and mobile devices.

IMPORTANT:

Do not constrain the application to a maximum width of 1280px.

The application must utilize the available browser viewport width.

Desktop support:
- 1366px
- 1440px
- 1600px
- 1920px
- Larger desktop screens

Layout requirements:
- Use full-width layouts.
- Use a responsive max-width strategy that can expand to 1920px or beyond when appropriate.
- Do not force the entire application into a narrow centered container.
- Use available screen width intelligently.
- At 1920px, the layout should still feel balanced, not stretched awkwardly.

Height requirements:
- Avoid unnecessary vertical scrolling on desktop.
- Important pages should fit within 100vh where practical.
- Use `100dvh` with an appropriate fallback.
- Account for navigation, headers, and footers when calculating available height.
- Do not allow content to overflow beyond the viewport unnecessarily.
- For long game lists or result tables, use internal scrolling where appropriate.

Browser zoom:
- Design everything to be comfortable at the browser's default 100% zoom.
- Never require users to zoom beyond 100%.
- Never use excessively small text to fit content.
- Never scale down the entire interface to fit a viewport.
- Ensure game interaction areas remain large enough to use comfortably.

Use responsive CSS units and avoid hardcoded desktop dimensions wherever possible.

---

# 5. Splash Screen

Create a dedicated splash screen shown when the application is opened.

Duration:
- Approximately 2–3 seconds.
- Do not show it repeatedly during normal internal navigation.

Visual concept:
- Full-screen dark background.
- Centered PERCEPTION branding.
- Temporary abstract geometric logo/image.
- Large product name.
- Tagline: "Trust your instincts. Test your perception."
- Subtle geometric animation.
- Smooth fade/scale transition into the main application.

The splash screen must:
- Respect reduced-motion preferences.
- Not block the application indefinitely.
- Transition automatically.
- Be shown once per browser session or initial application entry.

Use a reusable SplashScreen component.

---

# 6. Main Navigation

Create a clean navigation system.

Desktop navigation:
- Logo and product name on the left.
- Main navigation links.
- Theme toggle.
- Optional profile/statistics shortcut.

Suggested navigation:
- Home
- Games
- Statistics

Keep the navigation compact.

On mobile, use a responsive navigation pattern.

---

# 7. Main Page

The homepage is the main entry point.

It should immediately communicate the purpose of PERCEPTION.

Suggested hero:

PERCEPTION

"How accurately does your brain measure the world?"

"Challenge your perception through a collection of visual, spatial, and time-based mini-games."

Primary actions:

1. Daily Challenge
2. All Games
3. Manual Play

Use three visually distinct cards.

## Mode 1: Daily Challenge

Description:
"Five random challenges. One attempt to prove your perception."

Behavior:
- Select five unique games randomly from the available game library.
- Never repeat the same game within a single daily session.
- Use a deterministic daily seed so every user receives the same selection for a given date.
- Store daily progress locally.
- Allow users to continue an unfinished daily session.
- Once completed, display the final results.
- Do not allow users to overwrite their completed daily result by replaying it.

Display:
- Number of games.
- Estimated duration.
- Completion status.
- Daily challenge availability.

## Mode 2: All Games / Marathon

Description:
"Play every available game in one complete perception test."

Behavior:
- Include every registered game.
- Each game appears once.
- Randomize game order.
- Display current progress, e.g. 7/12.
- Show results only after completing the session.
- Allow users to exit with a confirmation.

## Mode 3: Manual Play

Description:
"Choose exactly what you want to test."

Behavior:
- Display the complete game library.
- Allow users to select one game.
- Allow replaying games.
- Each game can have its own number of rounds.
- Show the result after the selected game is completed.

---

# 8. Game Library

Create a dedicated Games page.

Display games in a responsive card grid.

Each card should contain:
- Game name.
- Short description.
- Category.
- Difficulty.
- Estimated duration.
- Best personal score, if available.
- Play button.

Add category filters:
- All
- Time
- Geometry
- Quantity
- Proportion
- Spatial
- Memory
- Physics

Add search functionality.

Initial games to implement:

## Game 1: Five Second Countdown

Category: Time

Gameplay:
1. Show instructions.
2. Show a READY button.
3. User clicks START.
4. Start an actual five-second timer.
5. The user must click the designated interaction area when they believe exactly five seconds have passed.
6. After the click, stop measuring the user's response time.
7. Reveal the actual five-second duration and the user's click time.

Result classification:
- Early: clicked before 5000ms.
- Just in time: clicked within a configurable tolerance around 5000ms.
- Late: clicked after the tolerance window.

Important:
Use `performance.now()` for accurate elapsed-time measurement.

Do not rely on `setTimeout` as the measurement source.

The visual timer should not reveal the exact elapsed time while the user is playing.

## Game 2: Angle

Category: Geometry

Gameplay:
- Show a line or geometric object with a randomly generated angle.
- The player adjusts a rotatable line or slider to estimate the original angle.
- Allow angles between 0 and 360 degrees.
- Reveal the correct angle after submission.

Scoring:
- Calculate the shortest angular difference.
- Account for circular angles (359° and 1° should only differ by 2°).

## Game 3: Count

Category: Quantity

Gameplay:
- Generate random dots or geometric objects.
- Display them in a challenge area.
- The player estimates how many objects are present.
- Submit a numerical answer.

Requirements:
- Randomized object positions.
- Different object sizes and shapes.
- Adjustable difficulty.
- Prevent overlapping objects from making the correct count ambiguous.

## Game 4: Distance

Category: Geometry

Gameplay:
- Show two points in a canvas.
- Player estimates the distance between the two points.
- Allow clicking or dragging to position a measuring indicator.
- Reveal the correct distance.

Scoring:
- Euclidean distance error.
- Normalize the answer relative to the challenge dimensions.

## Game 5: Measure

Category: Geometry

Gameplay:
- Display an object with an unknown length.
- Player uses a draggable measuring line or slider.
- No ruler or numerical reference should be visible during the challenge.
- Player submits an estimated length.

Scoring:
- Relative length error.

Keep this game distinct from Distance.

## Game 6: Dot Recall

Category: Memory / Spatial

Gameplay:
1. Show a dot at a random location.
2. Display it for a configurable number of milliseconds.
3. Hide the dot.
4. Display an empty answer area.
5. Player clicks where they remember the dot was located.
6. Reveal the original location and the player's selection.

Scoring:
- Calculate Euclidean distance between the original and selected coordinates.
- Normalize against the answer area's dimensions.
- Closer answers receive higher scores.

## Game 7: Black or White

Category: Quantity / Memory

Gameplay:
1. Display a collection of black and white objects.
2. Keep the objects visible for a short duration.
3. Hide all objects.
4. Ask: "Which color had more objects?"
5. Player chooses Black or White.

Scoring:
- Correct answer = 100.
- Incorrect answer = 0.

Requirements:
- Random object count.
- Different object positions and sizes.
- Avoid making the majority obvious through visual grouping.
- Make difficulty adjustable.

## Game 8: Box Comparison

Category: Geometry / Area

Gameplay:
- Display two randomly generated rectangular or square shapes.
- Both should have similar areas.
- Ask: "Which box has the larger area?"
- Player selects the larger box.

Requirements:
- Do not hide the shapes.
- Vary width and height.
- Make differences increasingly subtle at higher difficulty.
- Calculate actual area programmatically.

Scoring:
- Correct = 100.
- Incorrect = 0.

## Game 9: Pick X/X

Category: Proportion

Gameplay:
1. Display a long horizontal rectangular block.
2. Ask a question such as "Select 3/5 from the left."
3. Player clicks or drags a marker to indicate the boundary.
4. Save the selected position.
5. Reveal the correct boundary.

Requirements:
- Support fractions such as 1/2, 1/3, 3/5, 2/7, 5/8.
- Make the block responsive.
- Do not show percentage markings during the challenge.

Scoring:
- Calculate the positional difference between the selected and correct boundaries.
- Normalize against the total block width.

## Game 10: Center of Gravity

Category: Spatial

Gameplay:
- Generate multiple shapes at random positions.
- Shapes have different sizes and weights.
- Player clicks where they estimate the center of mass.

Scoring:
- Calculate the weighted average position of all shapes.
- Compare with the user's selected position.
- Normalize the positional error.

## Game 11: Water Level

Category: Quantity

Gameplay:
- Show a transparent container with water.
- Ask the player to estimate the percentage filled.
- Player submits a percentage using a slider.

Scoring:
- Percentage-point difference.

Ensure the container's geometry is known so the actual volume fraction is calculated correctly.

## Game 12: Rotation

Category: Spatial

Gameplay:
- Show a geometric object in a randomly rotated orientation.
- Player adjusts a slider or rotation handle.
- Player estimates its original or target orientation.

Scoring:
- Angular difference.

---

# 9. Game Session Experience

All game modes must use a shared session experience.

Before each game:
- Show game name.
- Show short instructions.
- Show difficulty.
- Provide a Start button.

During gameplay:
- Keep the challenge area as the visual focus.
- Display progress, such as 2/5.
- Provide a clear submit/confirm action.
- Prevent accidental multiple submissions.
- Do not reveal the correct answer before submission.

After submission:
- Freeze the answer.
- Reveal the correct answer.
- Show the player's answer.
- Show accuracy percentage.
- Show S–F grade.
- Provide a Continue button.

For Daily Challenge and Marathon:
- Allow players to see a brief result after each game.
- Keep the overall final summary until all games are complete.

---

# 10. Scoring System

Every game must return a normalized accuracy score between 0 and 100.

Grades:

| Grade | Accuracy |
|---|---|
| S | 98–100 |
| A | 90–97.99 |
| B | 80–89.99 |
| C | 65–79.99 |
| D | 40–64.99 |
| F | 0–39.99 |

Each game must implement its own scoring logic.

Examples:

Numerical estimation:
- Compare absolute difference between actual and estimated values.
- Normalize against a configurable tolerance.

Angle:
- Use shortest angular difference.

Coordinates:
- Use Euclidean distance.
- Normalize based on the dimensions of the challenge area.

Percentage:
- Use percentage-point difference.

Binary questions:
- Correct = 100.
- Incorrect = 0.

Do not use one arbitrary formula for every game.

Important:
- Accuracy calculations must be deterministic.
- Avoid division-by-zero.
- Clamp scores to 0–100.
- Handle edge cases.
- Store both the raw answer and normalized accuracy.

---

# 11. Final Results Page

Create a polished results page for completed sessions.

Display:

## Overall Summary
- Overall accuracy.
- Overall grade.
- Number of games completed.
- Total time spent.
- Best-performing game.
- Worst-performing game.

Overall accuracy:
Use the arithmetic mean of individual game accuracy scores initially.

## Individual Results

For each game display:
- Game name.
- Correct answer.
- User's answer.
- Difference/error.
- Accuracy percentage.
- S–F grade.

Use a clean table on desktop and stacked cards on mobile.

## Additional Statistics

- Highest individual score.
- Lowest individual score.
- Average accuracy.
- Comparison with previous personal best.
- Historical results, if available.

Provide:
- Play Again.
- Back to Home.
- Share Results.

---

# 12. Personal Statistics

Create a Statistics page.

Use localStorage initially.

Track:
- Total games played.
- Total sessions.
- Average accuracy.
- Best overall score.
- Highest-rated game category.
- Lowest-rated game category.
- Personal best for each game.
- Historical daily challenge results.

Visualize:
- Accuracy over time.
- Performance by category.
- Individual game performance.

Keep the charts visually consistent with the dark theme.

---

# 13. Architecture

Use a modular structure.

Suggested structure:

src/
  app/
    App.tsx
    router.tsx
    providers/

  components/
    layout/
      AppShell.tsx
      Navigation.tsx
      ThemeToggle.tsx
      SplashScreen.tsx

    common/
      GameCard.tsx
      GradeBadge.tsx
      ProgressIndicator.tsx
      ResultCard.tsx

  features/
    home/
    games/
      components/
      definitions/
      engines/
      hooks/
      registry.ts

      implementations/
        countdown/
        angle/
        count/
        distance/
        measure/
        dot-recall/
        black-white/
        box-comparison/
        pick-fraction/
        center-gravity/
        water-level/
        rotation/

    sessions/
      sessionStore.ts
      sessionManager.ts
      scoring.ts

    results/
    statistics/

  hooks/
  lib/
  types/
  styles/

Adapt this structure to the existing repository if necessary.

## Game registration

Create a centralized game registry.

The session manager must not need to know individual game implementation details.

Adding a new game should ideally only require:
1. Creating its game implementation.
2. Defining its metadata.
3. Registering it in the game registry.

Daily Challenge and Marathon should automatically recognize newly registered games.

---

# 14. Persistence

Use localStorage for the first version.

Persist:
- Theme preference.
- Daily challenge seed and selected games.
- Current unfinished session.
- Completed session results.
- Personal bests.
- Historical statistics.

Implement safe JSON parsing and version the persisted data structure.

Do not lose unfinished session progress when the browser is refreshed.

No backend is required for this first release.

---

# 15. UX & Quality Requirements

- Use smooth but subtle transitions.
- Use clear loading and empty states.
- Provide confirmation before abandoning a session.
- Prevent accidental double submissions.
- Show useful feedback for every interaction.
- Ensure keyboard accessibility where appropriate.
- Support reduced motion.
- Avoid excessive modal dialogs.
- Make the challenge area responsive.
- Ensure all game interactions work at 100% browser zoom.

Use actual game mechanics, not placeholder interactions.

Do not leave any of the 12 initial games as nonfunctional cards.

---

# 16. Development Priorities

Implement in this order:

Phase 1:
- Project setup and design system.
- Splash screen.
- Theme switching.
- Main navigation.
- Homepage.
- Game library.

Phase 2:
- Shared game engine.
- Game session management.
- Scoring and grade calculation.
- First six game implementations.

Phase 3:
- Remaining six game implementations.
- Daily Challenge.
- Marathon.
- Manual Play.

Phase 4:
- Results page.
- Statistics page.
- Persistence.
- Responsive refinements.

Phase 5:
- Test every game interaction.
- Test scoring edge cases.
- Test session continuation after refresh.
- Test light and dark themes.
- Test at 1366x768, 1440x900, 1600x900, and 1920x1080.
- Verify that no important desktop screen requires unnecessary vertical scrolling.
- Run TypeScript checks, ESLint, and production build.

---

# 17. Final Instructions

Do not stop after creating the homepage.

The expected deliverable is a functioning first version of PERCEPTION.

Prioritize:
1. Functional gameplay.
2. Accurate scoring.
3. Consistent UX.
4. Responsive design.
5. Maintainable architecture.

Use your design judgment to make the application visually polished.

If something is not explicitly specified, make a reasonable product decision and continue implementation rather than stopping to ask unnecessary questions.

After implementation, provide:
- Summary of completed features.
- Project structure.
- List of implemented games.
- How to run the project.
- Any known limitations or unfinished features.

Start by inspecting the repository.