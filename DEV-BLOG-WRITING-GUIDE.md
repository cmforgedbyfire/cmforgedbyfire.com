# DEV Blog writing guide

The public reader is `dev-blog.html`. All current entries live in one content file:

`js/dev-blog-posts.js`

The page automatically builds the large reading area, Recent Entries rail, project filters, article count, and archive cards from that file. A normal new post does not require editing `dev-blog.html`.

## Fastest way to add an entry

1. Open `js/dev-blog-posts.js`.
2. Copy one complete post object, including its opening and closing braces.
3. Paste the copy at the top of `window.DEV_BLOG_POSTS` and keep a comma between entries.
4. Give it a unique lowercase `slug` using words and hyphens.
5. Replace its title, project, category, dates, status, summary, image, introduction, sections, and takeaway.
6. Keep `productUrl` and `productLabel` empty when the project has no public product page.
7. Open `dev-blog.html#your-new-slug` at desktop and mobile widths.
8. Commit and push the website `main` branch.

The first object is treated as the newest post. Its title appears at the top of Recent Entries and it opens by default when the page has no article in its URL.

## The fields that control a post

- `slug`: the shareable address after `dev-blog.html#`
- `title`: the article headline
- `project`: the app or project name shown above the headline
- `category`: used by the filter buttons; reuse `Software`, `Games`, `AI`, or `Creative Work` when possible
- `date` and `displayDate`: machine-readable and reader-friendly publication dates
- `status`: an honest description such as `In development` or `Fixed and verified`
- `readTime`: a short estimate such as `4 min read`
- `summary`: the archive-card preview
- `image` and `imageAlt`: a website-relative product image and its accessible description
- `intro`: the opening paragraph in the reading pane
- `sections`: article headings and their paragraph lists
- `takeaway`: the highlighted closing thought

## Recommended entry structure

- Open with the interesting human problem, not a file list.
- Explain why the work mattered before describing how it was done.
- Keep one or two concrete facts that make the result believable.
- Include the setback, limitation, or unresolved edge when it shaped the story.
- End with the lesson or the next meaningful question.
- Translate technical evidence into plain language instead of pasting test output.

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
