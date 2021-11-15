# tooru
A booru, except for text. In fact, this is another run-of-the-mill study-CRUD-wiki app, the most fitting of the three being the study part, in that the two primary reasons for developing the app are to provide a useful tool and to provide experience with the tools used, including MariaDB for the database part, as well as the design process for a piece of software.

## What it's all about

### Pages
The building block of a tooru stash is a *page*, with defined name, lead, and body.

The page's id is deterministic wrt time of creation and number of id's created in the same millisecond (sic - better safe yadda yadda) and totals 17 digits, separated 
into 4 threes and the rest, i.e. 5 digits. Least significant digit in the section goes to the right, least significant section goes to the left, like this: `lmn-ijk-fgh-abcde`
It doesn't get another digit until the 24th century or so, chill.
Ideally, the id should be exposed by frontend only to the necessary extent and hidden until there's a collision to resolve between single- (or any less than whole) -section portions of the id.

The generated id has 3 forms:

- int, e.g. `16358803320355` - filename for blobs, sortable
- string, e.g. `355-320-803-16358` - db pk
- list, e.g. `[355, 320, 803, 16358]` - for frontend

## Setup

### MariaDB
Version 10.5 is required.

The following table setup is used:
```sql
CREATE TABLE pages (
    id VARCHAR(17) NOT NULL PRIMARY KEY,
    time VARCHAR(13) NOT NULL,
    title VARCHAR(80),
    lead VARCHAR(280),
    body TEXT
);
```

### `config.js`
Besides the usual npm dance and MariaDB setup, one must include a `config.js` file in the module's root folder (that is, the same that contains `app.js`), with the following structure:
```js
module.exports = {
    url_root: '/path/to/app/',
    dbpool: {
        host: 'hostname.example', 
        user: 'db_user', 
        password: 'db_password',
        database: 'database_name',
        connectionLimit: 5,
        connectTimeout: 4000,
    }
}
```

## Immediate to-dos
- Edit page
    - Db: column for last edit time
- Delete page

## Long-term to-dos
Some ideas are more fleshed-out that the others. Glitter ✨ is for the parts that will most likely see work next.

### ✨ Tags
A page can have *tags*. All tags are created equal, for now at least. Any relationship between tags (parent-child, restriction from user and to backend, etc.) would be defined in a separate schema.

In terms of danbooru-style tags (features vs IP's vs authors vs charas), this does imply that two tags of same text but different categories cannot exist. When added later, one can do syntax like `:type:body` for backwards compat.

Schema:
```sql
CREATE TABLE taggings (
    tag VARCHAR(80) NOT NULL,
    pageid VARCHAR(17) NOT NULL,
    PRIMARY KEY(tag, pageid),
    FOREIGN KEY (pageid) REFERENCES pages(id)
);
```

### Special pages
Rather special cases than MediaWiki-style special. That's because the latter would likely quickly turn out to be a security nightmare.

- Tracked pages
    - When editing or deleting a tracked page, its previous version is saved as a snapshot. The snapshot itself is not editable. The relevant details can be made visible in a pagetype-specific metadata section.
- Serials
    - One page can be a precedessor, successor, parent or child of another.
    - Consider the use-case of a CYOA serial. A page can have a precedessor, multiple non-unique successors, with one of them duplicated as the canonical successor, and potentially a parent page, common to all story pages.

### Others
- Validate input to disallow (or at least prompt for confirmation) completely empty pages
- Sort and filter pages
    - ✨ by time, by default
- ✨ Use the `nconf` or `config` package to verify existence and structure of the config file
    - Report any problems in console
- ✨ Check database for specified tables and columns 
    - Run checks in an admin route and report any problems in-app
- Actual npm magic around versions and changes
- Use Quill.js for page editor
- Rendering options
    - All newlines are paragraph breaks, y/n
    - Collapse newlines
    - Plaintext vs Markdown
    - Preprocessing
- Keyboard-only navigation with one-key shortcuts
- Analytics
- Page metadata
    - Written-in description
    - Dates of creation, last edition, etc.
- File-like flow of page state
    - Save As
    - Save Copy
- Page shortcuts
    - Few characters long
    - To go with the quick goto
- Serialization and deserialization. That is, making and loading backups
