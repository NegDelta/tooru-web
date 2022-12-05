CREATE TABLE pages (
    id VARCHAR(17) NOT NULL PRIMARY KEY,
    time VARCHAR(13) NOT NULL,
    edit_time VARCHAR(13) NOT NULL,
    title VARCHAR(80),
    lead VARCHAR(280),
    body TEXT  
);
