const fs = require('fs');
const path = require('path');
// Path to JSON database file
const dbFile = path.join(__dirname,'files','library.json');
// Read database
function readDB(){
  const text = fs.readFileSync(dbFile,'utf8');
  return JSON.parse(text);
}
// Write database
function writeDB(data){
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = function(app){


  app.get('/library/read-records',(req,res)=>{
    try{
      const data = readDB();
      res.json({msg:'SUCCESS', libraryData:data});
    }catch(err){
      res.status(500).json({msg:'ERROR', error: err.message});
    }
  });

  // SAVE
  app.post('/library/write-record',(req,res)=>{
    try{
      const rec = req.body;

      // required fields
      if(!rec.title || !rec.author || !rec.publisher || rec.yearPublished === undefined || !rec.isbn){
        res.status(400).json({msg:'ERROR', error:'Missing required field(s).'});
        return;
      }

      const data = readDB();

      // next id
      let nextId = 1;
      if(data.length > 0){
        nextId = Math.max(...data.map(r => Number(r.id) || 0)) + 1;
      }
      // create new record
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
    
      res.json({msg:'SUCCESS', id: nextId});
    }catch(err){
      res.status(500).json({msg:'ERROR', error: err.message});
    }
  });

  // DELETE
  app.delete('/library/delete-record',(req,res)=>{
    try{
      const {id} = req.body;
      if(id === undefined || id === null || id === ''){
        res.status(400).json({msg:'ERROR', error:'Missing id'});
        return;
      }
      // Read data
      const data = readDB();
      const idx = data.findIndex(r => String(r.id) === String(id));
      if(idx === -1){
        res.status(404).json({msg:'ERROR', error:'Record not found'});
        return;
      }
      // Remove record
      data.splice(idx, 1);
      writeDB(data);
      
      res.json({msg:'SUCCESS'});
    }catch(err){
      res.status(500).json({msg:'ERROR', error: err.message});
    }
  });

};
