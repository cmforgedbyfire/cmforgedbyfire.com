/*
 * DEV BLOG CONTENT
 *
 * To publish a new entry, copy one post object, place the copy at the top of
 * this list, and replace its fields. The page builds the reader, Recent
 * Entries rail, filters, and archive from this single file.
 */
window.DEV_BLOG_POSTS = [
  {
    slug: "master-generator-marketing-kit",
    title: "The Marketing Kit Had to Tell the Truth",
    project: "Master Generator",
    category: "Software",
    date: "2026-10-07",
    displayDate: "October 7, 2026",
    status: "Release preparation",
    readTime: "4 min read",
    summary: "Turning a sprawling fantasy toolkit into one honest, portable story—without pretending every package was already live in every store.",
    image: "assets/logos/master_generator.png",
    imageAlt: "Master Generator logo",
    productUrl: "master-generator.html",
    productLabel: "Explore Master Generator",
    intro: "A good product can still be surprisingly difficult to explain. Master Generator had Windows, Android, and Store packages, a mountain of fantasy tools, and years of accumulated artwork. The challenge this week was not inventing another feature. It was gathering the whole story without sanding off the honest edges.",
    sections: [
      {
        heading: "Packing the forge into one box",
        paragraphs: [
          "The first job was an inventory: the real application icon, current screenshots, feature list, release notes, package identities, and public store links. That sounds like paperwork until one missing or outdated asset sends an entire submission in the wrong direction.",
          "Version 2.1.4 now has a verified marketing kit built from the product itself. It covers the campaign vaults, generators, dice, visual packs, import and export tools, and optional TreV assistance without turning that long list into a wall of feature noise."
        ]
      },
      {
        heading: "Six products, one visual family",
        paragraphs: [
          "The work grew into a company-wide bundle for Master Generator, Card Vault, Latter-day Lens, Creative QR, Creative Image Tools, and CarTrev Towers. Each received a finished square card sized for a Facebook post—not just a background somebody would still have to finish later.",
          "The final archive contains 133 files, and the ZIP was checked against the source folder file for file. That last step is not glamorous, but it is the difference between a folder that looks finished and a package that really arrived intact."
        ]
      },
      {
        heading: "The line we would not cross",
        paragraphs: [
          "A package existing on disk is not proof that a store has approved it. The kit therefore separates verified local builds from confirmed public availability. Marketing should make a product inviting, but it should never move the finish line just to make the sentence sound better."
        ]
      }
    ],
    takeaway: "This week’s lesson: the final mile is not merely promotion. It is provenance, consistency, and making sure the public promise matches the build in your hands."
  },
  {
    slug: "forgeflix-server-online-movie-unavailable",
    title: "The Server Was Online. The Movie Wasn’t.",
    project: "ForgeFlix",
    category: "Software",
    date: "2026-10-06",
    displayDate: "October 6, 2026",
    status: "Fixed and verified",
    readTime: "4 min read",
    summary: "A Roku could see ForgeFlix, the server looked healthy, and 656 titles were catalogued—yet pressing Play still failed. The interesting bug lived between those facts.",
    image: "card-vault/brand-symbols/forgeflix-tile.png",
    imageAlt: "ForgeFlix logo",
    productUrl: "",
    productLabel: "",
    intro: "The most deceptive bugs are the ones surrounded by green lights. ForgeFlix was running. The library was visible. The Roku could find the server. Then a movie was selected and the screen answered with the digital equivalent of a locked door: unavailable.",
    sections: [
      {
        heading: "Healthy is a matter of perspective",
        paragraphs: [
          "PowerShell could browse the movie share on Server1hp. The ForgeFlix health page listed 656 items. From the outside, the path looked fine. Inside the Node process that actually prepares a stream, the same hostname-based network path failed with a low-level Windows error.",
          "A mapped drive path to the identical file worked. That gave the streaming layer a practical escape route: try the physical network path first, then fall back to the canonical mapped path already stored in the catalog."
        ]
      },
      {
        heading: "Testing beyond the Play button",
        paragraphs: [
          "The repair was given a regression test, but a unit test was not enough for a media server. A real film was requested through the playback API and decoded for 51 seconds—long enough to cross the 45-second conversion boundary and retrieve the final streaming segment.",
          "Only then did ‘fixed’ mean more than ‘the error disappeared.’ It meant the catalog path, transcoder, playlist, and actual media bytes survived the entire trip."
        ]
      },
      {
        heading: "One screen stayed untouched",
        paragraphs: [
          "The Roku was being used for YouTube during the repair, so the server-side work was verified without taking over the television. Good testing includes knowing which device not to interrupt."
        ]
      }
    ],
    takeaway: "An online server is not the same as a playable library. Follow the exact file from catalog to decoder, especially when Windows networking is involved."
  },
  {
    slug: "forged-model-lab-five-of-six",
    title: "Five Wins Out of Six Was Still Not Good Enough",
    project: "Forged Model Lab",
    category: "AI",
    date: "2026-10-06",
    displayDate: "October 6, 2026",
    status: "Research in progress",
    readTime: "5 min read",
    summary: "The strongest home-grown model yet nearly cleared the arena. We refused to crown it because one protected measure moved backward.",
    image: "assets/logos/forgedbyfire.jpg",
    imageAlt: "Forged By Fire anvil logo",
    productUrl: "ai.html",
    productLabel: "Explore our AI work",
    intro: "It is easy to celebrate a model when the headline number goes up. Forged Model Lab exists partly to make that celebration harder. This week produced the strongest candidate in the project so far—and the system still told us no.",
    sections: [
      {
        heading: "A founder, not a borrowed brain",
        paragraphs: [
          "The lineage began with a 124-million-parameter Llama-style model trained from scratch on roughly 2.5 billion tokens. Its preserved founder record gives every later experiment a known starting point and protects the original work from accidental replacement.",
          "The untouched founder could not follow the new instruction tasks. That was not a failure to hide; it was the honest baseline needed to measure whether later training taught anything real."
        ]
      },
      {
        heading: "The contender arrives",
        paragraphs: [
          "After a short recipe tournament, a 1,000-step contender learned 140 of 525 withheld concepts, performed strongly across coding, safety, and evolution checks, and won five of six frozen arena tasks. Compared with the first instruction child’s zero wins, it was a dramatic leap.",
          "But its protected foundation loss worsened by about 0.6 percent. The model had become more useful in visible ways while slipping on a capability the promotion gate was designed to protect. It remained a contender rather than receiving the BM-Evo-001 name."
        ]
      },
      {
        heading: "The tiny bug that beat the big score",
        paragraphs: [
          "A later repair branch improved broad evaluation numbers but produced broken Python: ‘def add(b, b)’. One malformed answer exposed what an average score could conceal. Longer training had overshot a useful early checkpoint and damaged a small but important behavior.",
          "The failed branches were not crowned, but their evidence was kept. That is how the lab evolves without rewriting its own history."
        ]
      }
    ],
    takeaway: "A model earns promotion by protecting what already works while adding new ability. Near-perfect is not the same as qualified."
  },
  {
    slug: "creative-pdf-blank-page",
    title: "Starting With a Blank Page—Literally",
    project: "Creative PDF",
    category: "Software",
    date: "2026-10-05",
    displayDate: "October 5, 2026",
    status: "In development",
    readTime: "4 min read",
    summary: "Creative PDF learned to create a document without opening one first, and that simple blank page had to survive editing, recovery, saving, and two operating systems.",
    image: "assets/logos/creative_pdf.png",
    imageAlt: "Creative PDF logo",
    productUrl: "paid-software.html#creative-pdf",
    productLabel: "View Creative PDF",
    intro: "A blank page looks like nothing. In a PDF editor, it is actually a promise: choose a size, place it in memory, let the user change it, recover it after trouble, save it correctly, and reopen it with every measurement intact.",
    sections: [
      {
        heading: "No source document required",
        paragraphs: [
          "Creative PDF can now begin with Letter or A4 paper, portrait or landscape, plus custom dimensions from 1 to 200 inches. The document then enters the same editing system as an imported PDF: pages can be duplicated, reordered, rotated, protected from deleting the last page, undone, saved, and reopened.",
          "A custom 5-by-7-inch test document came back with its exact geometry. That detail matters because ‘close enough’ page dimensions quickly become very visible when a file reaches a printer."
        ]
      },
      {
        heading: "Reliability is part of the feature",
        paragraphs: [
          "The blank-page work was tested alongside the less photogenic parts of an editor: restart recovery, multiple pending saves, malformed documents, oversized documents, worker cleanup, quick preview cancellation, and preserving the original source file.",
          "Windows completed its release reliability probe. Android passed nine emulator tests, and native release checks passed for Windows and Android arm64. The physical phone remained outside the automated test boundary."
        ]
      },
      {
        heading: "What comes after nothing",
        paragraphs: [
          "The next sensible layer is text-box composition: position text, remember it, undo it, and export it safely. Images and shapes can wait until words on a blank page are dependable."
        ]
      }
    ],
    takeaway: "The blank page is not empty anymore. It is now a tested document origin with recovery, dimensions, and a safe path to disk."
  },
  {
    slug: "latter-day-lens-android-reality-check",
    title: "The Android Edition We Haven’t Built Yet",
    project: "Latter-day Lens",
    category: "Software",
    date: "2026-10-05",
    displayDate: "October 5, 2026",
    status: "Platform research",
    readTime: "3 min read",
    summary: "A status check answered an important question with a plain ‘not yet’—and saved a responsive Windows interface from being mistaken for an Android app.",
    image: "assets/logos/latterday_lens.png",
    imageAlt: "Latter-day Lens logo",
    productUrl: "latterday-lens.html",
    productLabel: "Explore Latter-day Lens",
    intro: "Sometimes development progress means proving that a project has not started. That answer is useful when memories, folders, and plans begin to blur together across several platforms.",
    sections: [
      {
        heading: "Tablet-friendly is not Android",
        paragraphs: [
          "Latter-day Lens currently has responsive layouts and touch-friendly work aimed at Windows and Surface tablets. Those features can feel mobile, but the application underneath remains Electron and React packaged for Windows APPX.",
          "There is no Android manifest, Gradle project, Kotlin or Java layer, Capacitor bridge, APK, or AAB. The Android edition is still a roadmap item rather than a hidden half-finished build."
        ]
      },
      {
        heading: "Why the distinction matters",
        paragraphs: [
          "A real Android edition needs more than a narrower screen. File access, navigation, packaging, touch behavior, device testing, and Store rules all change. Calling the existing responsive interface an Android start would make the remaining work look smaller than it is.",
          "So this week’s result was a clean boundary: Windows tablet support exists; Android platform work does not. That gives the eventual mobile project an honest starting line."
        ]
      }
    ],
    takeaway: "‘Planned’ is a real status. Saying it clearly prevents future work from inheriting imaginary progress."
  },
  {
    slug: "card-vault-ampharos-gap",
    title: "The Ampharos That Exposed a Three-Platform Gap",
    project: "Card Vault",
    category: "Software",
    date: "2026-10-05",
    displayDate: "October 5, 2026",
    status: "Fix verified; Windows update pending",
    readTime: "4 min read",
    summary: "One badly read Pokémon card showed that Android, the hosted web app, and the installed Windows package were not all carrying the same scanner.",
    image: "card-vault/card-vault-icon.png",
    imageAlt: "Card Vault logo",
    productUrl: "card-vault/",
    productLabel: "Open Card Vault",
    intro: "The feedback was wonderfully specific: an Ampharos card, number 40/114, had turned into the nonsense phrase ‘SIEES A arne wll.’ One strange scan was enough to trace a much larger release problem.",
    sections: [
      {
        heading: "Following the card",
        paragraphs: [
          "The saved report came from Android and used an older July OCR engine. The mistaken text had already taught the current scanner a correction for Ampharos, and a regression test now preserves that lesson. Seven focused OCR and search tests passed.",
          "The hosted web app and Android wrapper were using the newer September scanner. The installed Microsoft Store package was not. It still carried the older engine and did not contain the Ampharos correction."
        ]
      },
      {
        heading: "One product, three delivery paths",
        paragraphs: [
          "Android loads the hosted Card Vault web assets, so a web deployment can improve its scanner. The Windows Store package bundles a private copy of those assets. It stays frozen until a new package is built and delivered.",
          "That difference is invisible when the interfaces look alike. The version marker inside each build told the real story."
        ]
      },
      {
        heading: "What one report accomplished",
        paragraphs: [
          "The original scan failure is repaired in current source and hosted code, and it now has a test. It also revealed that the Windows release needs a future package update. One card became both a vocabulary lesson and a release-management lesson."
        ]
      }
    ],
    takeaway: "Shared code does not guarantee shared releases. When a fix matters, verify the version actually installed on every platform."
  },
  {
    slug: "four-ais-four-jobs",
    title: "Four AIs, Four Different Jobs",
    project: "OTTO, V.E.N.T, TreV & Coach",
    category: "AI",
    date: "2026-10-05",
    displayDate: "October 5, 2026",
    status: "Product direction",
    readTime: "4 min read",
    summary: "Researching the AI page made one thing clear: these projects should not be squeezed into the same chatbot-shaped box.",
    image: "assets/logos/otto-thinking.webp",
    imageAlt: "OTTO assistant thinking",
    productUrl: "ai.html",
    productLabel: "Explore the AI projects",
    intro: "The phrase ‘AI product’ can flatten very different ideas into one vague promise. Looking closely at OTTO, V.E.N.T, TreV, and Coach revealed four assistants with four different responsibilities—and four different boundaries.",
    sections: [
      {
        heading: "OTTO asks before it acts",
        paragraphs: [
          "OTTO is a local-first Windows assistant aimed at everyday technology and PC help. It can perform read-only diagnostics, but machine-changing work belongs behind an explicit plan and approval. The long-term ambition is broad; the current Store package is not ready, and the public description says so."
        ]
      },
      {
        heading: "V.E.N.T listens without pretending to be a therapist",
        paragraphs: [
          "V.E.N.T is a reflection and journaling companion with local-first storage and safety routing. Its most important feature may be the line it refuses to cross: it is not clinical care, an emergency service, or a substitute for trusted human support."
        ]
      },
      {
        heading: "TreV and Coach live inside the work",
        paragraphs: [
          "TreV belongs inside Master Generator, where it can assist with campaign context when requested while campaign vaults stay local. Coach belongs inside Card Vault, where owned cards, deck legality, synergies, and collection gaps give its advice a concrete purpose.",
          "Neither needs to pretend to be a standalone digital person. Their value comes from being present at the exact moment a creator or collector needs help."
        ]
      }
    ],
    takeaway: "Good AI design starts by naming the job, the data boundary, and the moment when the assistant must stop and ask."
  },
  {
    slug: "cartrev-real-towers",
    title: "The Towers Had to Be the Real Towers",
    project: "CarTrev Towers",
    category: "Games",
    date: "2026-10-04",
    displayDate: "October 4, 2026",
    status: "Store preparation",
    readTime: "4 min read",
    summary: "The Store hero scene looked dramatic, but its towers were stand-ins. The final artwork now uses the exact level-three sprites players see in the game.",
    image: "assets/logos/cartrev-towers.png",
    imageAlt: "CarTrev Towers logo",
    productUrl: "cartrev-towers.html",
    productLabel: "Explore CarTrev Towers",
    intro: "Store artwork gets only a few seconds to explain a game. That makes exaggeration tempting. For CarTrev Towers, the better answer was the opposite: put the real game pieces on the battlefield.",
    sections: [
      {
        heading: "Two editions, two boundaries",
        paragraphs: [
          "Before changing the art, the public release was separated carefully from the Family edition. They have different executables, data locations, overrides, and release tracks. The public Store build keeps local profiles and saves without online accounts, ads, payments, analytics, or remote connections.",
          "That boundary matters because a polished screenshot is not worth accidentally mixing private edition behavior into the public package."
        ]
      },
      {
        heading: "No lookalike towers",
        paragraphs: [
          "The scenery was cleaned up into a single stone route between the red enemy portal and the cyan friendly portal. Then six unchanged level-three tower sprites were composited directly from the game: Bolt, Mortar, Frost, Sky, Storm, and the Monkey Launcher.",
          "The final hero image is 3840 by 2160 pixels. Generated scenery helped create the stage, but the stars standing on it are literal game assets—not AI approximations."
        ]
      },
      {
        heading: "Why authenticity reads better",
        paragraphs: [
          "Players should be able to look at the Store image, launch the game, and recognize what they were promised. Matching the artwork to the actual visual language makes the composition not only more accurate, but more distinctly CarTrev."
        ]
      }
    ],
    takeaway: "Marketing art can be imaginative without replacing the product’s identity. Let the real assets carry the promise."
  },
  {
    slug: "creative-image-tools-demo-live",
    title: "Uploaded Is Not the Same as Live",
    project: "Creative Image Tools",
    category: "Software",
    date: "2026-10-02",
    displayDate: "October 2, 2026",
    status: "Demo published",
    readTime: "3 min read",
    summary: "A 98-second phone demo made it into the website repository, returned a 404, and then taught a useful lesson about what ‘published’ really means.",
    image: "assets/logos/creative_image_tools.png",
    imageAlt: "Creative Image Tools logo",
    productUrl: "creative-image-tools.html",
    productLabel: "Explore Creative Image Tools",
    intro: "The demo file was finished, copied, hashed, committed, and pushed. Then the public link said 404. For a few minutes, every local fact was correct and the website was still wrong.",
    sections: [
      {
        heading: "The quiet space between push and publish",
        paragraphs: [
          "GitHub Pages had accepted the new commit, but its deployment had not finished. The first request reached the old public site, where the video did not exist. Waiting for the actual deployment—not simply the push—turned the missing page into a real media response.",
          "That delay became part of the publishing checklist instead of being mistaken for a broken file."
        ]
      },
      {
        heading: "Proving it was the same video",
        paragraphs: [
          "The public copy returned the correct video content type and exact byte length. Its hash matched the local source. Media inspection found a 1080-by-1920 H.264 video running for just over 98 seconds, and a complete decode passed without relying on the browser’s first frame.",
          "In other words, the link did not merely exist. The full video arrived intact and could actually play."
        ]
      },
      {
        heading: "A small publishing rule",
        paragraphs: [
          "Commit, deployment, download, and playback are four different milestones. The website only gets credit for the last one."
        ]
      }
    ],
    takeaway: "When the deliverable is media, verify the public bytes and decode—not only the green check beside a deployment."
  },
  {
    slug: "creative-qr-build-not-release",
    title: "A Build Is Not a Release",
    project: "Creative QR",
    category: "Software",
    date: "2026-10-02",
    displayDate: "October 2, 2026",
    status: "Early development",
    readTime: "4 min read",
    summary: "Creative QR could build, install, and launch on Android. A closer look found the distance between a working prototype and something ready for Google Play.",
    image: "assets/logos/creative_qr.png",
    imageAlt: "Creative QR logo",
    productUrl: "creative-qr.html",
    productLabel: "Explore Creative QR",
    intro: "The reassuring part came first: Creative QR produced a debug APK, produced a release bundle, installed on the emulator, and opened. The more valuable part came next: asking what those successes did not prove.",
    sections: [
      {
        heading: "What worked",
        paragraphs: [
          "The native Android prototype generates QR codes locally with ZXing, scans with CameraX and ML Kit, and stores saved records on the device. It targets current Android tooling and the basic app loop is visible on an API 36 emulator.",
          "Those are real foundations. They are also only foundations."
        ]
      },
      {
        heading: "What the bundle was hiding",
        paragraphs: [
          "The release bundle was unsigned. Lint stopped on a CameraX opt-in issue and still had additional warnings. The test task had no tests to run. The displayed version did not match the package version, and the tablet breakpoint was too narrow for the range of layouts the Store may put in front of the app.",
          "Several experiences were still scaffolding: Save recorded the QR payload rather than exporting an image, Share sent plain text, and the Style area described future functionality."
        ]
      },
      {
        heading: "Why forty percent was better than ‘almost done’",
        paragraphs: [
          "Calling the app roughly 40 percent release-ready was not pessimism. It separated the working generator and scanner from signing, tests, export, sharing, responsive layouts, screenshots, and Store submission work.",
          "A truthful estimate gives the next development pass somewhere useful to begin."
        ]
      }
    ],
    takeaway: "Compilation proves that code can become a package. Release readiness proves that the package is signed, tested, complete, and ready for real devices."
  },
  {
    slug: "master-generator-ten-new-faces",
    title: "Ten New Faces for the Campaign Binder",
    project: "Master Generator",
    category: "Creative Work",
    date: "2026-10-01",
    displayDate: "October 1, 2026",
    status: "Content expansion",
    readTime: "3 min read",
    summary: "A new CR 2 NPC batch mixed randomness with rules, producing ten distinct characters without pretending their homebrew balance was official.",
    image: "assets/screenshots/master-generator/master-generator-v2-magic-items.png",
    imageAlt: "Master Generator fantasy card collection",
    productUrl: "master-generator.html",
    productLabel: "Explore Master Generator",
    intro: "Random generation is fun right up until the numbers stop making sense. The latest NPC batch kept species, role, alignment, personality, artwork, and abilities unpredictable while forcing combat power to answer to the stated challenge rating.",
    sections: [
      {
        heading: "Random, but accountable",
        paragraphs: [
          "Ten CR 2 NPC cards were created with individual artwork, editable source data, a preview sheet, saved prompts, and a balance review. Offensive and defensive assumptions were compared instead of treating a creative label as proof.",
          "The cards remain homebrew design estimates pending playtesting. That sentence belongs beside the art because honesty is part of the content pipeline, not a disclaimer added later."
        ]
      },
      {
        heading: "A repeatable craft",
        paragraphs: [
          "The renderer preserves original art, fits it into the established parchment layout, and exports high-resolution cards. Prompts and provenance remain with the project so the final PNG is not the only surviving record of how a character came to exist.",
          "The work also stayed inside the NPC archive. The Monsters collection served as a visual and procedural reference without being altered."
        ]
      },
      {
        heading: "Where this meets the app",
        paragraphs: [
          "Master Generator discovers card art through a generated manifest. Expanding the archive and integrating it into the product are related jobs, but not the same job. This batch completed the creative deliverables; app catalog integration remains a separate, verifiable step."
        ]
      }
    ],
    takeaway: "Procedural creativity is strongest when surprise lives in the character and discipline lives in the numbers."
  }
];
