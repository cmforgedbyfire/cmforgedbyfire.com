# DEV Blog writing guide

The public index is `dev-blog.html`. Individual entries live in `dev-blog/` and use a date-first filename such as:

`2026-10-08-welcome.html`

## Fastest way to add an entry

1. Copy the newest post in `dev-blog/` and give the copy a new `YYYY-MM-DD-short-title.html` filename.
2. Replace the page title, meta description, canonical URL, heading, date, project labels, and article text.
3. Add one new card at the top of **All Entries** in `dev-blog.html`.
4. Replace the **Latest From the Forge** card when the new post should be featured.
5. Add the post URL to `sitemap.xml` with its publication date.
6. Open the blog index and post at desktop and mobile widths before publishing.
7. Commit and push the website `main` branch.

## Recommended entry structure

- Project and development status
- Clear title and publication date
- What changed
- Why it changed
- What was tested and where
- Results and evidence
- Known limitations or unfinished work
- What comes next
- Screenshots only when they help explain the update

## Writing with your voice

The easiest voice-to-text option on Windows does not require adding a model to this website:

1. Click inside the editor, chat box, or text field where the draft should appear.
2. Press `Win + H`.
3. Select the microphone and speak.
4. Review names, product terms, punctuation, and version numbers before publishing.

Windows handles the speech recognition. It may use Microsoft's online speech service depending on the installed language and Windows speech settings. There is no speech model or server for this website to maintain.

Browser speech recognition can also be added to a local writing helper, but browser support is inconsistent and recognition is usually service-backed. Truly offline voice transcription still needs a local speech-recognition engine or model.

## Public-writing boundaries

Never publish:

- Passwords, API keys, signing secrets, tokens, private certificates, or private URLs
- Customer data, support messages, private feedback, or personal files
- Internal infrastructure details that would create a security risk
- Store claims that are not true for the exact submitted or publicly available build
- Test results without naming the platform and limits that matter

Use honest status language: **Planned**, **In development**, **Testing**, **Certification**, or **Available**.
