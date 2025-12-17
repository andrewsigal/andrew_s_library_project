const libraryData = [];
// Fetch data from server and populate table
async function retrieveData(){
  const res = await fetch("http://localhost:5000/library/read-records");
  const data = await res.json();
  createTable(data.libraryData);
}
// data: array of records
function createTable(data){
  let html="";
  data.forEach(r=>{
    html+=`<tr>
    <td>${r.title}</td>
    <td>${r.author}</td>
    <td>${r.publisher}</td>
    <td>${r.yearPublished}</td>
    <td>${r.isbn}</td>
    <td><button class="delete-button" data-id="${r.id}">DELETE</button></td>
    </tr>`;
  });
  document.getElementById("tableBody").innerHTML = html;
  activateDelete();
}
// Set up delete button handlers
function activateDelete(){
  document.querySelectorAll(".delete-button").forEach(btn=>{
    btn.onclick = ()=>{
      handleDelete(btn.dataset.id);
    };
  });
}
// Handle delete action
async function handleDelete(id){
  const res = await fetch("http://localhost:5000/library/delete-record",{
    method:"DELETE",
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({id})
  });
  if(res.ok){
    retrieveData();
  }else{
    alert("Delete failed");
  }
}

window.onload = retrieveData;
