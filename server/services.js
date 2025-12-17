const fs = require('fs');
const path = require('path');

const dbFile = path.join(__dirname, 'files', 'library.json');

function readDB() {
  const text = fs.readFileSync(dbFile, 'utf8');
  return JSON.parse(text);
}

function writeDB(data) {
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2), 'utf8');
}

function normalize(v) {
  return String(v ?? '').toLowerCase().trim();
}

function sortByField(arr, field, dir) {
  const direction = (dir && String(dir).toLowerCase() === 'desc') ? -1 : 1;
  const f = String(field || '').trim();

  if (!f) return arr;

  return arr.slice().sort((a, b) => {
    const av = a[f];
    const bv = b[f];

    // numeric compare for yearPublished when possible
    if (f === 'yearPublished') {
      const an = Number(av);
      const bn = Number(bv);
      if (!Number.isNaN(an) && !Number.isNaN(bn)) return (an - bn) * direction;
    }

    return normalize(av).localeCompare(normalize(bv)) * direction;
  });
}

module.exports = function (app) {

  // READ ALL (optional sort)
  // GET /library/read-records?sortField=author&sortDir=asc
  app.get('/library/read-records', (req, res) => {
    try {
      const data = readDB();
      const sorted = sortByField(data, req.query.sortField, req.query.sortDir);
      res.json({ msg: 'SUCCESS', libraryData: sorted });
    } catch (err) {
      res.status(500).json({ msg: 'ERROR', error: err.message });
    }
  });

  // GET BY TYPE (author or publisher) (optional sort)
  // GET /library/get-by-type?typeField=author&typeValue=Edwin&sortField=title&sortDir=asc
  app.get('/library/get-by-type', (req, res) => {
    try {
      const typeField = String(req.query.typeField || '').trim(); // author or publisher
      const typeValue = String(req.query.typeValue || '').trim();

      if (!typeField || !typeValue) {
        return res.status(400).json({ msg: 'ERROR', error: 'Missing typeField or typeValue.' });
      }

      const data = readDB();
      const filtered = data.filter(r => normalize(r[typeField]).includes(normalize(typeValue)));
      const sorted = sortByField(filtered, req.query.sortField, req.query.sortDir);

      res.json({ msg: 'SUCCESS', libraryData: sorted });
    } catch (err) {
      res.status(500).json({ msg: 'ERROR', error: err.message });
    }
  });

  // WRITE ONE (SAVE)
  // POST /library/write-record
  app.post('/library/write-record', (req, res) => {
    try {
      const rec = req.body;

      if (!rec.title || !rec.author || !rec.publisher || rec.yearPublished === undefined || !rec.isbn) {
        return res.status(400).json({ msg: 'ERROR', error: 'Missing required field(s).' });
      }

      const data = readDB();

      let nextId = 1;
      if (data.length > 0) {
        nextId = Math.max(...data.map(r => Number(r.id) || 0)) + 1;
      }

      const newRecord = {
        id: nextId,
        title: String(rec.title).trim(),
        author: String(rec.author).trim(),
        publisher: String(rec.publisher).trim(),
        yearPublished: Number(rec.yearPublished),
        isbn: String(rec.isbn).trim()
      };

      data.push(newRecord);
      writeDB(data);

      res.json({ msg: 'SUCCESS', id: nextId });
    } catch (err) {
      res.status(500).json({ msg: 'ERROR', error: err.message });
    }
  });

  // DELETE ONE
  // DELETE /library/delete-record  body: { id: 3 }
  app.delete('/library/delete-record', (req, res) => {
    try {
      const { id } = req.body;
      if (id === undefined || id === null || id === '') {
        return res.status(400).json({ msg: 'ERROR', error: 'Missing id' });
      }

      const data = readDB();
      const idx = data.findIndex(r => String(r.id) === String(id));
      if (idx === -1) {
        return res.status(404).json({ msg: 'ERROR', error: 'Record not found' });
      }

      data.splice(idx, 1);
      writeDB(data);

      res.json({ msg: 'SUCCESS' });
    } catch (err) {
      res.status(500).json({ msg: 'ERROR', error: err.message });
    }
  });

  // UPDATE ONE
  // PUT /library/update-record  body: { id, title, author, publisher, yearPublished, isbn }
  app.put('/library/update-record', (req, res) => {
    try {
      const rec = req.body;
      if (!rec || rec.id === undefined || rec.id === null || rec.id === '') {
        return res.status(400).json({ msg: 'ERROR', error: 'Missing id' });
      }

      const data = readDB();
      const idx = data.findIndex(r => String(r.id) === String(rec.id));
      if (idx === -1) {
        return res.status(404).json({ msg: 'ERROR', error: 'Record not found' });
      }

      // Keep it simple: overwrite fields if provided
      data[idx].title = (rec.title !== undefined) ? String(rec.title).trim() : data[idx].title;
      data[idx].author = (rec.author !== undefined) ? String(rec.author).trim() : data[idx].author;
      data[idx].publisher = (rec.publisher !== undefined) ? String(rec.publisher).trim() : data[idx].publisher;
      data[idx].yearPublished = (rec.yearPublished !== undefined) ? Number(rec.yearPublished) : data[idx].yearPublished;
      data[idx].isbn = (rec.isbn !== undefined) ? String(rec.isbn).trim() : data[idx].isbn;

      writeDB(data);

      res.json({ msg: 'SUCCESS' });
    } catch (err) {
      res.status(500).json({ msg: 'ERROR', error: err.message });
    }
  });

};
