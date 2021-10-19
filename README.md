# tooru
A booru, except for text.

## Todos
> 📦 — check npm for readymades

### Backend
- config file 📦
    - connection details
    - schema details for integrity check
- mariadb
    - install 
    - connection boilerplate
- integrity check 📦
    - connection check
    - db check
    - table checks
        - schema checks

### Frontend
- Admin view
    - integrity check results
- User view
    - all pages overview
    - single page
    - editor 📦 *Quill.js*
        - MVP: form with textarea, page selector augmented with "\[New Page\]"

## Lore
Schema:
- Pages
    - id (int) *PK*
    - title (varch 80)
    - lead (varch 280)
    - body (standard 64k text)
- Taggings | ∞-∞
    - tag (varch 80) *PK*
    - pageid (Pages FK) *PK*
- PageRelationTypes
    - name *PK*
- PageRelations
    - id (int) *PK*
    - pageid_from (Pages FK)
    - relation_type (PageRelationType FK)
    - pageid_to (Pages FK)

### Pages
The building block of a tooru stash is a *page*, with defined name, lead, and body. The page can be either plaintext or Markdown. (HTML was a mistake.)

### Tags
A page can have *tags*. All tags are created equal, for now at least. Any relationship between tags (parent-child, restriction from user and to backend, etc.) would be defined in a separate schema.

In terms of danbooru-style tags (features vs IP's vs authors vs charas), this does imply that two tags of same text but different categories cannot exist. When added later, one can do syntax like `:type:body` for backwards compat.

### Page relations
One page can be a precedessor, successor, parent or child of another.

