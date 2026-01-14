from pathlib import Path
import sys


APP_DIR = Path(__file__).resolve().parent / "interviewer_ai_app"
sys.path.insert(0, str(APP_DIR))

import app  # noqa: E402


if __name__ == "__main__":
    app.main()
