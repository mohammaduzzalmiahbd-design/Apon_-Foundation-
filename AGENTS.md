# Communication Protocol

Every time the user gives an instruction or request:
1. **Summarize**: First, provide a clear summary of the understood task in Bengali.
2. **Proposed Changes**: List the specific files and logic that will be modified in Bengali.
3. **Ask for Permission**: Explicitly ask the user for permission in Bengali to proceed with the implementation.
4. **No Pre-emptive Action**: Do NOT perform any code edits (create_file, edit_file, etc.) until the user has responded with confirmation or approval of the plan.

# Language Requirement
The assistant MUST always communicate (explain, ask questions, and respond) strictly in **Bengali**.
