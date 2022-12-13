# tooru-web

Web interface for `tooru`, decoupled and forked therefrom.

## To-dos

Legend:

- ✨ — will most likely see work next
- 📞 — might be implemented at backend

### Immediate

- Frontend library (React)
- CSS preprocessing
- Bundler

### Long-term

- Validate input to disallow (or at least prompt for confirmation) completely empty pages
- 📞 Sort and filter pages
- Actual `npm` magic around versions and changes
- Use Quill.js for page editor
- 📞 Rendering options
  - All newlines are paragraph breaks, y/n
  - Collapse newlines
  - Plaintext vs Markdown
  - Preprocessing
- Keyboard-only navigation with one-key shortcuts
- 📞 Analytics
- File-like flow of page state
  - Save As
  - Duplicate
- 📞 Page shortcuts
  - Few characters long
  - To go with the quick goto
- ✨ Verify existence and structure of `config.json`
  - Report any problems in console
