import re

with open("SYSTEM_STATE.md", "r") as f:
    content = f.read()

content = re.sub(
    r"\*\*Current Iteration:\*\*.*",
    "**Current Iteration:** 16",
    content
)
content = re.sub(
    r"\*\*Current Phase:\*\*.*",
    "**Current Phase:** COMPLETE",
    content
)

content += "| 12 | Research | TBD | Re-orientated backend architecture into monorepo structure. |\n"
content += "| 12 | Build | TBD | Initialized React, Vite, Tailwind CSS monorepo architecture. |\n"
content += "| 13 | Build | TBD | Built Dashboard Layout and Intelligence Overview UI. |\n"
content += "| 14 | Build | TBD | Built Opportunity Blueprints list and detailed breakdown view. |\n"
content += "| 15 | Build | TBD | Built Warm Lead CRM View with intent scoring and tables. |\n"
content += "| 16 | QA Audit | TBD | Final Playwright verification of all frontend routes. Project is completely finished. |\n"

with open("SYSTEM_STATE.md", "w") as f:
    f.write(content)
