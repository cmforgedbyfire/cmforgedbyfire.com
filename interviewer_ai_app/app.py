
import json
import os
import sys
import urllib.request
from datetime import datetime
from pathlib import Path
import tkinter as tk
from tkinter import ttk, messagebox
from tkinter import scrolledtext

APP_TITLE = "Interviewer AI"
DEFAULT_MODEL = "llama3.1:8b"
OLLAMA_URL = "http://localhost:11434/api/generate"

BASE_DIR = Path(__file__).resolve().parent
TEMPLATE_DIR = BASE_DIR.parent / "interviewer_ai"
QUESTION_BANK_PATH = TEMPLATE_DIR / "question_bank.json"
PROJECT_BRIEF_PATH = TEMPLATE_DIR / "project_brief.json"
SUBJECT_PROFILE_PATH = TEMPLATE_DIR / "subject_profile.json"
INTERVIEW_GUIDE_PATH = TEMPLATE_DIR / "interview_guide.json"
DIRECTOR_NOTES_PATH = TEMPLATE_DIR / "director_producer.json"
SESSIONS_DIR = TEMPLATE_DIR / "sessions"


def utc_now():
    return datetime.utcnow().isoformat() + "Z"


def load_json(path):
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def save_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp_path = path.with_suffix(path.suffix + ".tmp")
    with tmp_path.open("w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    tmp_path.replace(path)


def list_to_text(items):
    return "\n".join(items or [])


def text_to_list(value):
    return [line.strip() for line in value.splitlines() if line.strip()]


def build_question_list(question_bank):
    items = []
    for key, value in question_bank.items():
        if key == "version":
            continue
        if not isinstance(value, list):
            continue
        for idx, q in enumerate(value, start=1):
            if key == "scope_ideas":
                text = f"Scope idea: {q}"
            else:
                text = q
            items.append({
                "id": f"{key}-{idx}",
                "category": key,
                "question": text,
                "answer": "",
                "source": "bank",
                "created_at": utc_now()
            })
    return items


def call_ollama(model, prompt):
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(OLLAMA_URL, data=data, method="POST")
    req.add_header("Content-Type", "application/json")
    with urllib.request.urlopen(req, timeout=180) as resp:
        body = resp.read().decode("utf-8")
        parsed = json.loads(body)
        return parsed.get("response", "").strip()


def load_or_default(path, default_factory):
    if path.exists():
        return load_json(path)
    return default_factory()


def default_project_brief():
    return {
        "version": "1.0",
        "project_name": "",
        "working_title": "",
        "logline": "",
        "purpose": "",
        "audience": "",
        "format": "documentary",
        "estimated_runtime_minutes": 0,
        "story_goals": [],
        "core_themes": [],
        "scope_boundaries": {
            "in_scope": [],
            "out_of_scope": []
        },
        "tone_and_style": {
            "tone": "",
            "visual_style": "",
            "reference_titles": []
        },
        "ethics_and_safety": {
            "sensitive_topics": [],
            "consent_requirements": [],
            "risk_mitigation": []
        },
        "production_constraints": {
            "budget_range": "",
            "schedule": "",
            "locations": [],
            "crew_size": "",
            "legal_clearances": []
        },
        "deliverables": [],
        "open_questions": []
    }


def default_subject_profile():
    return {
        "version": "1.0",
        "subject_name": "",
        "preferred_name": "",
        "contact": {
            "phone": "",
            "email": "",
            "agent_or_rep": ""
        },
        "background_summary": "",
        "key_life_events": [],
        "values_and_beliefs": [],
        "current_challenges": [],
        "strengths_and_skills": [],
        "sensitive_areas": {
            "topics_to_avoid": [],
            "phrasing_to_avoid": [],
            "trigger_warnings": []
        },
        "access_and_availability": {
            "best_times": "",
            "preferred_location": "",
            "travel_constraints": ""
        },
        "consent": {
            "release_signed": False,
            "usage_limits": "",
            "anonymity_requests": ""
        },
        "pre_interview_notes": [],
        "ai_intake_summary": ""
    }


def default_interview_guide():
    return {
        "version": "1.0",
        "project_name": "",
        "interview_date": "",
        "location": "",
        "interviewer": "",
        "director_notes": "",
        "sections": []
    }


def default_director_notes():
    return {
        "version": "1.0",
        "story_arc": "",
        "scene_beats": [],
        "visual_motifs": [],
        "risks_and_ethics": [],
        "consent_notes": "",
        "production_notes": "",
        "open_questions": []
    }


class ScrollableFrame(ttk.Frame):
    def __init__(self, parent):
        super().__init__(parent)
        canvas = tk.Canvas(self, highlightthickness=0)
        scrollbar = ttk.Scrollbar(self, orient="vertical", command=canvas.yview)
        self.scrollable_frame = ttk.Frame(canvas)

        self.scrollable_frame.bind(
            "<Configure>",
            lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
        )
        canvas.create_window((0, 0), window=self.scrollable_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)

        canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")

        self.canvas = canvas


class InterviewApp:
    def __init__(self, root):
        self.root = root
        self.root.title(APP_TITLE)
        self.root.geometry("980x700")

        self.model_var = tk.StringVar(value=DEFAULT_MODEL)
        self.subject_var = tk.StringVar(value="")
        self.status_var = tk.StringVar(value="Ready")

        self.question_bank = self.load_question_bank()
        self.questions = build_question_list(self.question_bank)
        self.index = 0

        self.project_brief = load_or_default(PROJECT_BRIEF_PATH, default_project_brief)
        self.subject_profile = load_or_default(SUBJECT_PROFILE_PATH, default_subject_profile)
        self.interview_guide = load_or_default(INTERVIEW_GUIDE_PATH, default_interview_guide)
        self.director_notes = load_or_default(DIRECTOR_NOTES_PATH, default_director_notes)

        self.session = {
            "version": "1.0",
            "created_at": utc_now(),
            "updated_at": utc_now(),
            "subject_name": "",
            "model": DEFAULT_MODEL,
            "questions": self.questions,
            "project_brief": self.project_brief,
            "subject_profile": self.subject_profile,
            "interview_guide": self.interview_guide,
            "director_producer": self.director_notes
        }

        self.capture_targets = {
            "Subject: pre_interview_notes": ("subject", "pre_interview_notes"),
            "Project: open_questions": ("project", "open_questions"),
            "Director: scene_beats": ("director", "scene_beats"),
            "Director: open_questions": ("director", "open_questions"),
            "Guide: current section questions": ("guide", "section_primary")
        }
        self.capture_var = tk.StringVar(value=list(self.capture_targets.keys())[0])

        self.build_ui()
        self.render_question()
        self.populate_project_brief_fields()
        self.populate_subject_profile_fields()
        self.populate_interview_guide_fields()
        self.populate_director_notes_fields()

    def load_question_bank(self):
        if not QUESTION_BANK_PATH.exists():
            messagebox.showerror(APP_TITLE, f"Missing {QUESTION_BANK_PATH}")
            return {"version": "1.0"}
        return load_json(QUESTION_BANK_PATH)

    def build_ui(self):
        pad = {"padx": 10, "pady": 6}

        header = ttk.Frame(self.root)
        header.pack(fill="x", **pad)

        ttk.Label(header, text="Subject").grid(row=0, column=0, sticky="w")
        ttk.Entry(header, textvariable=self.subject_var, width=30).grid(row=0, column=1, sticky="w")

        ttk.Label(header, text="Model").grid(row=0, column=2, sticky="w", padx=(16, 4))
        ttk.Entry(header, textvariable=self.model_var, width=22).grid(row=0, column=3, sticky="w")

        ttk.Button(header, text="Save Session", command=self.save_session).grid(row=0, column=4, sticky="e", padx=(16, 0))
        ttk.Button(header, text="Save All", command=self.save_all_outputs).grid(row=0, column=5, sticky="e", padx=(6, 0))

        header.grid_columnconfigure(1, weight=1)
        header.grid_columnconfigure(3, weight=1)

        notebook = ttk.Notebook(self.root)
        notebook.pack(fill="both", expand=True, **pad)

        self.tab_interview = ttk.Frame(notebook)
        self.tab_project = ttk.Frame(notebook)
        self.tab_subject = ttk.Frame(notebook)
        self.tab_guide = ttk.Frame(notebook)
        self.tab_director = ttk.Frame(notebook)

        notebook.add(self.tab_interview, text="Interview Flow")
        notebook.add(self.tab_project, text="Project Brief")
        notebook.add(self.tab_subject, text="Subject Profile")
        notebook.add(self.tab_guide, text="Interview Guide")
        notebook.add(self.tab_director, text="Director/Producer")

        self.build_interview_tab()
        self.build_project_tab()
        self.build_subject_tab()
        self.build_guide_tab()
        self.build_director_tab()

    def build_interview_tab(self):
        pad = {"padx": 10, "pady": 6}
        body = ttk.Frame(self.tab_interview)
        body.pack(fill="both", expand=True, **pad)

        self.question_label = ttk.Label(body, text="", wraplength=900, font=("Segoe UI", 14, "bold"))
        self.question_label.pack(anchor="w", pady=(0, 10))

        ttk.Label(body, text="Answer").pack(anchor="w")
        self.answer_text = scrolledtext.ScrolledText(body, height=12, wrap="word")
        self.answer_text.pack(fill="both", expand=True)

        capture_frame = ttk.Frame(body)
        capture_frame.pack(fill="x", pady=(10, 0))
        ttk.Label(capture_frame, text="Capture answer to").pack(side="left")
        ttk.OptionMenu(capture_frame, self.capture_var, self.capture_var.get(), *self.capture_targets.keys()).pack(side="left", padx=(6, 0))
        ttk.Button(capture_frame, text="Capture", command=self.capture_answer).pack(side="left", padx=(6, 0))

        controls = ttk.Frame(self.tab_interview)
        controls.pack(fill="x", **pad)

        ttk.Button(controls, text="Previous", command=self.prev_question).pack(side="left")
        ttk.Button(controls, text="Next", command=self.next_question).pack(side="left", padx=(6, 0))
        ttk.Button(controls, text="Skip", command=self.skip_question).pack(side="left", padx=(6, 0))
        ttk.Button(controls, text="AI Follow-up", command=self.insert_follow_up).pack(side="left", padx=(20, 0))
        ttk.Button(controls, text="AI 5 Follow-ups", command=self.insert_follow_ups_batch).pack(side="left", padx=(6, 0))

        self.status_label = ttk.Label(controls, textvariable=self.status_var)
        self.status_label.pack(side="right")

    def build_project_tab(self):
        frame = ScrollableFrame(self.tab_project)
        frame.pack(fill="both", expand=True, padx=10, pady=6)
        body = frame.scrollable_frame

        self.project_fields = {}

        self.project_fields["project_name"] = self.add_entry(body, "Project name")
        self.project_fields["working_title"] = self.add_entry(body, "Working title")
        self.project_fields["logline"] = self.add_entry(body, "Logline")
        self.project_fields["purpose"] = self.add_entry(body, "Purpose")
        self.project_fields["audience"] = self.add_entry(body, "Audience")
        self.project_fields["estimated_runtime_minutes"] = self.add_entry(body, "Estimated runtime (minutes)")

        self.project_fields["story_goals"] = self.add_text(body, "Story goals (one per line)", height=4)
        self.project_fields["core_themes"] = self.add_text(body, "Core themes (one per line)", height=4)
        self.project_fields["in_scope"] = self.add_text(body, "In scope (one per line)", height=4)
        self.project_fields["out_of_scope"] = self.add_text(body, "Out of scope (one per line)", height=4)

        self.project_fields["tone"] = self.add_entry(body, "Tone")
        self.project_fields["visual_style"] = self.add_entry(body, "Visual style")
        self.project_fields["reference_titles"] = self.add_text(body, "Reference titles (one per line)", height=4)

        self.project_fields["sensitive_topics"] = self.add_text(body, "Sensitive topics (one per line)", height=4)
        self.project_fields["consent_requirements"] = self.add_text(body, "Consent requirements (one per line)", height=4)
        self.project_fields["risk_mitigation"] = self.add_text(body, "Risk mitigation (one per line)", height=4)

        self.project_fields["budget_range"] = self.add_entry(body, "Budget range")
        self.project_fields["schedule"] = self.add_entry(body, "Schedule")
        self.project_fields["locations"] = self.add_text(body, "Locations (one per line)", height=3)
        self.project_fields["crew_size"] = self.add_entry(body, "Crew size")
        self.project_fields["legal_clearances"] = self.add_text(body, "Legal clearances (one per line)", height=3)

        self.project_fields["deliverables"] = self.add_text(body, "Deliverables (one per line)", height=3)
        self.project_fields["open_questions"] = self.add_text(body, "Open questions (one per line)", height=3)

    def build_subject_tab(self):
        frame = ScrollableFrame(self.tab_subject)
        frame.pack(fill="both", expand=True, padx=10, pady=6)
        body = frame.scrollable_frame

        self.subject_fields = {}

        self.subject_fields["subject_name"] = self.add_entry(body, "Subject name")
        self.subject_fields["preferred_name"] = self.add_entry(body, "Preferred name")
        self.subject_fields["phone"] = self.add_entry(body, "Phone")
        self.subject_fields["email"] = self.add_entry(body, "Email")
        self.subject_fields["agent_or_rep"] = self.add_entry(body, "Agent/Rep")

        self.subject_fields["background_summary"] = self.add_text(body, "Background summary", height=4)
        self.subject_fields["key_life_events"] = self.add_text(body, "Key life events (one per line)", height=4)
        self.subject_fields["values_and_beliefs"] = self.add_text(body, "Values and beliefs (one per line)", height=4)
        self.subject_fields["current_challenges"] = self.add_text(body, "Current challenges (one per line)", height=4)
        self.subject_fields["strengths_and_skills"] = self.add_text(body, "Strengths and skills (one per line)", height=4)

        self.subject_fields["topics_to_avoid"] = self.add_text(body, "Topics to avoid (one per line)", height=3)
        self.subject_fields["phrasing_to_avoid"] = self.add_text(body, "Phrasing to avoid (one per line)", height=3)
        self.subject_fields["trigger_warnings"] = self.add_text(body, "Trigger warnings (one per line)", height=3)

        self.subject_fields["best_times"] = self.add_entry(body, "Best times to interview")
        self.subject_fields["preferred_location"] = self.add_entry(body, "Preferred location")
        self.subject_fields["travel_constraints"] = self.add_entry(body, "Travel constraints")

        self.subject_release_var = tk.BooleanVar(value=False)
        self.add_check(body, "Release signed", self.subject_release_var)
        self.subject_fields["usage_limits"] = self.add_entry(body, "Usage limits")
        self.subject_fields["anonymity_requests"] = self.add_entry(body, "Anonymity requests")

        self.subject_fields["pre_interview_notes"] = self.add_text(body, "Pre-interview notes (one per line)", height=4)
        self.subject_fields["ai_intake_summary"] = self.add_text(body, "AI intake summary", height=4)

        btn_frame = ttk.Frame(body)
        btn_frame.pack(fill="x", pady=(6, 0))
        ttk.Button(btn_frame, text="AI Summarize From Session", command=self.ai_summarize_subject).pack(side="left")

    def build_guide_tab(self):
        body = ttk.Frame(self.tab_guide)
        body.pack(fill="both", expand=True, padx=10, pady=6)

        form = ttk.Frame(body)
        form.pack(fill="x")

        self.guide_fields = {}
        self.guide_fields["project_name"] = self.add_entry(form, "Project name")
        self.guide_fields["interview_date"] = self.add_entry(form, "Interview date")
        self.guide_fields["location"] = self.add_entry(form, "Location")
        self.guide_fields["interviewer"] = self.add_entry(form, "Interviewer")
        self.guide_fields["director_notes"] = self.add_text(form, "Director notes", height=3)

        section_frame = ttk.LabelFrame(body, text="Sections")
        section_frame.pack(fill="both", expand=True, pady=(10, 0))

        left = ttk.Frame(section_frame)
        left.pack(side="left", fill="y", padx=6, pady=6)

        self.section_list = tk.Listbox(left, height=12)
        self.section_list.pack(side="left", fill="y")
        self.section_list.bind("<<ListboxSelect>>", self.on_section_select)

        list_scroll = ttk.Scrollbar(left, orient="vertical", command=self.section_list.yview)
        list_scroll.pack(side="right", fill="y")
        self.section_list.configure(yscrollcommand=list_scroll.set)

        right = ttk.Frame(section_frame)
        right.pack(side="left", fill="both", expand=True, padx=10, pady=6)

        self.section_fields = {}
        self.section_fields["section_title"] = self.add_entry(right, "Section title")
        self.section_fields["intent"] = self.add_entry(right, "Intent")
        self.section_fields["primary_questions"] = self.add_text(right, "Primary questions (one per line)", height=5)
        self.section_fields["follow_ups"] = self.add_text(right, "Follow-ups (one per line)", height=5)

        button_row = ttk.Frame(right)
        button_row.pack(fill="x", pady=(6, 0))
        ttk.Button(button_row, text="Add Section", command=self.add_section).pack(side="left")
        ttk.Button(button_row, text="Update Section", command=self.update_section).pack(side="left", padx=(6, 0))
        ttk.Button(button_row, text="Remove Section", command=self.remove_section).pack(side="left", padx=(6, 0))
        ttk.Button(button_row, text="AI Build Guide", command=self.ai_build_guide).pack(side="left", padx=(20, 0))

    def build_director_tab(self):
        frame = ScrollableFrame(self.tab_director)
        frame.pack(fill="both", expand=True, padx=10, pady=6)
        body = frame.scrollable_frame

        self.director_fields = {}
        self.director_fields["story_arc"] = self.add_text(body, "Story arc", height=4)
        self.director_fields["scene_beats"] = self.add_text(body, "Scene beats (one per line)", height=4)
        self.director_fields["visual_motifs"] = self.add_text(body, "Visual motifs (one per line)", height=4)
        self.director_fields["risks_and_ethics"] = self.add_text(body, "Risks and ethics (one per line)", height=4)
        self.director_fields["consent_notes"] = self.add_text(body, "Consent notes", height=3)
        self.director_fields["production_notes"] = self.add_text(body, "Production notes", height=3)
        self.director_fields["open_questions"] = self.add_text(body, "Open questions (one per line)", height=3)

    def add_entry(self, parent, label):
        frame = ttk.Frame(parent)
        frame.pack(fill="x", pady=4)
        ttk.Label(frame, text=label, width=26).pack(side="left", anchor="w")
        var = tk.StringVar()
        entry = ttk.Entry(frame, textvariable=var)
        entry.pack(side="left", fill="x", expand=True)
        return var

    def add_text(self, parent, label, height=4):
        frame = ttk.Frame(parent)
        frame.pack(fill="x", pady=4)
        ttk.Label(frame, text=label, width=26).pack(side="left", anchor="nw")
        text = scrolledtext.ScrolledText(frame, height=height, wrap="word")
        text.pack(side="left", fill="x", expand=True)
        return text

    def add_check(self, parent, label, var):
        frame = ttk.Frame(parent)
        frame.pack(fill="x", pady=4)
        ttk.Label(frame, text=label, width=26).pack(side="left", anchor="w")
        ttk.Checkbutton(frame, variable=var).pack(side="left")

    def render_question(self):
        if not self.questions:
            self.question_label.config(text="No questions available")
            self.answer_text.delete("1.0", "end")
            return
        q = self.questions[self.index]
        self.question_label.config(text=f"{self.index + 1}/{len(self.questions)}: {q['question']}")
        self.answer_text.delete("1.0", "end")
        if q.get("answer"):
            self.answer_text.insert("1.0", q["answer"])
        self.status_var.set(f"Category: {q.get('category', '')}")

    def save_current_answer(self):
        if not self.questions:
            return
        answer = self.answer_text.get("1.0", "end").strip()
        self.questions[self.index]["answer"] = answer
        self.session["updated_at"] = utc_now()
        self.session["subject_name"] = self.subject_var.get().strip()
        self.session["model"] = self.model_var.get().strip() or DEFAULT_MODEL

    def next_question(self):
        self.save_current_answer()
        if self.index < len(self.questions) - 1:
            self.index += 1
            self.render_question()
        else:
            self.status_var.set("End of questions")

    def prev_question(self):
        self.save_current_answer()
        if self.index > 0:
            self.index -= 1
            self.render_question()

    def skip_question(self):
        if not self.questions:
            return
        self.answer_text.delete("1.0", "end")
        self.next_question()

    def insert_follow_up(self):
        self._insert_follow_ups(count=1)

    def insert_follow_ups_batch(self):
        self._insert_follow_ups(count=5)

    def _insert_follow_ups(self, count=1):
        if not self.questions:
            return
        self.save_current_answer()
        last_answer = self.questions[self.index].get("answer", "")
        if not last_answer:
            messagebox.showinfo(APP_TITLE, "Answer the current question first.")
            return
        model = self.model_var.get().strip() or DEFAULT_MODEL
        prompt = (
            "You are a documentary interview producer. "
            f"Given the answer below, ask {count} deep follow-up question"
            + ("" if count == 1 else "s")
            + ". Return only a JSON array of strings.\n\n"
            f"Answer: {last_answer}"
        )
        self.status_var.set("Calling Ollama...")
        self.root.update_idletasks()
        try:
            response = call_ollama(model, prompt)
        except Exception as exc:
            messagebox.showerror(APP_TITLE, f"Ollama error: {exc}")
            self.status_var.set("Ready")
            return

        try:
            items = json.loads(response)
        except json.JSONDecodeError:
            items = [response.strip()]

        if not items:
            messagebox.showinfo(APP_TITLE, "No follow-up generated.")
            self.status_var.set("Ready")
            return

        insert_at = self.index + 1
        for item in items:
            follow_up = str(item).strip().strip('"')
            if not follow_up:
                continue
            new_item = {
                "id": f"ai-{len(self.questions) + 1}",
                "category": "ai_follow_up",
                "question": follow_up,
                "answer": "",
                "source": "ollama",
                "created_at": utc_now()
            }
            self.questions.insert(insert_at, new_item)
            insert_at += 1
        self.index = min(self.index + 1, len(self.questions) - 1)
        self.render_question()

    def capture_answer(self):
        self.save_current_answer()
        q = self.questions[self.index]
        answer = q.get("answer", "")
        if not answer:
            messagebox.showinfo(APP_TITLE, "Answer the current question first.")
            return
        capture_key = self.capture_var.get()
        target = self.capture_targets.get(capture_key)
        if not target:
            return
        text = f"Q: {q['question']}\nA: {answer}"
        if target[0] == "subject":
            self.subject_profile.setdefault("pre_interview_notes", []).append(text)
            self.populate_subject_profile_fields()
        elif target[0] == "project":
            self.project_brief.setdefault("open_questions", []).append(text)
            self.populate_project_brief_fields()
        elif target[0] == "director":
            self.director_notes.setdefault(target[1], []).append(text)
            self.populate_director_notes_fields()
        elif target[0] == "guide":
            self.append_question_to_current_section(text)
        self.status_var.set(f"Captured to {capture_key}")

    def append_question_to_current_section(self, question):
        idx = self.get_selected_section_index()
        if idx is None:
            messagebox.showinfo(APP_TITLE, "Select a section in Interview Guide first.")
            return
        section = self.interview_guide["sections"][idx]
        section.setdefault("primary_questions", []).append(question)
        self.refresh_section_list()
        self.section_list.selection_set(idx)
        self.on_section_select()

    def get_selected_section_index(self):
        selection = self.section_list.curselection()
        if not selection:
            return None
        return selection[0]

    def save_session(self):
        self.save_current_answer()
        self.sync_all_fields_to_data()
        subject = self.subject_var.get().strip() or "unknown_subject"
        safe_subject = "".join(c for c in subject if c.isalnum() or c in ("-", "_"))
        stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"session_{safe_subject}_{stamp}.json"
        path = SESSIONS_DIR / filename
        try:
            save_json(path, self.session)
        except Exception as exc:
            messagebox.showerror(APP_TITLE, f"Save failed: {exc}")
            return
        self.status_var.set(f"Saved: {path}")

    def save_all_outputs(self):
        self.sync_all_fields_to_data()
        try:
            save_json(PROJECT_BRIEF_PATH, self.project_brief)
            save_json(SUBJECT_PROFILE_PATH, self.subject_profile)
            save_json(INTERVIEW_GUIDE_PATH, self.interview_guide)
            save_json(DIRECTOR_NOTES_PATH, self.director_notes)
        except Exception as exc:
            messagebox.showerror(APP_TITLE, f"Save failed: {exc}")
            return
        self.status_var.set("Saved all outputs")

    def sync_all_fields_to_data(self):
        self.project_brief["project_name"] = self.project_fields["project_name"].get().strip()
        self.project_brief["working_title"] = self.project_fields["working_title"].get().strip()
        self.project_brief["logline"] = self.project_fields["logline"].get().strip()
        self.project_brief["purpose"] = self.project_fields["purpose"].get().strip()
        self.project_brief["audience"] = self.project_fields["audience"].get().strip()
        runtime = self.project_fields["estimated_runtime_minutes"].get().strip()
        self.project_brief["estimated_runtime_minutes"] = int(runtime) if runtime.isdigit() else 0

        self.project_brief["story_goals"] = text_to_list(self.project_fields["story_goals"].get("1.0", "end"))
        self.project_brief["core_themes"] = text_to_list(self.project_fields["core_themes"].get("1.0", "end"))
        self.project_brief["scope_boundaries"]["in_scope"] = text_to_list(self.project_fields["in_scope"].get("1.0", "end"))
        self.project_brief["scope_boundaries"]["out_of_scope"] = text_to_list(self.project_fields["out_of_scope"].get("1.0", "end"))

        self.project_brief["tone_and_style"]["tone"] = self.project_fields["tone"].get().strip()
        self.project_brief["tone_and_style"]["visual_style"] = self.project_fields["visual_style"].get().strip()
        self.project_brief["tone_and_style"]["reference_titles"] = text_to_list(self.project_fields["reference_titles"].get("1.0", "end"))

        self.project_brief["ethics_and_safety"]["sensitive_topics"] = text_to_list(self.project_fields["sensitive_topics"].get("1.0", "end"))
        self.project_brief["ethics_and_safety"]["consent_requirements"] = text_to_list(self.project_fields["consent_requirements"].get("1.0", "end"))
        self.project_brief["ethics_and_safety"]["risk_mitigation"] = text_to_list(self.project_fields["risk_mitigation"].get("1.0", "end"))

        self.project_brief["production_constraints"]["budget_range"] = self.project_fields["budget_range"].get().strip()
        self.project_brief["production_constraints"]["schedule"] = self.project_fields["schedule"].get().strip()
        self.project_brief["production_constraints"]["locations"] = text_to_list(self.project_fields["locations"].get("1.0", "end"))
        self.project_brief["production_constraints"]["crew_size"] = self.project_fields["crew_size"].get().strip()
        self.project_brief["production_constraints"]["legal_clearances"] = text_to_list(self.project_fields["legal_clearances"].get("1.0", "end"))

        self.project_brief["deliverables"] = text_to_list(self.project_fields["deliverables"].get("1.0", "end"))
        self.project_brief["open_questions"] = text_to_list(self.project_fields["open_questions"].get("1.0", "end"))

        self.subject_profile["subject_name"] = self.subject_fields["subject_name"].get().strip()
        self.subject_profile["preferred_name"] = self.subject_fields["preferred_name"].get().strip()
        self.subject_profile["contact"]["phone"] = self.subject_fields["phone"].get().strip()
        self.subject_profile["contact"]["email"] = self.subject_fields["email"].get().strip()
        self.subject_profile["contact"]["agent_or_rep"] = self.subject_fields["agent_or_rep"].get().strip()

        self.subject_profile["background_summary"] = self.subject_fields["background_summary"].get("1.0", "end").strip()
        self.subject_profile["key_life_events"] = text_to_list(self.subject_fields["key_life_events"].get("1.0", "end"))
        self.subject_profile["values_and_beliefs"] = text_to_list(self.subject_fields["values_and_beliefs"].get("1.0", "end"))
        self.subject_profile["current_challenges"] = text_to_list(self.subject_fields["current_challenges"].get("1.0", "end"))
        self.subject_profile["strengths_and_skills"] = text_to_list(self.subject_fields["strengths_and_skills"].get("1.0", "end"))

        self.subject_profile["sensitive_areas"]["topics_to_avoid"] = text_to_list(self.subject_fields["topics_to_avoid"].get("1.0", "end"))
        self.subject_profile["sensitive_areas"]["phrasing_to_avoid"] = text_to_list(self.subject_fields["phrasing_to_avoid"].get("1.0", "end"))
        self.subject_profile["sensitive_areas"]["trigger_warnings"] = text_to_list(self.subject_fields["trigger_warnings"].get("1.0", "end"))

        self.subject_profile["access_and_availability"]["best_times"] = self.subject_fields["best_times"].get().strip()
        self.subject_profile["access_and_availability"]["preferred_location"] = self.subject_fields["preferred_location"].get().strip()
        self.subject_profile["access_and_availability"]["travel_constraints"] = self.subject_fields["travel_constraints"].get().strip()

        self.subject_profile["consent"]["release_signed"] = bool(self.subject_release_var.get())
        self.subject_profile["consent"]["usage_limits"] = self.subject_fields["usage_limits"].get().strip()
        self.subject_profile["consent"]["anonymity_requests"] = self.subject_fields["anonymity_requests"].get().strip()

        self.subject_profile["pre_interview_notes"] = text_to_list(self.subject_fields["pre_interview_notes"].get("1.0", "end"))
        self.subject_profile["ai_intake_summary"] = self.subject_fields["ai_intake_summary"].get("1.0", "end").strip()

        self.interview_guide["project_name"] = self.guide_fields["project_name"].get().strip()
        self.interview_guide["interview_date"] = self.guide_fields["interview_date"].get().strip()
        self.interview_guide["location"] = self.guide_fields["location"].get().strip()
        self.interview_guide["interviewer"] = self.guide_fields["interviewer"].get().strip()
        self.interview_guide["director_notes"] = self.guide_fields["director_notes"].get("1.0", "end").strip()

        self.director_notes["story_arc"] = self.director_fields["story_arc"].get("1.0", "end").strip()
        self.director_notes["scene_beats"] = text_to_list(self.director_fields["scene_beats"].get("1.0", "end"))
        self.director_notes["visual_motifs"] = text_to_list(self.director_fields["visual_motifs"].get("1.0", "end"))
        self.director_notes["risks_and_ethics"] = text_to_list(self.director_fields["risks_and_ethics"].get("1.0", "end"))
        self.director_notes["consent_notes"] = self.director_fields["consent_notes"].get("1.0", "end").strip()
        self.director_notes["production_notes"] = self.director_fields["production_notes"].get("1.0", "end").strip()
        self.director_notes["open_questions"] = text_to_list(self.director_fields["open_questions"].get("1.0", "end"))

        self.session["project_brief"] = self.project_brief
        self.session["subject_profile"] = self.subject_profile
        self.session["interview_guide"] = self.interview_guide
        self.session["director_producer"] = self.director_notes

    def populate_project_brief_fields(self):
        self.project_fields["project_name"].set(self.project_brief.get("project_name", ""))
        self.project_fields["working_title"].set(self.project_brief.get("working_title", ""))
        self.project_fields["logline"].set(self.project_brief.get("logline", ""))
        self.project_fields["purpose"].set(self.project_brief.get("purpose", ""))
        self.project_fields["audience"].set(self.project_brief.get("audience", ""))
        self.project_fields["estimated_runtime_minutes"].set(str(self.project_brief.get("estimated_runtime_minutes", 0)))

        self.project_fields["story_goals"].delete("1.0", "end")
        self.project_fields["story_goals"].insert("1.0", list_to_text(self.project_brief.get("story_goals", [])))
        self.project_fields["core_themes"].delete("1.0", "end")
        self.project_fields["core_themes"].insert("1.0", list_to_text(self.project_brief.get("core_themes", [])))

        scope = self.project_brief.get("scope_boundaries", {})
        self.project_fields["in_scope"].delete("1.0", "end")
        self.project_fields["in_scope"].insert("1.0", list_to_text(scope.get("in_scope", [])))
        self.project_fields["out_of_scope"].delete("1.0", "end")
        self.project_fields["out_of_scope"].insert("1.0", list_to_text(scope.get("out_of_scope", [])))

        tone = self.project_brief.get("tone_and_style", {})
        self.project_fields["tone"].set(tone.get("tone", ""))
        self.project_fields["visual_style"].set(tone.get("visual_style", ""))
        self.project_fields["reference_titles"].delete("1.0", "end")
        self.project_fields["reference_titles"].insert("1.0", list_to_text(tone.get("reference_titles", [])))

        ethics = self.project_brief.get("ethics_and_safety", {})
        self.project_fields["sensitive_topics"].delete("1.0", "end")
        self.project_fields["sensitive_topics"].insert("1.0", list_to_text(ethics.get("sensitive_topics", [])))
        self.project_fields["consent_requirements"].delete("1.0", "end")
        self.project_fields["consent_requirements"].insert("1.0", list_to_text(ethics.get("consent_requirements", [])))
        self.project_fields["risk_mitigation"].delete("1.0", "end")
        self.project_fields["risk_mitigation"].insert("1.0", list_to_text(ethics.get("risk_mitigation", [])))

        constraints = self.project_brief.get("production_constraints", {})
        self.project_fields["budget_range"].set(constraints.get("budget_range", ""))
        self.project_fields["schedule"].set(constraints.get("schedule", ""))
        self.project_fields["locations"].delete("1.0", "end")
        self.project_fields["locations"].insert("1.0", list_to_text(constraints.get("locations", [])))
        self.project_fields["crew_size"].set(constraints.get("crew_size", ""))
        self.project_fields["legal_clearances"].delete("1.0", "end")
        self.project_fields["legal_clearances"].insert("1.0", list_to_text(constraints.get("legal_clearances", [])))

        self.project_fields["deliverables"].delete("1.0", "end")
        self.project_fields["deliverables"].insert("1.0", list_to_text(self.project_brief.get("deliverables", [])))
        self.project_fields["open_questions"].delete("1.0", "end")
        self.project_fields["open_questions"].insert("1.0", list_to_text(self.project_brief.get("open_questions", [])))

    def populate_subject_profile_fields(self):
        self.subject_fields["subject_name"].set(self.subject_profile.get("subject_name", ""))
        self.subject_fields["preferred_name"].set(self.subject_profile.get("preferred_name", ""))
        contact = self.subject_profile.get("contact", {})
        self.subject_fields["phone"].set(contact.get("phone", ""))
        self.subject_fields["email"].set(contact.get("email", ""))
        self.subject_fields["agent_or_rep"].set(contact.get("agent_or_rep", ""))

        self.subject_fields["background_summary"].delete("1.0", "end")
        self.subject_fields["background_summary"].insert("1.0", self.subject_profile.get("background_summary", ""))
        self.subject_fields["key_life_events"].delete("1.0", "end")
        self.subject_fields["key_life_events"].insert("1.0", list_to_text(self.subject_profile.get("key_life_events", [])))
        self.subject_fields["values_and_beliefs"].delete("1.0", "end")
        self.subject_fields["values_and_beliefs"].insert("1.0", list_to_text(self.subject_profile.get("values_and_beliefs", [])))
        self.subject_fields["current_challenges"].delete("1.0", "end")
        self.subject_fields["current_challenges"].insert("1.0", list_to_text(self.subject_profile.get("current_challenges", [])))
        self.subject_fields["strengths_and_skills"].delete("1.0", "end")
        self.subject_fields["strengths_and_skills"].insert("1.0", list_to_text(self.subject_profile.get("strengths_and_skills", [])))

        sensitive = self.subject_profile.get("sensitive_areas", {})
        self.subject_fields["topics_to_avoid"].delete("1.0", "end")
        self.subject_fields["topics_to_avoid"].insert("1.0", list_to_text(sensitive.get("topics_to_avoid", [])))
        self.subject_fields["phrasing_to_avoid"].delete("1.0", "end")
        self.subject_fields["phrasing_to_avoid"].insert("1.0", list_to_text(sensitive.get("phrasing_to_avoid", [])))
        self.subject_fields["trigger_warnings"].delete("1.0", "end")
        self.subject_fields["trigger_warnings"].insert("1.0", list_to_text(sensitive.get("trigger_warnings", [])))

        access = self.subject_profile.get("access_and_availability", {})
        self.subject_fields["best_times"].set(access.get("best_times", ""))
        self.subject_fields["preferred_location"].set(access.get("preferred_location", ""))
        self.subject_fields["travel_constraints"].set(access.get("travel_constraints", ""))

        consent = self.subject_profile.get("consent", {})
        self.subject_release_var.set(bool(consent.get("release_signed", False)))
        self.subject_fields["usage_limits"].set(consent.get("usage_limits", ""))
        self.subject_fields["anonymity_requests"].set(consent.get("anonymity_requests", ""))

        self.subject_fields["pre_interview_notes"].delete("1.0", "end")
        self.subject_fields["pre_interview_notes"].insert("1.0", list_to_text(self.subject_profile.get("pre_interview_notes", [])))
        self.subject_fields["ai_intake_summary"].delete("1.0", "end")
        self.subject_fields["ai_intake_summary"].insert("1.0", self.subject_profile.get("ai_intake_summary", ""))

    def populate_interview_guide_fields(self):
        self.guide_fields["project_name"].set(self.interview_guide.get("project_name", ""))
        self.guide_fields["interview_date"].set(self.interview_guide.get("interview_date", ""))
        self.guide_fields["location"].set(self.interview_guide.get("location", ""))
        self.guide_fields["interviewer"].set(self.interview_guide.get("interviewer", ""))
        self.guide_fields["director_notes"].delete("1.0", "end")
        self.guide_fields["director_notes"].insert("1.0", self.interview_guide.get("director_notes", ""))

        self.refresh_section_list()

    def populate_director_notes_fields(self):
        self.director_fields["story_arc"].delete("1.0", "end")
        self.director_fields["story_arc"].insert("1.0", self.director_notes.get("story_arc", ""))
        self.director_fields["scene_beats"].delete("1.0", "end")
        self.director_fields["scene_beats"].insert("1.0", list_to_text(self.director_notes.get("scene_beats", [])))
        self.director_fields["visual_motifs"].delete("1.0", "end")
        self.director_fields["visual_motifs"].insert("1.0", list_to_text(self.director_notes.get("visual_motifs", [])))
        self.director_fields["risks_and_ethics"].delete("1.0", "end")
        self.director_fields["risks_and_ethics"].insert("1.0", list_to_text(self.director_notes.get("risks_and_ethics", [])))
        self.director_fields["consent_notes"].delete("1.0", "end")
        self.director_fields["consent_notes"].insert("1.0", self.director_notes.get("consent_notes", ""))
        self.director_fields["production_notes"].delete("1.0", "end")
        self.director_fields["production_notes"].insert("1.0", self.director_notes.get("production_notes", ""))
        self.director_fields["open_questions"].delete("1.0", "end")
        self.director_fields["open_questions"].insert("1.0", list_to_text(self.director_notes.get("open_questions", [])))

    def refresh_section_list(self):
        self.section_list.delete(0, "end")
        for section in self.interview_guide.get("sections", []):
            title = section.get("section_title", "Untitled")
            self.section_list.insert("end", title)

    def on_section_select(self, event=None):
        idx = self.get_selected_section_index()
        if idx is None:
            return
        section = self.interview_guide.get("sections", [])[idx]
        self.section_fields["section_title"].set(section.get("section_title", ""))
        self.section_fields["intent"].set(section.get("intent", ""))
        self.section_fields["primary_questions"].delete("1.0", "end")
        self.section_fields["primary_questions"].insert("1.0", list_to_text(section.get("primary_questions", [])))
        self.section_fields["follow_ups"].delete("1.0", "end")
        self.section_fields["follow_ups"].insert("1.0", list_to_text(section.get("follow_ups", [])))

    def add_section(self):
        section = {
            "section_title": self.section_fields["section_title"].get().strip() or "New section",
            "intent": self.section_fields["intent"].get().strip(),
            "primary_questions": text_to_list(self.section_fields["primary_questions"].get("1.0", "end")),
            "follow_ups": text_to_list(self.section_fields["follow_ups"].get("1.0", "end"))
        }
        self.interview_guide.setdefault("sections", []).append(section)
        self.refresh_section_list()
        self.section_list.selection_clear(0, "end")
        self.section_list.selection_set("end")

    def update_section(self):
        idx = self.get_selected_section_index()
        if idx is None:
            messagebox.showinfo(APP_TITLE, "Select a section to update.")
            return
        section = self.interview_guide["sections"][idx]
        section["section_title"] = self.section_fields["section_title"].get().strip()
        section["intent"] = self.section_fields["intent"].get().strip()
        section["primary_questions"] = text_to_list(self.section_fields["primary_questions"].get("1.0", "end"))
        section["follow_ups"] = text_to_list(self.section_fields["follow_ups"].get("1.0", "end"))
        self.refresh_section_list()
        self.section_list.selection_set(idx)

    def remove_section(self):
        idx = self.get_selected_section_index()
        if idx is None:
            return
        del self.interview_guide["sections"][idx]
        self.refresh_section_list()

    def ai_summarize_subject(self):
        answers = self.collect_answer_text()
        if not answers:
            messagebox.showinfo(APP_TITLE, "Answer a few questions first.")
            return
        model = self.model_var.get().strip() or DEFAULT_MODEL
        prompt = (
            "You are a documentary researcher. "
            "Summarize the subject into JSON with keys: "
            "background_summary (string), key_life_events (array), "
            "values_and_beliefs (array), current_challenges (array), strengths_and_skills (array). "
            "Return only valid JSON.\n\n"
            f"Interview notes:\n{answers}"
        )
        self.status_var.set("Summarizing subject...")
        self.root.update_idletasks()
        try:
            response = call_ollama(model, prompt)
            payload = json.loads(response)
        except Exception as exc:
            messagebox.showerror(APP_TITLE, f"AI summary failed: {exc}")
            self.status_var.set("Ready")
            return

        self.subject_profile["background_summary"] = payload.get("background_summary", "")
        self.subject_profile["key_life_events"] = payload.get("key_life_events", [])
        self.subject_profile["values_and_beliefs"] = payload.get("values_and_beliefs", [])
        self.subject_profile["current_challenges"] = payload.get("current_challenges", [])
        self.subject_profile["strengths_and_skills"] = payload.get("strengths_and_skills", [])
        self.populate_subject_profile_fields()
        self.status_var.set("Subject summary updated")

    def ai_build_guide(self):
        self.sync_all_fields_to_data()
        model = self.model_var.get().strip() or DEFAULT_MODEL
        prompt = (
            "You are a documentary interview producer. "
            "Create an interview guide with 4-6 sections. "
            "Return only a JSON array of sections, each with: "
            "section_title, intent, primary_questions (array), follow_ups (array).\n\n"
            f"Project brief: {json.dumps(self.project_brief)}\n"
            f"Subject profile: {json.dumps(self.subject_profile)}"
        )
        self.status_var.set("Building guide...")
        self.root.update_idletasks()
        try:
            response = call_ollama(model, prompt)
            sections = json.loads(response)
        except Exception as exc:
            messagebox.showerror(APP_TITLE, f"AI guide failed: {exc}")
            self.status_var.set("Ready")
            return

        if isinstance(sections, list):
            self.interview_guide["sections"] = sections
            self.refresh_section_list()
            self.status_var.set("Guide updated")
        else:
            messagebox.showinfo(APP_TITLE, "AI response was not a section list.")
            self.status_var.set("Ready")

    def collect_answer_text(self):
        parts = []
        for item in self.questions:
            answer = item.get("answer", "").strip()
            if not answer:
                continue
            parts.append(f"Q: {item.get('question','')}\nA: {answer}")
        return "\n\n".join(parts)


def main():
    root = tk.Tk()
    root.option_add("*Font", "Segoe UI 11")
    style = ttk.Style(root)
    if os.name == "nt":
        style.theme_use("vista")
    app = InterviewApp(root)
    root.mainloop()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        sys.exit(0)
