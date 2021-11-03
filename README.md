# tooru
A booru, except for text.

## Todos
> 📦 — check npm for readymades

### Backend
- config file 📦
    - connection details
    - schema details for integrity check
- sort out router/view structure
- add page
    - `SELECT COUNT(1) AS dupes FROM pages WHERE time=?;`
    - `"INSERT INTO pages VALUE (?, ?, ?, ?, ?)", [id, time, title, lead, body]`
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

## Schema

- Pages
    - id (varch 17) *PK*
    - time (varch 13)
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
```
CREATE TABLE pages (
    id VARCHAR(17) NOT NULL PRIMARY KEY,
    time VARCHAR(13) NOT NULL,
    title VARCHAR(80),
    lead VARCHAR(280),
    body TEXT
);
CREATE TABLE taggings (
    tag VARCHAR(80) NOT NULL,
    pageid VARCHAR(17) NOT NULL,
    PRIMARY KEY(tag, pageid),
    FOREIGN KEY (pageid) REFERENCES pages(id)
);
```

### Pages
The building block of a tooru stash is a *page*, with defined name, lead, and body. The page can be either plaintext or Markdown. (HTML was a mistake.)

The page's id is deterministic wrt time of creation and number of id's created in the same millisecond (sic - better safe yadda yadda) and totals 17 digits, separated 
into 4 threes and the rest, i.e. 5 digits. Least significant digit in the section goes to the right, least significant section goes to the left, like this: `lmn-ijk-fgh-abcde`
It doesn't get another digit until the 24th century or so, chill.
The id should be exposed by frontend only to the necessary extent and hidden until there's a collision to resolve between single- (or any less than whole) -section portions of the id.

The generated id has 3 forms:

- int, e.g. `16358803320355` - filename for blobs, sortable
- string, e.g. `355-320-803-16358` - db pk
- list, e.g. `[355, 320, 803, 16358]` - for frontend

### Tags
A page can have *tags*. All tags are created equal, for now at least. Any relationship between tags (parent-child, restriction from user and to backend, etc.) would be defined in a separate schema.

In terms of danbooru-style tags (features vs IP's vs authors vs charas), this does imply that two tags of same text but different categories cannot exist. When added later, one can do syntax like `:type:body` for backwards compat.

### Page relations
One page can be a precedessor, successor, parent or child of another.

Consider the use-case of a CYOA serial. A page can have a precedessor, multiple non-unique successors, with one of them duplicated as the canonical successor, and potentially a parent page, common to all story pages.

## Rough notes

These ideas can be expanded upon and added to the "official" part or deleted if discovered to be a deadend.

- Frontend
    - Quick goto modal
    - Keyboard-only navigation
    - Mouse-only navigation
- Schema
    - Page aliases
        - Support moving alias to point to another page
    - Page shortcuts
        - Few characters long
        - To go with the quick goto
- Features
    - Analytics
        - Most visited pages can be suggested for adding a shortcut
    - Special pages
        - Versioned pages
        - Binned pages
    - Edition
        - Save As, Save Copy, Make Versioned
